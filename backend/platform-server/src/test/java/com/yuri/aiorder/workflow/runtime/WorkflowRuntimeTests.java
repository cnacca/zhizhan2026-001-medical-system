package com.yuri.aiorder.workflow.runtime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.UserRole;
import com.yuri.aiorder.common.auth.BearerTokenService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.StreamSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class WorkflowRuntimeTests {

    private static final long DOCTOR_USER_ID = 9501L;
    private static final long WORKER_USER_ID = 9601L;
    private static final long OTHER_WORKER_USER_ID = 9602L;

    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BearerTokenService tokenService;

    private long orderId;
    private long chainId;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().replace("-", "");
        String clinicName = "工序运行诊所-" + suffix;
        String orderNo = "WR" + suffix.substring(0, 12);

        jdbcClient.sql("INSERT INTO clinic (clinic_name) VALUES (:clinicName)")
                .param("clinicName", clinicName)
                .update();
        long clinicId = jdbcClient.sql("SELECT clinic_id FROM clinic WHERE clinic_name = :clinicName")
                .param("clinicName", clinicName)
                .query(Long.class)
                .single();

        jdbcClient.sql("""
                        INSERT INTO orders
                            (order_no, clinic_id, doctor_user_id, product_type,
                             internal_status, external_status, branch_params)
                        VALUES
                            (:orderNo, :clinicId, :doctorUserId, 'RUNTIME_TEST',
                             'PENDING_PRODUCTION_REVIEW', 'PENDING_REVIEW', JSON_OBJECT('route', 'X'))
                        """)
                .param("orderNo", orderNo)
                .param("clinicId", clinicId)
                .param("doctorUserId", DOCTOR_USER_ID)
                .update();
        orderId = jdbcClient.sql("SELECT order_id FROM orders WHERE order_no = :orderNo")
                .param("orderNo", orderNo)
                .query(Long.class)
                .single();

        chainId = createRuntimeTestChain(suffix);
    }

    @Test
    void productionReviewInstantiatesSnapshotAndPreservesItFromTemplateChanges() throws Exception {
        long instanceId = approveProductionAndGetInstanceId();

        assertThat(instanceStatus(instanceId)).isEqualTo("ACTIVE");
        assertThat(nodeCount(instanceId)).isEqualTo(5L);
        assertThat(edgeCount(instanceId)).isEqualTo(5L);
        assertThat(nodeStatus(instanceId, "START")).isEqualTo("READY");
        assertThat(nodeStatus(instanceId, "PARALLEL_B")).isEqualTo("PENDING");
        assertThat(nodeStatus(instanceId, "OPTIONAL_C")).isEqualTo("PENDING");
        assertThat(nodeStatus(instanceId, "JOIN_D")).isEqualTo("PENDING");
        assertThat(nodeStatus(instanceId, "ROUTE_X")).isEqualTo("PENDING");
        assertThat(nodeStatusOrNull(instanceId, "ROUTE_Y")).isNull();

        jdbcClient.sql("""
                        UPDATE workflow_node
                        SET process_name = '模板已改名'
                        WHERE chain_id = :chainId
                          AND node_code = 'START'
                        """)
                .param("chainId", chainId)
                .update();

        mockMvc.perform(get("/orders/{orderId}/process-instance", orderId)
                        .header("X-Bootstrap-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.instance_id").value(instanceId))
                .andExpect(jsonPath("$.data.intake_branch_used").value("SCAN"))
                .andExpect(jsonPath("$.data.nodes", hasSize(5)))
                .andExpect(jsonPath("$.data.nodes[0].node_category").value("PRODUCTION"))
                .andExpect(jsonPath("$.data.nodes[4].branch_key").value("X"))
                .andExpect(content().string(not(org.hamcrest.Matchers.containsString("模板已改名"))));

        mockMvc.perform(get("/orders/{orderId}/process-instance", orderId)
                        .header("X-Bootstrap-Role", "DOCTOR")
                        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID))
                .andExpect(status().isForbidden());
    }

    @Test
    void productionReviewBridgesAcrossAnUnselectedBranchNode() throws Exception {
        jdbcClient.sql("DELETE FROM workflow_edge WHERE chain_id = :chainId")
                .param("chainId", chainId)
                .update();
        jdbcClient.sql("""
                        DELETE FROM workflow_node
                        WHERE chain_id = :chainId
                          AND node_code NOT IN ('START', 'ROUTE_Y')
                        """)
                .param("chainId", chainId)
                .update();
        jdbcClient.sql("""
                        UPDATE workflow_node
                        SET step_order = 20
                        WHERE chain_id = :chainId
                          AND node_code = 'ROUTE_Y'
                        """)
                .param("chainId", chainId)
                .update();
        insertNode(chainId, "SHARED_AFTER_BRANCH", "分支后公共节点", 30, false, null, null);
        insertEdge(chainId, "START", "ROUTE_Y");
        insertEdge(chainId, "ROUTE_Y", "SHARED_AFTER_BRANCH");

        long instanceId = approveProductionAndGetInstanceId();

        assertThat(nodeCount(instanceId)).isEqualTo(2L);
        assertThat(edgeCount(instanceId)).isEqualTo(1L);
        assertThat(nodeStatusOrNull(instanceId, "ROUTE_Y")).isNull();
        assertThat(nodeStatus(instanceId, "START")).isEqualTo("READY");
        assertThat(nodeStatus(instanceId, "SHARED_AFTER_BRANCH")).isEqualTo("PENDING");
    }

    @Test
    void productionReviewRejectsOrdersThatHaveNotPassedCsReview() throws Exception {
        jdbcClient.sql("""
                        UPDATE orders
                        SET internal_status = 'PENDING_CS_REVIEW',
                            external_status = 'PENDING_REVIEW'
                        WHERE order_id = :orderId
                        """)
                .param("orderId", orderId)
                .update();

        String body = """
                {
                  "action": "APPROVE",
                  "chain_id": %d,
                  "intake_branch": "SCAN",
                  "branch_params": {"route": "X"}
                }
                """.formatted(chainId);

        mockMvc.perform(post("/orders/{orderId}/production-review", orderId)
                        .header("X-Bootstrap-Role", "ADMIN")
                        .header("X-Bootstrap-User-Id", 8001L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict());

        assertThat(instanceCount(orderId)).isZero();
    }

    @Test
    void csCannotPerformProductionReview() throws Exception {
        mockMvc.perform(post("/orders/{orderId}/production-review", orderId)
                        .header("X-Bootstrap-Role", "CS")
                        .header("X-Bootstrap-User-Id", 8002L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "action": "APPROVE",
                                  "chain_id": %d,
                                  "intake_branch": "SCAN"
                                }
                                """.formatted(chainId)))
                .andExpect(status().isForbidden());

        assertThat(instanceCount(orderId)).isZero();
        assertThat(jdbcClient.sql("SELECT COUNT(*) FROM design_task WHERE order_id = :orderId")
                .param("orderId", orderId)
                .query(Long.class)
                .single()).isZero();
    }

    @Test
    void productionReviewAutomaticallyMatchesSeededChainByOrderProductType() throws Exception {
        jdbcClient.sql("UPDATE orders SET product_type = 'REGULAR_CROWN' WHERE order_id = :orderId")
                .param("orderId", orderId)
                .update();
        long expectedChainId = jdbcClient.sql("""
                        SELECT chain_id FROM workflow_chain
                        WHERE product_type = 'REGULAR_CROWN' AND status = 1
                        ORDER BY version DESC, chain_id DESC LIMIT 1
                        """)
                .query(Long.class)
                .single();

        mockMvc.perform(post("/orders/{orderId}/production-review", orderId)
                        .header("X-Bootstrap-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"action\":\"APPROVE\",\"intake_branch\":\"SCAN\"}"))
                .andExpect(status().isOk());

        long actualChainId = jdbcClient.sql("SELECT chain_id FROM order_process_instance WHERE order_id = :orderId")
                .param("orderId", orderId)
                .query(Long.class)
                .single();
        assertThat(actualChainId).isEqualTo(expectedChainId);
        long instanceId = jdbcClient.sql("SELECT instance_id FROM order_process_instance WHERE order_id = :orderId")
                .param("orderId", orderId)
                .query(Long.class)
                .single();
        assertThat(nodeStatusOrNull(instanceId, "REGULAR_CROWN_0090")).isNull();
        assertThat(nodeStatus(instanceId, "REGULAR_CROWN_0010")).isEqualTo("READY");
        assertThat(nodeStatus(instanceId, "REGULAR_CROWN_0030")).isEqualTo("PENDING");
        assertThat(nodeStatus(instanceId, "REGULAR_CROWN_0100")).isEqualTo("PENDING");

        jdbcClient.sql("""
                        INSERT INTO order_process_node
                            (instance_id, source_node_id, node_code, process_name, stage_name,
                             step_order, is_optional, branch_group, branch_key, node_category,
                             need_in_check, need_out_check, node_status)
                        SELECT
                            :instanceId, node_id, node_code, process_name, stage_name,
                            step_order, is_optional, branch_group, branch_key, node_category,
                            need_in_check, need_out_check, 'SKIPPED'
                        FROM workflow_node
                        WHERE chain_id = :chainId
                          AND node_code = 'REGULAR_CROWN_0090'
                        """)
                .param("instanceId", instanceId)
                .param("chainId", expectedChainId)
                .update();

        mockMvc.perform(get("/orders/{orderId}/process-instance", orderId)
                        .header("X-Bootstrap-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(content().string(not(org.hamcrest.Matchers.containsString("收发出货"))));
    }

    @Test
    void outPassCheckUnlocksSuccessorButCompletionAloneDoesNot() throws Exception {
        jdbcClient.sql("""
                        UPDATE workflow_node
                        SET need_out_check = 1
                        WHERE chain_id = :chainId AND node_code = 'START'
                        """)
                .param("chainId", chainId)
                .update();
        long instanceId = approveProductionAndGetInstanceId();
        long start = nodeId(instanceId, "START");
        assign(orderId, start, WORKER_USER_ID);
        startNode(start, WORKER_USER_ID);
        completeNode(start, WORKER_USER_ID);
        assertThat(nodeStatus(instanceId, "PARALLEL_B")).isEqualTo("PENDING");

        mockMvc.perform(post("/check-records")
                        .header("X-Bootstrap-Role", "WORKER")
                        .header("X-Bootstrap-User-Id", WORKER_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"node_instance_id\":" + start + ",\"check_type\":2,\"is_pass\":true}"))
                .andExpect(status().isOk());

        assertThat(nodeStatus(instanceId, "PARALLEL_B")).isEqualTo("READY");
    }

    @Test
    void dagActivationWaitsForParallelPredecessorsAndOptionalSkipCanUnlockJoin() throws Exception {
        long instanceId = approveProductionAndGetInstanceId();
        long start = nodeId(instanceId, "START");
        long parallelB = nodeId(instanceId, "PARALLEL_B");
        long optionalC = nodeId(instanceId, "OPTIONAL_C");
        long joinD = nodeId(instanceId, "JOIN_D");
        long routeX = nodeId(instanceId, "ROUTE_X");

        assign(orderId, start, WORKER_USER_ID);
        startNode(start, WORKER_USER_ID);
        completeNode(start, WORKER_USER_ID);

        assertThat(nodeStatus(instanceId, "PARALLEL_B")).isEqualTo("READY");
        assertThat(nodeStatus(instanceId, "OPTIONAL_C")).isEqualTo("READY");
        assertThat(nodeStatus(instanceId, "JOIN_D")).isEqualTo("PENDING");

        assign(orderId, parallelB, WORKER_USER_ID);
        assign(orderId, optionalC, OTHER_WORKER_USER_ID);
        startNode(parallelB, WORKER_USER_ID);
        completeNode(parallelB, WORKER_USER_ID);

        assertThat(nodeStatus(instanceId, "JOIN_D")).isEqualTo("PENDING");

        skipNode(optionalC, "optional fixture not needed");

        assertThat(nodeStatus(instanceId, "JOIN_D")).isEqualTo("READY");

        assign(orderId, joinD, WORKER_USER_ID);
        startNode(joinD, WORKER_USER_ID);
        completeNode(joinD, WORKER_USER_ID);

        assertThat(nodeStatus(instanceId, "ROUTE_X")).isEqualTo("READY");
        assertThat(nodeStatusOrNull(instanceId, "ROUTE_Y")).isNull();

        reassign(orderId, routeX, OTHER_WORKER_USER_ID);
        mockMvc.perform(get("/tasks/mine")
                        .header("X-Bootstrap-Role", "WORKER")
                        .header("X-Bootstrap-User-Id", OTHER_WORKER_USER_ID)
                        .param("status", "READY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].node_instance_id").value(routeX))
                .andExpect(jsonPath("$.data[0].order_id").value(orderId))
                .andExpect(jsonPath("$.data[0].node_status").value("READY"));
    }

    @Test
    void finalOnlyTasksReturnOnlyTheAssignedFinalNode() throws Exception {
        long instanceId = approveProductionAndGetInstanceId();
        long start = nodeId(instanceId, "START");
        long parallelB = nodeId(instanceId, "PARALLEL_B");
        long optionalC = nodeId(instanceId, "OPTIONAL_C");
        long joinD = nodeId(instanceId, "JOIN_D");
        long routeX = nodeId(instanceId, "ROUTE_X");

        assign(orderId, start, WORKER_USER_ID);
        startNode(start, WORKER_USER_ID);
        completeNode(start, WORKER_USER_ID);

        assign(orderId, parallelB, WORKER_USER_ID);
        startNode(parallelB, WORKER_USER_ID);
        completeNode(parallelB, WORKER_USER_ID);

        skipNode(optionalC, "optional fixture not needed");

        assign(orderId, joinD, WORKER_USER_ID);
        startNode(joinD, WORKER_USER_ID);
        completeNode(joinD, WORKER_USER_ID);

        assign(orderId, routeX, WORKER_USER_ID);
        startNode(routeX, WORKER_USER_ID);
        completeNode(routeX, WORKER_USER_ID);

        MvcResult finalTasks = mockMvc.perform(get("/tasks/mine")
                        .header("X-Bootstrap-Role", "WORKER")
                        .header("X-Bootstrap-User-Id", WORKER_USER_ID)
                        .param("status", "COMPLETED")
                        .param("final_only", "true"))
                .andExpect(status().isOk())
                .andReturn();
        java.util.List<Long> finalTaskIds = StreamSupport.stream(
                        objectMapper.readTree(finalTasks.getResponse().getContentAsString()).path("data").spliterator(), false)
                .map(task -> task.path("node_instance_id").asLong())
                .toList();
        assertThat(finalTaskIds)
                .contains(routeX)
                .doesNotContain(start, parallelB, joinD);
    }

    @Test
    void myTasksReflectsDesignConfirmationGateBeforeProductionStart() throws Exception {
        long instanceId = approveProductionAndGetInstanceId();
        long start = nodeId(instanceId, "START");
        assign(orderId, start, WORKER_USER_ID);
        jdbcClient.sql("""
                        UPDATE design_task
                        SET task_status = 'OPEN'
                        WHERE order_id = :orderId
                        """)
                .param("orderId", orderId)
                .update();

        mockMvc.perform(get("/tasks/mine")
                        .header("X-Bootstrap-Role", "WORKER")
                        .header("X-Bootstrap-User-Id", WORKER_USER_ID)
                        .param("status", "READY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].node_instance_id").value(start))
                .andExpect(jsonPath("$.data[0].can_start").value(false))
                .andExpect(jsonPath("$.data[0].start_block_reason").value("DESIGN_CONFIRMATION_REQUIRED"));

        mockMvc.perform(post("/process-instance/nodes/{nodeInstanceId}/start", start)
                        .header("X-Bootstrap-Role", "WORKER")
                        .header("X-Bootstrap-User-Id", WORKER_USER_ID))
                .andExpect(status().isConflict());

        jdbcClient.sql("""
                        UPDATE design_task
                        SET task_status = 'DOCTOR_CONFIRMED'
                        WHERE order_id = :orderId
                        """)
                .param("orderId", orderId)
                .update();

        mockMvc.perform(get("/tasks/mine")
                        .header("X-Bootstrap-Role", "WORKER")
                        .header("X-Bootstrap-User-Id", WORKER_USER_ID)
                        .param("status", "READY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].can_start").value(true))
                .andExpect(jsonPath("$.data[0].start_block_reason").doesNotExist());
    }

    @Test
    void bearerWorkerCannotManageAssignmentsOrSkipOptionalNodes() throws Exception {
        long instanceId = approveProductionAndGetInstanceId();
        long start = nodeId(instanceId, "START");
        long optionalC = nodeId(instanceId, "OPTIONAL_C");
        String workerToken = tokenService.issue(new BootstrapIdentity(UserRole.WORKER, WORKER_USER_ID, null));

        mockMvc.perform(post("/orders/{orderId}/process-instance/assign", orderId)
                        .header("Authorization", "Bearer " + workerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"assignments":[{"node_instance_id":%d,"user_id":%d}]}
                                """.formatted(start, WORKER_USER_ID)))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/process-instance/nodes/{nodeInstanceId}/skip", optionalC)
                        .header("Authorization", "Bearer " + workerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"worker should not manage process\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @Transactional
    void productionKanbanCarriesUnfinishedOrdersForwardAndDropsThemTheDayAfterCompletion() throws Exception {
        jdbcClient.sql("DELETE FROM workflow_edge WHERE chain_id = :chainId")
                .param("chainId", chainId)
                .update();
        jdbcClient.sql("DELETE FROM workflow_node WHERE chain_id = :chainId AND node_code <> 'START'")
                .param("chainId", chainId)
                .update();
        jdbcClient.sql("UPDATE workflow_node SET stage_name = :stageName WHERE chain_id = :chainId")
                .param("stageName", "CAD设计")
                .param("chainId", chainId)
                .update();

        LocalDate selectedDate = LocalDate.now();
        JsonNode baselineSnapshot = productionKanban(selectedDate, WORKER_USER_ID);
        long baselineUnfinished = stageMetric(baselineSnapshot, "CAD设计", "unfinished_count");
        long baselineCompleted = stageMetric(baselineSnapshot, "CAD设计", "completed_count");

        long instanceId = approveProductionAndGetInstanceId();
        long start = nodeId(instanceId, "START");
        assign(orderId, start, WORKER_USER_ID);

        LocalDateTime previousDay = selectedDate.minusDays(1).atTime(8, 0);
        jdbcClient.sql("""
                        UPDATE order_process_instance
                        SET created_at = :previousDay, updated_at = :previousDay
                        WHERE instance_id = :instanceId
                        """)
                .param("previousDay", previousDay)
                .param("instanceId", instanceId)
                .update();
        jdbcClient.sql("""
                        UPDATE order_process_node
                        SET created_at = :previousDay, updated_at = :previousDay
                        WHERE node_instance_id = :nodeInstanceId
                        """)
                .param("previousDay", previousDay)
                .param("nodeInstanceId", start)
                .update();

        JsonNode unfinishedSnapshot = productionKanban(selectedDate, WORKER_USER_ID);
        assertThat(visibleOrderIds(unfinishedSnapshot)).contains(orderId);
        assertThat(stageMetric(unfinishedSnapshot, "CAD设计", "unfinished_count"))
                .isEqualTo(baselineUnfinished + 1);

        startNode(start, WORKER_USER_ID);
        completeNode(start, WORKER_USER_ID);

        JsonNode completionDaySnapshot = productionKanban(selectedDate, WORKER_USER_ID);
        assertThat(visibleOrderIds(completionDaySnapshot)).contains(orderId);
        assertThat(stageMetric(completionDaySnapshot, "CAD设计", "completed_count"))
                .isEqualTo(baselineCompleted + 1);

        JsonNode nextDaySnapshot = productionKanban(selectedDate.plusDays(1), WORKER_USER_ID);
        assertThat(visibleOrderIds(nextDaySnapshot)).doesNotContain(orderId);
    }

    private long approveProductionAndGetInstanceId() throws Exception {
        String body = """
                {
                  "action": "APPROVE",
                  "chain_id": %d,
                  "intake_branch": "SCAN",
                  "branch_params": {"route": "X"}
                }
                """.formatted(chainId);
        MvcResult result = mockMvc.perform(post("/orders/{orderId}/production-review", orderId)
                        .header("X-Bootstrap-Role", "ADMIN")
                        .header("X-Bootstrap-User-Id", 8001L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.order_id").value(orderId))
                .andExpect(jsonPath("$.data.internal_status").value("IN_DESIGN"))
                .andExpect(jsonPath("$.data.external_status").value("DESIGNING"))
                .andExpect(jsonPath("$.data.instance_id").isNumber())
                .andReturn();
        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        // These legacy tests focus on process DAG mechanics. Complete the new
        // phase-2 design gate in the fixture; the real gate is covered by
        // DesignTaskCollaborationTests.
        jdbcClient.sql("""
                        UPDATE design_task
                        SET task_status = 'DOCTOR_CONFIRMED'
                        WHERE order_id = :orderId
                        """)
                .param("orderId", orderId)
                .update();
        return root.path("data").path("instance_id").asLong();
    }

    private JsonNode productionKanban(LocalDate date, long userId) throws Exception {
        MvcResult result = mockMvc.perform(get("/production/kanban")
                        .header("X-Bootstrap-Role", "WORKER")
                        .header("X-Bootstrap-User-Id", userId)
                        .param("date", date.toString()))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).path("data");
    }

    private java.util.List<Long> visibleOrderIds(JsonNode snapshot) {
        return StreamSupport.stream(snapshot.path("visible_order_ids").spliterator(), false)
                .map(JsonNode::asLong)
                .toList();
    }

    private long stageMetric(JsonNode snapshot, String stageName, String metricName) {
        return StreamSupport.stream(snapshot.path("stages").spliterator(), false)
                .filter(stage -> stageName.equals(stage.path("stage_name").asText()))
                .findFirst()
                .orElseThrow()
                .path(metricName)
                .asLong();
    }

    private long createRuntimeTestChain(String suffix) {
        String chainCode = "runtime_test_" + suffix;
        jdbcClient.sql("""
                        INSERT INTO workflow_chain
                            (chain_code, chain_name, product_type, version, intake_branch, status)
                        VALUES
                            (:chainCode, :chainName, 'RUNTIME_TEST', 1, 'BOTH', 1)
                        """)
                .param("chainCode", chainCode)
                .param("chainName", "运行时测试链-" + suffix)
                .update();
        long id = jdbcClient.sql("SELECT chain_id FROM workflow_chain WHERE chain_code = :chainCode")
                .param("chainCode", chainCode)
                .query(Long.class)
                .single();
        insertNode(id, "START", "开始节点", 10, false, null, null);
        insertNode(id, "PARALLEL_B", "并行节点B", 20, false, null, null);
        insertNode(id, "OPTIONAL_C", "可选节点C", 20, true, null, null);
        insertNode(id, "JOIN_D", "汇合节点D", 30, false, null, null);
        insertNode(id, "ROUTE_X", "路线X节点", 40, false, "route", "X");
        insertNode(id, "ROUTE_Y", "路线Y节点", 40, false, "route", "Y");
        insertEdge(id, "START", "PARALLEL_B");
        insertEdge(id, "START", "OPTIONAL_C");
        insertEdge(id, "PARALLEL_B", "JOIN_D");
        insertEdge(id, "OPTIONAL_C", "JOIN_D");
        insertEdge(id, "JOIN_D", "ROUTE_X");
        insertEdge(id, "JOIN_D", "ROUTE_Y");
        return id;
    }

    private void insertNode(long targetChainId, String code, String name, int order, boolean optional,
            String branchGroup, String branchKey) {
        jdbcClient.sql("""
                        INSERT INTO workflow_node
                            (chain_id, node_code, process_name, step_order, is_optional,
                             branch_group, branch_key, node_category, need_in_check, need_out_check)
                        VALUES
                            (:chainId, :nodeCode, :processName, :stepOrder, :isOptional,
                             :branchGroup, :branchKey, 'PRODUCTION', 0, 0)
                        """)
                .param("chainId", targetChainId)
                .param("nodeCode", code)
                .param("processName", name)
                .param("stepOrder", order)
                .param("isOptional", optional ? 1 : 0)
                .param("branchGroup", branchGroup)
                .param("branchKey", branchKey)
                .update();
    }

    private void insertEdge(long targetChainId, String fromCode, String toCode) {
        jdbcClient.sql("""
                        INSERT INTO workflow_edge
                            (chain_id, from_node_id, to_node_id, edge_type)
                        SELECT :chainId, f.node_id, t.node_id, 'SEQUENCE'
                        FROM workflow_node f
                        JOIN workflow_node t ON t.chain_id = f.chain_id
                        WHERE f.chain_id = :chainId
                          AND f.node_code = :fromCode
                          AND t.node_code = :toCode
                        """)
                .param("chainId", targetChainId)
                .param("fromCode", fromCode)
                .param("toCode", toCode)
                .update();
    }

    private void assign(long targetOrderId, long nodeInstanceId, long userId) throws Exception {
        String body = """
                {"assignments":[{"node_instance_id":%d,"user_id":%d}]}
                """.formatted(nodeInstanceId, userId);
        mockMvc.perform(post("/orders/{orderId}/process-instance/assign", targetOrderId)
                        .header("X-Bootstrap-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    private void reassign(long targetOrderId, long nodeInstanceId, long userId) throws Exception {
        String body = """
                {"new_user_id":%d,"reason":"smoke reassign"}
                """.formatted(userId);
        mockMvc.perform(post("/orders/{orderId}/process-instance/nodes/{nodeInstanceId}/reassign",
                                targetOrderId, nodeInstanceId)
                        .header("X-Bootstrap-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    private void startNode(long nodeInstanceId, long userId) throws Exception {
        mockMvc.perform(post("/process-instance/nodes/{nodeInstanceId}/start", nodeInstanceId)
                        .header("X-Bootstrap-Role", "WORKER")
                        .header("X-Bootstrap-User-Id", userId))
                .andExpect(status().isOk());
    }

    private void completeNode(long nodeInstanceId, long userId) throws Exception {
        mockMvc.perform(post("/process-instance/nodes/{nodeInstanceId}/complete", nodeInstanceId)
                        .header("X-Bootstrap-Role", "WORKER")
                        .header("X-Bootstrap-User-Id", userId))
                .andExpect(status().isOk());
    }

    private void skipNode(long nodeInstanceId, String reason) throws Exception {
        mockMvc.perform(post("/process-instance/nodes/{nodeInstanceId}/skip", nodeInstanceId)
                        .header("X-Bootstrap-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"" + reason + "\"}"))
                .andExpect(status().isOk());
    }

    private String instanceStatus(long instanceId) {
        return jdbcClient.sql("SELECT instance_status FROM order_process_instance WHERE instance_id = :instanceId")
                .param("instanceId", instanceId)
                .query(String.class)
                .single();
    }

    private long nodeCount(long instanceId) {
        return jdbcClient.sql("SELECT COUNT(*) FROM order_process_node WHERE instance_id = :instanceId")
                .param("instanceId", instanceId)
                .query(Long.class)
                .single();
    }

    private long edgeCount(long instanceId) {
        return jdbcClient.sql("SELECT COUNT(*) FROM order_process_edge WHERE instance_id = :instanceId")
                .param("instanceId", instanceId)
                .query(Long.class)
                .single();
    }

    private long nodeId(long instanceId, String nodeCode) {
        return jdbcClient.sql("""
                        SELECT node_instance_id
                        FROM order_process_node
                        WHERE instance_id = :instanceId
                          AND node_code = :nodeCode
                        """)
                .param("instanceId", instanceId)
                .param("nodeCode", nodeCode)
                .query(Long.class)
                .single();
    }

    private String nodeStatus(long instanceId, String nodeCode) {
        return jdbcClient.sql("""
                        SELECT node_status
                        FROM order_process_node
                        WHERE instance_id = :instanceId
                          AND node_code = :nodeCode
                        """)
                .param("instanceId", instanceId)
                .param("nodeCode", nodeCode)
                .query(String.class)
                .single();
    }

    private String nodeStatusOrNull(long instanceId, String nodeCode) {
        return jdbcClient.sql("""
                        SELECT node_status
                        FROM order_process_node
                        WHERE instance_id = :instanceId
                          AND node_code = :nodeCode
                        """)
                .param("instanceId", instanceId)
                .param("nodeCode", nodeCode)
                .query(String.class)
                .optional()
                .orElse(null);
    }

    private long instanceCount(long targetOrderId) {
        return jdbcClient.sql("SELECT COUNT(*) FROM order_process_instance WHERE order_id = :orderId")
                .param("orderId", targetOrderId)
                .query(Long.class)
                .single();
    }
}

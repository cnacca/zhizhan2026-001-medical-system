package com.yuri.aiorder.workflow.execution;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.auth.AccessControlService;
import com.yuri.aiorder.notification.NotificationPushService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class WorkflowExecutionService {

    private static final String PERFORMANCE_FORMULA_VERSION = "PHASE_ONE_DEFAULT_V1";

    private static final TypeReference<List<Long>> LONG_LIST_TYPE = new TypeReference<>() {
    };

    private static final String REWORK_REASON_CATEGORY_TYPE = "REASON_CATEGORY";
    private static final String REWORK_RESPONSIBILITY_TYPE = "RESPONSIBILITY_TYPE";
    private static final Set<String> REWORK_DICTIONARY_TYPES = Set.of(
            REWORK_REASON_CATEGORY_TYPE,
            REWORK_RESPONSIBILITY_TYPE);
    private static final Set<String> REWORK_DICTIONARY_STATUS = Set.of("ACTIVE", "INACTIVE");

    private final JdbcClient jdbcClient;
    private final AccessControlService accessControlService;
    private final ObjectMapper objectMapper;
    private final NotificationPushService notificationPushService;

    public WorkflowExecutionService(
            JdbcClient jdbcClient,
            AccessControlService accessControlService,
            ObjectMapper objectMapper,
            NotificationPushService notificationPushService) {
        this.jdbcClient = jdbcClient;
        this.accessControlService = accessControlService;
        this.objectMapper = objectMapper;
        this.notificationPushService = notificationPushService;
    }

    @Transactional
    public CheckRecordResponse submitCheck(CheckRecordRequest request, BootstrapIdentity identity) {
        if (request.nodeInstanceId() == null || request.checkType() == null || request.isPass() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "node_instance_id, check_type and is_pass are required");
        }
        NodeRow node = lockNode(request.nodeInstanceId());
        requireWorkerAssignment(node, identity);
        String checkType = normalizeCheckType(request.checkType());
        if ("IN".equals(checkType) && !"READY".equals(node.nodeStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "in-check requires ready node");
        }
        if ("OUT".equals(checkType) && !"COMPLETED".equals(node.nodeStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "out-check requires completed node");
        }
        String result = Boolean.TRUE.equals(request.isPass()) ? "PASS" : "FAIL";
        jdbcClient.sql("""
                        INSERT INTO check_record
                            (order_id, node_instance_id, check_type, result, checker_user_id, note)
                        VALUES
                            (:orderId, :nodeInstanceId, :checkType, :result, :checkerUserId, :note)
                        """)
                .param("orderId", node.orderId())
                .param("nodeInstanceId", node.nodeInstanceId())
                .param("checkType", checkType)
                .param("result", result)
                .param("checkerUserId", identity.userId())
                .param("note", request.remark())
                .update();
        long checkId = lastInsertId();
        Long reworkId = null;
        if ("OUT".equals(checkType) && "FAIL".equals(result)) {
            reworkId = createRework(node, checkId, request);
        }
        return new CheckRecordResponse(checkId, node.nodeInstanceId(), request.checkType(), result, reworkId);
    }

    public List<CheckRecordResponse> getChecks(long nodeInstanceId, BootstrapIdentity identity) {
        accessControlService.requireCheckRecordRead(identity);
        return jdbcClient.sql("""
                        SELECT check_id, node_instance_id, check_type, result
                        FROM check_record
                        WHERE node_instance_id = :nodeInstanceId
                        ORDER BY check_id
                        """)
                .param("nodeInstanceId", nodeInstanceId)
                .query((rs, rowNum) -> new CheckRecordResponse(
                        rs.getLong("check_id"),
                        rs.getLong("node_instance_id"),
                        denormalizeCheckType(rs.getString("check_type")),
                        rs.getString("result"),
                        null))
                .list();
    }

    public List<ReworkRecordResponse> getReworks(
            String status, Long orderId, Boolean hasImpactedNodes, BootstrapIdentity identity) {
        accessControlService.requireCheckRecordRead(identity);
        String normalizedStatus = status == null || status.isBlank() ? null : status.trim().toUpperCase();
        String statusClause = normalizedStatus == null ? "" : " AND r.status = :status";
        String orderClause = orderId == null ? "" : " AND r.order_id = :orderId";
        String impactedClause = hasImpactedNodes == null
                ? ""
                : Boolean.TRUE.equals(hasImpactedNodes)
                        ? " AND r.impacted_node_count > 0"
                        : " AND r.impacted_node_count = 0";
        String workerClause = identity.role() == com.yuri.aiorder.common.UserRole.WORKER
                ? " AND (target_node.assigned_user_id = :workerUserId OR from_node.assigned_user_id = :workerUserId)"
                : "";
        JdbcClient.StatementSpec spec = jdbcClient.sql("""
                        SELECT
                            r.rework_id,
                            r.order_id,
                            o.order_no,
                            r.source_check_id,
                            r.from_node_instance_id,
                            from_node.process_name AS from_process_name,
                            r.target_node_instance_id,
                            target_node.process_name AS target_process_name,
                            target_node.node_status AS target_node_status,
                            r.impacted_node_count,
                            CAST(r.impacted_node_instance_ids AS CHAR) AS impacted_node_instance_ids,
                            target_node.assigned_user_id,
                            r.reason_category,
                            r.reason_detail,
                            r.responsibility_type,
                            r.close_note,
                            r.closed_by_user_id,
                            r.closed_at,
                            r.status,
                            r.created_at
                        FROM rework_record r
                        JOIN orders o ON o.order_id = r.order_id
                        LEFT JOIN order_process_node from_node
                          ON from_node.node_instance_id = r.from_node_instance_id
                        LEFT JOIN order_process_node target_node
                          ON target_node.node_instance_id = r.target_node_instance_id
                        WHERE 1 = 1
                        %s
                        %s
                        %s
                        %s
                        ORDER BY r.created_at DESC, r.rework_id DESC
                        LIMIT 100
                        """.formatted(statusClause, orderClause, impactedClause, workerClause));
        if (normalizedStatus != null) {
            spec = spec.param("status", normalizedStatus);
        }
        if (orderId != null) {
            spec = spec.param("orderId", orderId);
        }
        if (identity.role() == com.yuri.aiorder.common.UserRole.WORKER) {
            if (identity.userId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "worker user id is required");
            }
            spec = spec.param("workerUserId", identity.userId());
        }
        return spec.query((rs, rowNum) -> new ReworkRecordResponse(
                        rs.getLong("rework_id"),
                        rs.getLong("order_id"),
                        rs.getString("order_no"),
                        rs.getLong("source_check_id"),
                        rs.getObject("from_node_instance_id", Long.class),
                        rs.getString("from_process_name"),
                        rs.getObject("target_node_instance_id", Long.class),
                        rs.getString("target_process_name"),
                        rs.getString("target_node_status"),
                        rs.getInt("impacted_node_count"),
                        parseImpactedNodeInstanceIds(rs.getString("impacted_node_instance_ids")),
                        rs.getObject("assigned_user_id", Long.class),
                        rs.getString("reason_category"),
                        rs.getString("reason_detail"),
                        rs.getString("responsibility_type"),
                        rs.getString("close_note"),
                        rs.getObject("closed_by_user_id", Long.class),
                        rs.getObject("closed_at", LocalDateTime.class),
                        rs.getString("status"),
                        rs.getObject("created_at", LocalDateTime.class)))
                .list();
    }

    public ReworkDictionariesResponse getReworkDictionaries(BootstrapIdentity identity) {
        accessControlService.requireCheckRecordRead(identity);
        return new ReworkDictionariesResponse(
                listActiveReworkDictionaryOptions(REWORK_REASON_CATEGORY_TYPE),
                listActiveReworkDictionaryOptions(REWORK_RESPONSIBILITY_TYPE));
    }

    public List<ReworkDictionaryItemResponse> listReworkDictionaryItems(String dictionaryType) {
        String normalizedType = dictionaryType == null || dictionaryType.isBlank()
                ? null
                : normalizeReworkDictionaryType(dictionaryType);
        String typeClause = normalizedType == null ? "" : " WHERE dictionary_type = :dictionaryType";
        JdbcClient.StatementSpec spec = jdbcClient.sql("""
                        SELECT item_id, dictionary_type, item_code, item_label, sort_order, status
                        FROM rework_dictionary_item
                        %s
                        ORDER BY dictionary_type, sort_order, item_id
                        """.formatted(typeClause));
        if (normalizedType != null) {
            spec = spec.param("dictionaryType", normalizedType);
        }
        return spec.query((rs, rowNum) -> new ReworkDictionaryItemResponse(
                        rs.getLong("item_id"),
                        rs.getString("dictionary_type"),
                        rs.getString("item_code"),
                        rs.getString("item_label"),
                        rs.getInt("sort_order"),
                        rs.getString("status")))
                .list();
    }

    @Transactional
    public ReworkDictionaryItemResponse createReworkDictionaryItem(CreateReworkDictionaryItemRequest request) {
        String dictionaryType = normalizeReworkDictionaryType(request.dictionaryType());
        String code = normalizeRequired(request.code(), "code").toUpperCase(Locale.ROOT);
        String label = normalizeRequired(request.label(), "label");
        int sortOrder = request.sortOrder() == null ? 0 : request.sortOrder();
        try {
            jdbcClient.sql("""
                            INSERT INTO rework_dictionary_item
                                (dictionary_type, item_code, item_label, sort_order, status)
                            VALUES
                                (:dictionaryType, :code, :label, :sortOrder, 'ACTIVE')
                            """)
                    .param("dictionaryType", dictionaryType)
                    .param("code", code)
                    .param("label", label)
                    .param("sortOrder", sortOrder)
                    .update();
        } catch (DuplicateKeyException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "rework dictionary item already exists", ex);
        }
        return requireReworkDictionaryItem(lastInsertId());
    }

    @Transactional
    public ReworkDictionaryItemResponse updateReworkDictionaryItem(
            long itemId, UpdateReworkDictionaryItemRequest request) {
        requireReworkDictionaryItem(itemId);
        String label = request.label() == null ? null : normalizeRequired(request.label(), "label");
        String status = request.status() == null ? null : normalizeReworkDictionaryStatus(request.status());
        jdbcClient.sql("""
                        UPDATE rework_dictionary_item
                        SET item_label = COALESCE(:label, item_label),
                            sort_order = COALESCE(:sortOrder, sort_order),
                            status = COALESCE(:status, status)
                        WHERE item_id = :itemId
                        """)
                .param("label", label)
                .param("sortOrder", request.sortOrder())
                .param("status", status)
                .param("itemId", itemId)
                .update();
        return requireReworkDictionaryItem(itemId);
    }

    public ProductionQualitySummaryResponse getProductionQualitySummary(
            String productType, BootstrapIdentity identity) {
        accessControlService.requireCheckRecordRead(identity);
        String normalizedProductType = blankToNull(productType);
        String productTypeClause = normalizedProductType == null ? "" : " AND o.product_type = :productType";

        JdbcClient.StatementSpec checkSpec = jdbcClient.sql("""
                        WITH ranked_out_checks AS (
                            SELECT
                                c.order_id,
                                c.result,
                                ROW_NUMBER() OVER (
                                    PARTITION BY c.order_id
                                    ORDER BY c.created_at ASC, c.check_id ASC
                                ) AS first_rank,
                                ROW_NUMBER() OVER (
                                    PARTITION BY c.order_id
                                    ORDER BY c.created_at DESC, c.check_id DESC
                                ) AS latest_rank
                            FROM check_record c
                            JOIN orders o ON o.order_id = c.order_id
                            WHERE c.check_type = 'OUT'
                        """ + productTypeClause + """
                        )
                        SELECT
                            COUNT(DISTINCT order_id) AS inspected_order_count,
                            COALESCE(SUM(CASE WHEN first_rank = 1 AND result = 'PASS' THEN 1 ELSE 0 END), 0)
                                AS first_pass_count,
                            COALESCE(SUM(CASE WHEN latest_rank = 1 AND result = 'PASS' THEN 1 ELSE 0 END), 0)
                                AS final_pass_count
                        FROM ranked_out_checks
                        """);
        if (normalizedProductType != null) {
            checkSpec = checkSpec.param("productType", normalizedProductType);
        }
        QualityCheckSummaryRow checkSummary = checkSpec.query((rs, rowNum) -> new QualityCheckSummaryRow(
                        rs.getLong("inspected_order_count"),
                        rs.getLong("first_pass_count"),
                        rs.getLong("final_pass_count")))
                .single();

        JdbcClient.StatementSpec reworkSpec = jdbcClient.sql("""
                        SELECT
                            COUNT(*) AS total_rework_count,
                            COALESCE(SUM(CASE WHEN r.responsibility_type = 'WORKER' THEN 1 ELSE 0 END), 0)
                                AS internal_rework_count,
                            COALESCE(SUM(CASE WHEN r.responsibility_type IN ('DOCTOR', 'CS') THEN 1 ELSE 0 END), 0)
                                AS external_rework_count,
                            COALESCE(SUM(CASE
                                WHEN r.responsibility_type IS NULL
                                     OR r.responsibility_type NOT IN ('WORKER', 'DOCTOR', 'CS')
                                THEN 1 ELSE 0 END), 0) AS unclassified_rework_count
                        FROM rework_record r
                        JOIN orders o ON o.order_id = r.order_id
                        WHERE 1 = 1
                        """ + productTypeClause);
        if (normalizedProductType != null) {
            reworkSpec = reworkSpec.param("productType", normalizedProductType);
        }
        QualityReworkSummaryRow reworkSummary = reworkSpec.query((rs, rowNum) -> new QualityReworkSummaryRow(
                        rs.getLong("total_rework_count"),
                        rs.getLong("internal_rework_count"),
                        rs.getLong("external_rework_count"),
                        rs.getLong("unclassified_rework_count")))
                .single();

        long inspectedOrderCount = checkSummary.inspectedOrderCount();
        return new ProductionQualitySummaryResponse(
                normalizedProductType,
                inspectedOrderCount,
                reworkSummary.totalReworkCount(),
                reworkSummary.internalReworkCount(),
                reworkSummary.externalReworkCount(),
                reworkSummary.unclassifiedReworkCount(),
                percentage(reworkSummary.totalReworkCount(), inspectedOrderCount),
                percentage(reworkSummary.internalReworkCount(), inspectedOrderCount),
                percentage(reworkSummary.externalReworkCount(), inspectedOrderCount),
                percentage(checkSummary.firstPassCount(), inspectedOrderCount),
                percentage(checkSummary.finalPassCount(), inspectedOrderCount),
                0.0,
                0.0,
                LocalDateTime.now());
    }

    public ProductionEquipmentSummaryResponse getProductionEquipmentSummary(
            String equipmentCodePrefix, BootstrapIdentity identity) {
        accessControlService.requireCheckRecordRead(identity);
        String normalizedPrefix = blankToNull(equipmentCodePrefix);
        String prefixClause = normalizedPrefix == null ? "" : " WHERE e.equipment_code LIKE :equipmentCodePattern";

        JdbcClient.StatementSpec equipmentSpec = jdbcClient.sql("""
                        SELECT
                            COUNT(*) AS total_equipment_count,
                            COALESCE(SUM(CASE WHEN e.status = 'RUNNING' THEN 1 ELSE 0 END), 0) AS running_count,
                            COALESCE(SUM(CASE WHEN e.status = 'IDLE' THEN 1 ELSE 0 END), 0) AS idle_count,
                            COALESCE(SUM(CASE WHEN e.status = 'MAINTENANCE' THEN 1 ELSE 0 END), 0) AS maintenance_count,
                            COALESCE(SUM(CASE WHEN e.status = 'FAULT' THEN 1 ELSE 0 END), 0) AS fault_count,
                            COALESCE(AVG(e.utilization_rate), 0) AS average_utilization_rate
                        FROM production_equipment e
                        """ + prefixClause);
        if (normalizedPrefix != null) {
            equipmentSpec = equipmentSpec.param("equipmentCodePattern", normalizedPrefix + "%");
        }
        EquipmentSummaryRow equipmentSummary = equipmentSpec.query((rs, rowNum) -> new EquipmentSummaryRow(
                        rs.getLong("total_equipment_count"),
                        rs.getLong("running_count"),
                        rs.getLong("idle_count"),
                        rs.getLong("maintenance_count"),
                        rs.getLong("fault_count"),
                        roundedDecimal(rs.getBigDecimal("average_utilization_rate"))))
                .single();

        String eventPrefixClause = normalizedPrefix == null ? "" : " WHERE e.equipment_code LIKE :equipmentCodePattern";
        JdbcClient.StatementSpec eventSpec = jdbcClient.sql("""
                        SELECT
                            COALESCE(SUM(CASE
                                WHEN ev.event_type = 'MAINTENANCE_PLAN'
                                     AND ev.status IN ('PENDING', 'IN_PROGRESS')
                                THEN 1 ELSE 0 END), 0) AS pending_maintenance_count,
                            COALESCE(SUM(CASE
                                WHEN ev.event_type = 'FAULT_REPAIR'
                                     AND ev.status IN ('PENDING', 'IN_PROGRESS')
                                THEN 1 ELSE 0 END), 0) AS open_fault_count,
                            COALESCE(SUM(ev.downtime_minutes), 0) AS downtime_minutes
                        FROM production_equipment_event ev
                        JOIN production_equipment e ON e.equipment_id = ev.equipment_id
                        """ + eventPrefixClause);
        if (normalizedPrefix != null) {
            eventSpec = eventSpec.param("equipmentCodePattern", normalizedPrefix + "%");
        }
        EquipmentEventSummaryRow eventSummary = eventSpec.query((rs, rowNum) -> new EquipmentEventSummaryRow(
                        rs.getLong("pending_maintenance_count"),
                        rs.getLong("open_fault_count"),
                        rs.getLong("downtime_minutes")))
                .single();

        return new ProductionEquipmentSummaryResponse(
                normalizedPrefix,
                equipmentSummary.totalEquipmentCount(),
                equipmentSummary.runningCount(),
                equipmentSummary.idleCount(),
                equipmentSummary.maintenanceCount(),
                equipmentSummary.faultCount(),
                eventSummary.pendingMaintenanceCount(),
                eventSummary.openFaultCount(),
                eventSummary.downtimeMinutes(),
                equipmentSummary.averageUtilizationRate(),
                LocalDateTime.now());
    }

    public ProductionMaterialExceptionSummaryResponse getProductionMaterialExceptionSummary(
            String exceptionNoPrefix, BootstrapIdentity identity) {
        accessControlService.requireCheckRecordRead(identity);
        String normalizedPrefix = blankToNull(exceptionNoPrefix);
        String prefixClause = normalizedPrefix == null ? "" : " WHERE m.exception_no LIKE :exceptionNoPattern";

        JdbcClient.StatementSpec spec = jdbcClient.sql("""
                        SELECT
                            COUNT(*) AS total_exception_count,
                            COALESCE(SUM(CASE WHEN m.exception_type = 'SHORTAGE' THEN 1 ELSE 0 END), 0)
                                AS shortage_count,
                            COALESCE(SUM(CASE WHEN m.exception_type = 'WRONG_MATERIAL' THEN 1 ELSE 0 END), 0)
                                AS wrong_material_count,
                            COALESCE(SUM(CASE WHEN m.exception_type = 'BATCH_ABNORMAL' THEN 1 ELSE 0 END), 0)
                                AS batch_abnormal_count,
                            COALESCE(SUM(CASE WHEN m.exception_type = 'MATERIAL_LOSS' THEN 1 ELSE 0 END), 0)
                                AS material_loss_count,
                            COALESCE(SUM(CASE WHEN m.status = 'PENDING' THEN 1 ELSE 0 END), 0) AS pending_count,
                            COALESCE(SUM(CASE WHEN m.status = 'IN_PROGRESS' THEN 1 ELSE 0 END), 0)
                                AS in_progress_count,
                            COALESCE(SUM(CASE WHEN m.status = 'CLOSED' THEN 1 ELSE 0 END), 0) AS closed_count,
                            COALESCE(SUM(CASE
                                WHEN m.responsibility_owner IS NOT NULL AND m.responsibility_owner <> ''
                                THEN 1 ELSE 0 END), 0) AS responsibility_assigned_count,
                            COALESCE(SUM(m.loss_quantity), 0) AS total_loss_quantity
                        FROM production_material_exception m
                        """ + prefixClause);
        if (normalizedPrefix != null) {
            spec = spec.param("exceptionNoPattern", normalizedPrefix + "%");
        }
        MaterialExceptionSummaryRow summary = spec.query((rs, rowNum) -> new MaterialExceptionSummaryRow(
                        rs.getLong("total_exception_count"),
                        rs.getLong("shortage_count"),
                        rs.getLong("wrong_material_count"),
                        rs.getLong("batch_abnormal_count"),
                        rs.getLong("material_loss_count"),
                        rs.getLong("pending_count"),
                        rs.getLong("in_progress_count"),
                        rs.getLong("closed_count"),
                        rs.getLong("responsibility_assigned_count"),
                        roundedDecimal(rs.getBigDecimal("total_loss_quantity"), 2)))
                .single();

        return new ProductionMaterialExceptionSummaryResponse(
                normalizedPrefix,
                summary.totalExceptionCount(),
                summary.shortageCount(),
                summary.wrongMaterialCount(),
                summary.batchAbnormalCount(),
                summary.materialLossCount(),
                summary.pendingCount(),
                summary.inProgressCount(),
                summary.closedCount(),
                summary.responsibilityAssignedCount(),
                summary.totalLossQuantity(),
                LocalDateTime.now());
    }

    public ProductionSafetyEnvironmentSummaryResponse getProductionSafetyEnvironmentSummary(
            String eventNoPrefix, BootstrapIdentity identity) {
        accessControlService.requireCheckRecordRead(identity);
        String normalizedPrefix = blankToNull(eventNoPrefix);
        String prefixClause = normalizedPrefix == null ? "" : " WHERE s.event_no LIKE :eventNoPattern";

        JdbcClient.StatementSpec spec = jdbcClient.sql("""
                        SELECT
                            COUNT(*) AS total_event_count,
                            COALESCE(SUM(CASE WHEN s.event_type = 'SAFETY_INSPECTION' THEN 1 ELSE 0 END), 0)
                                AS safety_inspection_count,
                            COALESCE(SUM(CASE WHEN s.event_type = 'HAZARD_RECTIFICATION' THEN 1 ELSE 0 END), 0)
                                AS hazard_rectification_count,
                            COALESCE(SUM(CASE WHEN s.event_type = 'ENVIRONMENT_RECORD' THEN 1 ELSE 0 END), 0)
                                AS environment_record_count,
                            COALESCE(SUM(CASE WHEN s.event_type = 'PPE_DEVICE_REMINDER' THEN 1 ELSE 0 END), 0)
                                AS ppe_device_reminder_count,
                            COALESCE(SUM(CASE WHEN s.status = 'PENDING' THEN 1 ELSE 0 END), 0) AS pending_count,
                            COALESCE(SUM(CASE WHEN s.status = 'IN_PROGRESS' THEN 1 ELSE 0 END), 0)
                                AS in_progress_count,
                            COALESCE(SUM(CASE WHEN s.status = 'CLOSED' THEN 1 ELSE 0 END), 0) AS closed_count,
                            COALESCE(SUM(CASE
                                WHEN s.status <> 'CLOSED'
                                     AND s.due_at IS NOT NULL
                                     AND s.due_at < CURRENT_TIMESTAMP(3)
                                THEN 1 ELSE 0 END), 0) AS overdue_count,
                            COALESCE(SUM(CASE
                                WHEN s.risk_level IN ('HIGH', 'CRITICAL') THEN 1 ELSE 0 END), 0)
                                AS high_risk_count
                        FROM production_safety_event s
                        """ + prefixClause);
        if (normalizedPrefix != null) {
            spec = spec.param("eventNoPattern", normalizedPrefix + "%");
        }
        SafetyEnvironmentSummaryRow summary = spec.query((rs, rowNum) -> new SafetyEnvironmentSummaryRow(
                        rs.getLong("total_event_count"),
                        rs.getLong("safety_inspection_count"),
                        rs.getLong("hazard_rectification_count"),
                        rs.getLong("environment_record_count"),
                        rs.getLong("ppe_device_reminder_count"),
                        rs.getLong("pending_count"),
                        rs.getLong("in_progress_count"),
                        rs.getLong("closed_count"),
                        rs.getLong("overdue_count"),
                        rs.getLong("high_risk_count")))
                .single();

        return new ProductionSafetyEnvironmentSummaryResponse(
                normalizedPrefix,
                summary.totalEventCount(),
                summary.safetyInspectionCount(),
                summary.hazardRectificationCount(),
                summary.environmentRecordCount(),
                summary.ppeDeviceReminderCount(),
                summary.pendingCount(),
                summary.inProgressCount(),
                summary.closedCount(),
                summary.overdueCount(),
                summary.highRiskCount(),
                LocalDateTime.now());
    }

    public ProductionCostSummaryResponse getProductionCostSummary(String costNoPrefix, BootstrapIdentity identity) {
        accessControlService.requireCheckRecordRead(identity);
        String normalizedPrefix = blankToNull(costNoPrefix);
        String prefixClause = normalizedPrefix == null ? "" : " WHERE c.cost_no LIKE :costNoPattern";

        JdbcClient.StatementSpec spec = jdbcClient.sql("""
                        SELECT
                            COUNT(*) AS record_count,
                            COALESCE(SUM(c.amount), 0) AS total_cost_amount,
                            COALESCE(SUM(CASE WHEN c.cost_type = 'PROCESS' THEN c.amount ELSE 0 END), 0)
                                AS process_cost_amount,
                            COALESCE(SUM(CASE WHEN c.cost_type = 'MATERIAL' THEN c.amount ELSE 0 END), 0)
                                AS material_cost_amount,
                            COALESCE(SUM(CASE WHEN c.cost_type = 'LABOR' THEN c.amount ELSE 0 END), 0)
                                AS labor_cost_amount,
                            COALESCE(SUM(CASE WHEN c.cost_type = 'REWORK' THEN c.amount ELSE 0 END), 0)
                                AS rework_cost_amount,
                            COALESCE(SUM(CASE WHEN c.cost_type = 'OUTSOURCING' THEN c.amount ELSE 0 END), 0)
                                AS outsourcing_cost_amount,
                            COALESCE(SUM(CASE WHEN c.status = 'WARNING' THEN 1 ELSE 0 END), 0)
                                AS abnormal_warning_count
                        FROM production_cost_record c
                        """ + prefixClause);
        if (normalizedPrefix != null) {
            spec = spec.param("costNoPattern", normalizedPrefix + "%");
        }
        CostSummaryRow summary = spec.query((rs, rowNum) -> new CostSummaryRow(
                        rs.getLong("record_count"),
                        roundedDecimal(rs.getBigDecimal("total_cost_amount"), 2),
                        roundedDecimal(rs.getBigDecimal("process_cost_amount"), 2),
                        roundedDecimal(rs.getBigDecimal("material_cost_amount"), 2),
                        roundedDecimal(rs.getBigDecimal("labor_cost_amount"), 2),
                        roundedDecimal(rs.getBigDecimal("rework_cost_amount"), 2),
                        roundedDecimal(rs.getBigDecimal("outsourcing_cost_amount"), 2),
                        rs.getLong("abnormal_warning_count")))
                .single();

        return new ProductionCostSummaryResponse(
                normalizedPrefix,
                summary.recordCount(),
                summary.totalCostAmount(),
                summary.processCostAmount(),
                summary.materialCostAmount(),
                summary.laborCostAmount(),
                summary.reworkCostAmount(),
                summary.outsourcingCostAmount(),
                summary.abnormalWarningCount(),
                LocalDateTime.now());
    }

    public ProductionRewardPenaltySummaryResponse getProductionRewardPenaltySummary(
            String recordNoPrefix, BootstrapIdentity identity) {
        accessControlService.requireCheckRecordRead(identity);
        String normalizedPrefix = blankToNull(recordNoPrefix);
        String prefixClause = normalizedPrefix == null ? "" : " WHERE r.record_no LIKE :recordNoPattern";

        JdbcClient.StatementSpec spec = jdbcClient.sql("""
                        SELECT
                            COUNT(*) AS total_record_count,
                            COALESCE(SUM(CASE WHEN r.record_type = 'REWARD' THEN 1 ELSE 0 END), 0)
                                AS reward_count,
                            COALESCE(SUM(CASE WHEN r.record_type = 'PENALTY' THEN 1 ELSE 0 END), 0)
                                AS penalty_count,
                            COALESCE(SUM(CASE WHEN r.status = 'PENDING' THEN 1 ELSE 0 END), 0)
                                AS pending_count,
                            COALESCE(SUM(CASE WHEN r.status = 'APPROVED' THEN 1 ELSE 0 END), 0)
                                AS approved_count,
                            COALESCE(SUM(CASE WHEN r.status = 'REJECTED' THEN 1 ELSE 0 END), 0)
                                AS rejected_count,
                            COALESCE(SUM(CASE WHEN r.status = 'EFFECTIVE' THEN 1 ELSE 0 END), 0)
                                AS effective_count,
                            COUNT(DISTINCT r.order_id) AS related_order_count,
                            COUNT(DISTINCT r.node_instance_id) AS related_process_count,
                            COUNT(DISTINCT r.employee_user_id) AS related_employee_count,
                            COALESCE(SUM(CASE
                                WHEN r.created_at >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
                                     AND r.created_at < DATE_ADD(DATE_FORMAT(CURRENT_DATE, '%Y-%m-01'), INTERVAL 1 MONTH)
                                THEN r.amount ELSE 0 END), 0) AS monthly_amount
                        FROM production_reward_penalty_record r
                        """ + prefixClause);
        if (normalizedPrefix != null) {
            spec = spec.param("recordNoPattern", normalizedPrefix + "%");
        }
        RewardPenaltySummaryRow summary = spec.query((rs, rowNum) -> new RewardPenaltySummaryRow(
                        rs.getLong("total_record_count"),
                        rs.getLong("reward_count"),
                        rs.getLong("penalty_count"),
                        rs.getLong("pending_count"),
                        rs.getLong("approved_count"),
                        rs.getLong("rejected_count"),
                        rs.getLong("effective_count"),
                        rs.getLong("related_order_count"),
                        rs.getLong("related_process_count"),
                        rs.getLong("related_employee_count"),
                        roundedDecimal(rs.getBigDecimal("monthly_amount"), 2)))
                .single();

        return new ProductionRewardPenaltySummaryResponse(
                normalizedPrefix,
                summary.totalRecordCount(),
                summary.rewardCount(),
                summary.penaltyCount(),
                summary.pendingCount(),
                summary.approvedCount(),
                summary.rejectedCount(),
                summary.effectiveCount(),
                summary.relatedOrderCount(),
                summary.relatedProcessCount(),
                summary.relatedEmployeeCount(),
                summary.monthlyAmount(),
                LocalDateTime.now());
    }

    @Transactional
    public ReworkRecordResponse closeRework(long reworkId, ReworkCloseRequest request, BootstrapIdentity identity) {
        ReworkRow rework = lockRework(reworkId);
        NodeRow targetNode = lockNode(rework.targetNodeInstanceId());
        requireWorkerAssignment(targetNode, identity);
        if ("DONE".equals(rework.status())) {
            return loadRework(reworkId);
        }
        boolean hasReworkOutPass = jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM check_record
                        WHERE node_instance_id = :targetNodeInstanceId
                          AND check_type = 'OUT'
                          AND result = 'PASS'
                          AND check_id > :sourceCheckId
                        """)
                .param("targetNodeInstanceId", rework.targetNodeInstanceId())
                .param("sourceCheckId", rework.sourceCheckId())
                .query(Long.class)
                .single() > 0;
        if (!hasReworkOutPass) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "rework target OUT/PASS check is required before closing rework");
        }
        String reasonCategory = normalizeDictionaryValue(
                request.reasonCategory(), REWORK_REASON_CATEGORY_TYPE, "unsupported rework reason category");
        String responsibilityType = normalizeDictionaryValue(
                request.responsibilityType(), REWORK_RESPONSIBILITY_TYPE, "unsupported rework responsibility type");
        jdbcClient.sql("""
                        UPDATE rework_record
                        SET reason_category = :reasonCategory,
                            responsibility_type = :responsibilityType,
                            close_note = :closeNote,
                            closed_by_user_id = :closedByUserId,
                            closed_at = CURRENT_TIMESTAMP(3),
                            status = 'DONE'
                        WHERE rework_id = :reworkId
                        """)
                .param("reasonCategory", reasonCategory)
                .param("responsibilityType", responsibilityType)
                .param("closeNote", blankToNull(request.closeNote()))
                .param("closedByUserId", identity.userId())
                .param("reworkId", reworkId)
                .update();
        ReworkRecordResponse closed = loadRework(reworkId);
        ReworkNotificationRow notification = loadReworkNotification(reworkId);
        emitReworkNotification(
                notification,
                "REWORK_CLOSED",
                "CS",
                notification.csUserId(),
                "返工已关闭");
        return closed;
    }

    @Transactional
    public FinalInspectionReportResponse createFinalInspectionReport(
            FinalInspectionReportRequest request, BootstrapIdentity identity) {
        if (request.orderId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "order_id is required");
        }
        NodeRow finalNode = lockFinalNode(request.orderId());
        requireWorkerAssignment(finalNode, identity);
        FinalCheckRow finalCheck = findLatestFinalOutPass(finalNode.nodeInstanceId());
        FinalInspectionReportResponse existing = findFinalInspectionReport(request.orderId());
        if (existing != null) {
            return existing;
        }
        String summary = request.summary() == null || request.summary().isBlank()
                ? "终检通过"
                : request.summary().trim();
        List<Long> attachmentFileIds = normalizeAttachmentFileIds(request.attachmentFileIds());
        validateFinalInspectionAttachmentFiles(request.orderId(), attachmentFileIds);
        String reportNo = "FIR-" + request.orderId() + "-" + finalCheck.checkId();
        jdbcClient.sql("""
                        INSERT INTO final_inspection_report
                            (order_id, report_no, final_node_instance_id, final_check_id,
                             conclusion, summary, inspector_user_id, status)
                        VALUES
                            (:orderId, :reportNo, :finalNodeInstanceId, :finalCheckId,
                             'PASS', :summary, :inspectorUserId, 'ISSUED')
                        """)
                .param("orderId", request.orderId())
                .param("reportNo", reportNo)
                .param("finalNodeInstanceId", finalNode.nodeInstanceId())
                .param("finalCheckId", finalCheck.checkId())
                .param("summary", summary)
                .param("inspectorUserId", identity.userId())
                .update();
        long reportId = lastInsertId();
        insertFinalInspectionReportFiles(reportId, attachmentFileIds);
        return loadFinalInspectionReportById(reportId);
    }

    public FinalInspectionReportResponse getFinalInspectionReport(long orderId, BootstrapIdentity identity) {
        accessControlService.requireCheckRecordRead(identity);
        FinalInspectionReportResponse report = findFinalInspectionReport(orderId);
        if (report == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "final inspection report not found");
        }
        if (identity.role() == com.yuri.aiorder.common.UserRole.WORKER) {
            NodeRow finalNode = loadFinalNode(orderId);
            requireWorkerAssignment(finalNode, identity);
        }
        return report;
    }

    @Transactional
    public WorkLogResponse startWorkLog(WorkLogStartRequest request, BootstrapIdentity identity) {
        if (request.nodeInstanceId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "node_instance_id is required");
        }
        NodeRow node = lockNode(request.nodeInstanceId());
        requireWorkerAssignment(node, identity);
        if (!"IN_PROGRESS".equals(node.nodeStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "work log can start only for in-progress node");
        }
        Long existing = jdbcClient.sql("""
                        SELECT work_log_id
                        FROM work_log
                        WHERE node_instance_id = :nodeInstanceId
                          AND worker_user_id = :workerUserId
                          AND status IN ('IN_PROGRESS', 'PAUSED')
                        ORDER BY work_log_id DESC
                        LIMIT 1
                        """)
                .param("nodeInstanceId", node.nodeInstanceId())
                .param("workerUserId", identity.userId())
                .query(Long.class)
                .optional()
                .orElse(null);
        if (existing != null) {
            return loadWorkLog(existing, true);
        }
        jdbcClient.sql("""
                        INSERT INTO work_log
                            (order_id, node_instance_id, worker_user_id, started_at, status)
                        VALUES
                            (:orderId, :nodeInstanceId, :workerUserId, CURRENT_TIMESTAMP(3), 'IN_PROGRESS')
                        """)
                .param("orderId", node.orderId())
                .param("nodeInstanceId", node.nodeInstanceId())
                .param("workerUserId", identity.userId())
                .update();
        return loadWorkLog(lastInsertId(), true);
    }

    @Transactional
    public WorkLogResponse pauseWorkLog(long workLogId, BootstrapIdentity identity) {
        WorkLogRow workLog = lockWorkLog(workLogId);
        requireWorkLogOwner(workLog, identity);
        if ("IN_PROGRESS".equals(workLog.status())) {
            boolean hasOpenPause = hasOpenPause(workLogId);
            if (!hasOpenPause) {
                jdbcClient.sql("""
                                INSERT INTO work_log_pause_segment (work_log_id, paused_at)
                                VALUES (:workLogId, CURRENT_TIMESTAMP(3))
                                """)
                        .param("workLogId", workLogId)
                        .update();
            }
            jdbcClient.sql("UPDATE work_log SET status = 'PAUSED' WHERE work_log_id = :workLogId")
                    .param("workLogId", workLogId)
                    .update();
        }
        return loadWorkLog(workLogId, true);
    }

    @Transactional
    public WorkLogResponse resumeWorkLog(long workLogId, BootstrapIdentity identity) {
        WorkLogRow workLog = lockWorkLog(workLogId);
        requireWorkLogOwner(workLog, identity);
        if ("PAUSED".equals(workLog.status())) {
            closeOpenPause(workLogId);
            jdbcClient.sql("UPDATE work_log SET status = 'IN_PROGRESS' WHERE work_log_id = :workLogId")
                    .param("workLogId", workLogId)
                    .update();
        }
        return loadWorkLog(workLogId, true);
    }

    @Transactional
    public WorkLogResponse finishWorkLog(long workLogId, BootstrapIdentity identity) {
        WorkLogRow workLog = lockWorkLog(workLogId);
        requireWorkLogOwner(workLog, identity);
        if ("COMPLETED".equals(workLog.status())) {
            return loadWorkLog(workLogId, true);
        }
        if ("PAUSED".equals(workLog.status())) {
            closeOpenPause(workLogId);
        }
        jdbcClient.sql("""
                        UPDATE work_log
                        SET finished_at = CURRENT_TIMESTAMP(3),
                            effective_duration_seconds = GREATEST(
                                TIMESTAMPDIFF(SECOND, started_at, CURRENT_TIMESTAMP(3)) - pause_duration_seconds,
                                0
                            ),
                            status = 'COMPLETED'
                        WHERE work_log_id = :workLogId
                        """)
                .param("workLogId", workLogId)
                .update();
        return loadWorkLog(workLogId, true);
    }

    public PerformanceStatsResponse getPerformance(
            Long requestedUserId, LocalDate startDate, LocalDate endDate, BootstrapIdentity identity) {
        Long targetUserId = accessControlService.resolvePerformanceTargetUserId(identity, requestedUserId);
        PerformancePeriodFilter period = performancePeriodFilter(startDate, endDate);
        long completedCount = countLong("""
                        SELECT COUNT(*)
                        FROM work_log w
                        WHERE w.worker_user_id = :userId
                          AND w.status = 'COMPLETED'
                        """ + periodSql(period, "w.finished_at"), targetUserId, period);
        long effectiveSeconds = countLong("""
                        SELECT COALESCE(SUM(w.effective_duration_seconds), 0)
                        FROM work_log w
                        WHERE w.worker_user_id = :userId
                          AND w.status = 'COMPLETED'
                        """ + periodSql(period, "w.finished_at"), targetUserId, period);
        long reworkCount = countLong("""
                        SELECT COUNT(*)
                        FROM rework_record r
                        JOIN order_process_node n ON n.node_instance_id = r.target_node_instance_id
                        WHERE n.assigned_user_id = :userId
                        """ + periodSql(period, "r.created_at"), targetUserId, period);
        long responsibleReworkCount = countLong("""
                        SELECT COUNT(*)
                        FROM rework_record r
                        JOIN order_process_node n ON n.node_instance_id = r.target_node_instance_id
                        WHERE n.assigned_user_id = :userId
                          AND r.responsibility_type = 'WORKER'
                        """ + periodSql(period, "r.created_at"), targetUserId, period);
        long nonWorkerResponsibilityReworkCount = countLong("""
                        SELECT COUNT(*)
                        FROM rework_record r
                        JOIN order_process_node n ON n.node_instance_id = r.target_node_instance_id
                        WHERE n.assigned_user_id = :userId
                          AND r.responsibility_type IN ('DOCTOR', 'CS', 'SYSTEM')
                        """ + periodSql(period, "r.created_at"), targetUserId, period);
        long unclassifiedReworkCount = countLong("""
                        SELECT COUNT(*)
                        FROM rework_record r
                        JOIN order_process_node n ON n.node_instance_id = r.target_node_instance_id
                        WHERE n.assigned_user_id = :userId
                          AND r.responsibility_type IS NULL
                        """ + periodSql(period, "r.created_at"), targetUserId, period);
        long outCheckTotal = countLong("""
                        SELECT COUNT(*)
                        FROM check_record c
                        JOIN order_process_node n ON n.node_instance_id = c.node_instance_id
                        WHERE n.assigned_user_id = :userId
                          AND c.check_type = 'OUT'
                        """ + periodSql(period, "c.created_at"), targetUserId, period);
        long outCheckPass = countLong("""
                        SELECT COUNT(*)
                        FROM check_record c
                        JOIN order_process_node n ON n.node_instance_id = c.node_instance_id
                        WHERE n.assigned_user_id = :userId
                          AND c.check_type = 'OUT'
                          AND c.result = 'PASS'
                        """ + periodSql(period, "c.created_at"), targetUserId, period);
        long onTimeCount = countLong("""
                        SELECT COUNT(*)
                        FROM work_log w
                        JOIN order_process_node n ON n.node_instance_id = w.node_instance_id
                        WHERE w.worker_user_id = :userId
                          AND w.status = 'COMPLETED'
                          AND n.standard_duration IS NOT NULL
                          AND w.effective_duration_seconds <= n.standard_duration
                        """ + periodSql(period, "w.finished_at"), targetUserId, period);
        long standardSeconds = countLong("""
                        SELECT COALESCE(SUM(n.standard_duration), 0)
                        FROM work_log w
                        JOIN order_process_node n ON n.node_instance_id = w.node_instance_id
                        WHERE w.worker_user_id = :userId
                          AND w.status = 'COMPLETED'
                          AND n.standard_duration IS NOT NULL
                        """ + periodSql(period, "w.finished_at"), targetUserId, period);
        long standardCoveredCount = countLong("""
                        SELECT COUNT(*)
                        FROM work_log w
                        JOIN order_process_node n ON n.node_instance_id = w.node_instance_id
                        WHERE w.worker_user_id = :userId
                          AND w.status = 'COMPLETED'
                          AND n.standard_duration IS NOT NULL
                        """ + periodSql(period, "w.finished_at"), targetUserId, period);
        long standardMissingCount = Math.max(completedCount - standardCoveredCount, 0);
        int onTimeRate = percent(onTimeCount, completedCount);
        int passRate = percent(outCheckPass, outCheckTotal);
        int durationEfficiency = effectiveSeconds == 0
                ? 0
                : Math.toIntExact(Math.round((standardSeconds * 100.0) / effectiveSeconds));
        return new PerformanceStatsResponse(
                targetUserId,
                PERFORMANCE_FORMULA_VERSION,
                completedCount,
                effectiveSeconds / 60,
                standardSeconds / 60,
                standardCoveredCount,
                standardMissingCount,
                percent(standardCoveredCount, completedCount),
                reworkCount,
                responsibleReworkCount,
                nonWorkerResponsibilityReworkCount,
                unclassifiedReworkCount,
                onTimeRate,
                passRate,
                durationEfficiency,
                performanceScore(durationEfficiency, passRate, onTimeRate, responsibleReworkCount, unclassifiedReworkCount));
    }

    public List<PerformanceDetailResponse> getPerformanceDetails(
            Long requestedUserId, LocalDate startDate, LocalDate endDate, BootstrapIdentity identity) {
        Long targetUserId = accessControlService.resolvePerformanceTargetUserId(identity, requestedUserId);
        PerformancePeriodFilter period = performancePeriodFilter(startDate, endDate);
        var statement = jdbcClient.sql("""
                        SELECT
                            w.work_log_id,
                            w.order_id,
                            o.order_no,
                            w.node_instance_id,
                            n.process_name,
                            w.worker_user_id,
                            w.status,
                            w.effective_duration_seconds,
                            n.standard_duration,
                            w.started_at,
                            w.finished_at
                        FROM work_log w
                        JOIN orders o ON o.order_id = w.order_id
                        JOIN order_process_node n ON n.node_instance_id = w.node_instance_id
                        WHERE w.worker_user_id = :userId
                          AND w.status = 'COMPLETED'
                        """ + periodSql(period, "w.finished_at") + """
                        ORDER BY w.finished_at DESC, w.work_log_id DESC
                        LIMIT 100
                        """)
                .param("userId", targetUserId);
        statement = bindPeriod(statement, period);
        return statement.query((rs, rowNum) -> {
                    Integer effectiveSeconds = rs.getObject("effective_duration_seconds", Integer.class);
                    Integer standardSeconds = rs.getObject("standard_duration", Integer.class);
                    Boolean onTime = standardSeconds == null || effectiveSeconds == null
                            ? null
                            : effectiveSeconds <= standardSeconds;
                    return new PerformanceDetailResponse(
                            rs.getLong("work_log_id"),
                            rs.getLong("order_id"),
                            rs.getString("order_no"),
                            rs.getLong("node_instance_id"),
                            rs.getString("process_name"),
                            rs.getLong("worker_user_id"),
                            rs.getString("status"),
                            effectiveSeconds == null ? null : effectiveSeconds / 60,
                            standardSeconds == null ? null : standardSeconds / 60,
                            onTime,
                            rs.getObject("started_at", LocalDateTime.class),
                            rs.getObject("finished_at", LocalDateTime.class));
                })
                .list();
    }

    private Long createRework(NodeRow node, long checkId, CheckRecordRequest request) {
        if (request.reworkToNodeId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "rework_to_node_id is required when out-check fails");
        }
        NodeRow target = lockNode(request.reworkToNodeId());
        if (target.orderId() != node.orderId()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "rework target must belong to same order");
        }
        List<Long> impactedNodeIds = findImpactedResettableDownstreamNodeIds(target);
        jdbcClient.sql("""
                        INSERT INTO rework_record
                            (order_id, source_check_id, from_node_instance_id, target_node_instance_id,
                             impacted_node_count, impacted_node_instance_ids, reason_detail, status)
                        VALUES
                            (:orderId, :sourceCheckId, :fromNodeInstanceId, :targetNodeInstanceId,
                             :impactedNodeCount, CAST(:impactedNodeInstanceIds AS JSON), :reasonDetail, 'PENDING')
                        """)
                .param("orderId", node.orderId())
                .param("sourceCheckId", checkId)
                .param("fromNodeInstanceId", node.nodeInstanceId())
                .param("targetNodeInstanceId", target.nodeInstanceId())
                .param("impactedNodeCount", impactedNodeIds.size())
                .param("impactedNodeInstanceIds", serializeImpactedNodeInstanceIds(impactedNodeIds))
                .param("reasonDetail", request.remark())
                .update();
        long reworkId = lastInsertId();
        resetImpactedDownstreamNodes(target);
        jdbcClient.sql("""
                        UPDATE order_process_node
                        SET node_status = 'READY',
                            started_at = NULL,
                            completed_at = NULL
                        WHERE node_instance_id = :nodeInstanceId
                        """)
                .param("nodeInstanceId", target.nodeInstanceId())
                .update();
        jdbcClient.sql("""
                        UPDATE order_process_instance
                        SET instance_status = 'ACTIVE'
                        WHERE instance_id = :instanceId
                        """)
                .param("instanceId", target.instanceId())
                .update();
        emitReworkNotification(
                loadReworkNotification(reworkId),
                "REWORK_CREATED",
                "WORKER",
                target.assignedUserId(),
                "返工待处理");
        return reworkId;
    }

    private void resetImpactedDownstreamNodes(NodeRow target) {
        jdbcClient.sql("""
                        WITH RECURSIVE impacted_nodes(node_instance_id) AS (
                            SELECT edge.to_node_instance_id
                            FROM order_process_edge edge
                            WHERE edge.instance_id = :instanceId
                              AND edge.from_node_instance_id = :targetNodeInstanceId
                            UNION DISTINCT
                            SELECT edge.to_node_instance_id
                            FROM order_process_edge edge
                            JOIN impacted_nodes impacted
                              ON impacted.node_instance_id = edge.from_node_instance_id
                            WHERE edge.instance_id = :instanceId
                        )
                        UPDATE order_process_node node
                        JOIN impacted_nodes impacted
                          ON impacted.node_instance_id = node.node_instance_id
                        SET node.node_status = 'PENDING',
                            node.started_at = NULL,
                            node.completed_at = NULL
                        WHERE node.instance_id = :instanceId
                          AND node.node_status IN ('READY', 'COMPLETED')
                        """)
                .param("instanceId", target.instanceId())
                .param("targetNodeInstanceId", target.nodeInstanceId())
                .update();
    }

    private List<Long> findImpactedResettableDownstreamNodeIds(NodeRow target) {
        return jdbcClient.sql("""
                        WITH RECURSIVE impacted_nodes(node_instance_id) AS (
                            SELECT edge.to_node_instance_id
                            FROM order_process_edge edge
                            WHERE edge.instance_id = :instanceId
                              AND edge.from_node_instance_id = :targetNodeInstanceId
                            UNION DISTINCT
                            SELECT edge.to_node_instance_id
                            FROM order_process_edge edge
                            JOIN impacted_nodes impacted
                              ON impacted.node_instance_id = edge.from_node_instance_id
                            WHERE edge.instance_id = :instanceId
                        )
                        SELECT node.node_instance_id
                        FROM order_process_node node
                        JOIN impacted_nodes impacted
                          ON impacted.node_instance_id = node.node_instance_id
                        WHERE node.instance_id = :instanceId
                          AND node.node_status IN ('READY', 'COMPLETED')
                        ORDER BY node.step_order, node.node_instance_id
                        """)
                .param("instanceId", target.instanceId())
                .param("targetNodeInstanceId", target.nodeInstanceId())
                .query(Long.class)
                .list();
    }

    private void closeOpenPause(long workLogId) {
        jdbcClient.sql("""
                        UPDATE work_log w
                        JOIN work_log_pause_segment p ON p.work_log_id = w.work_log_id
                        SET w.pause_duration_seconds = w.pause_duration_seconds
                                + GREATEST(TIMESTAMPDIFF(SECOND, p.paused_at, CURRENT_TIMESTAMP(3)), 0),
                            p.resumed_at = CURRENT_TIMESTAMP(3)
                        WHERE w.work_log_id = :workLogId
                          AND p.resumed_at IS NULL
                        """)
                .param("workLogId", workLogId)
                .update();
    }

    private NodeRow lockFinalNode(long orderId) {
        try {
            return jdbcClient.sql("""
                            SELECT
                                n.node_instance_id,
                                n.instance_id,
                                i.order_id,
                                n.assigned_user_id,
                                n.node_status
                            FROM order_process_node n
                            JOIN order_process_instance i ON i.instance_id = n.instance_id
                            WHERE i.order_id = :orderId
                              AND n.step_order = (
                                  SELECT MAX(last_node.step_order)
                                  FROM order_process_node last_node
                                  JOIN order_process_instance last_instance
                                    ON last_instance.instance_id = last_node.instance_id
                                  WHERE last_instance.order_id = :orderId
                              )
                            ORDER BY n.node_instance_id DESC
                            LIMIT 1
                            FOR UPDATE
                            """)
                    .param("orderId", orderId)
                    .query((rs, rowNum) -> new NodeRow(
                            rs.getLong("node_instance_id"),
                            rs.getLong("instance_id"),
                            rs.getLong("order_id"),
                            rs.getObject("assigned_user_id", Long.class),
                            rs.getString("node_status")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "final process node not found", ex);
        }
    }

    private NodeRow loadFinalNode(long orderId) {
        try {
            return jdbcClient.sql("""
                            SELECT
                                n.node_instance_id,
                                n.instance_id,
                                i.order_id,
                                n.assigned_user_id,
                                n.node_status
                            FROM order_process_node n
                            JOIN order_process_instance i ON i.instance_id = n.instance_id
                            WHERE i.order_id = :orderId
                              AND n.step_order = (
                                  SELECT MAX(last_node.step_order)
                                  FROM order_process_node last_node
                                  JOIN order_process_instance last_instance
                                    ON last_instance.instance_id = last_node.instance_id
                                  WHERE last_instance.order_id = :orderId
                              )
                            ORDER BY n.node_instance_id DESC
                            LIMIT 1
                            """)
                    .param("orderId", orderId)
                    .query((rs, rowNum) -> new NodeRow(
                            rs.getLong("node_instance_id"),
                            rs.getLong("instance_id"),
                            rs.getLong("order_id"),
                            rs.getObject("assigned_user_id", Long.class),
                            rs.getString("node_status")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "final process node not found", ex);
        }
    }

    private FinalCheckRow findLatestFinalOutPass(long finalNodeInstanceId) {
        return jdbcClient.sql("""
                        SELECT check_id
                        FROM check_record
                        WHERE node_instance_id = :nodeInstanceId
                          AND check_type = 'OUT'
                          AND result = 'PASS'
                        ORDER BY check_id DESC
                        LIMIT 1
                        """)
                .param("nodeInstanceId", finalNodeInstanceId)
                .query((rs, rowNum) -> new FinalCheckRow(rs.getLong("check_id")))
                .optional()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT, "final OUT/PASS check is required before final inspection report"));
    }

    private FinalInspectionReportResponse findFinalInspectionReport(long orderId) {
        return jdbcClient.sql("""
                        SELECT report_id, order_id, report_no, final_node_instance_id, final_check_id,
                               conclusion, summary, inspector_user_id, status, created_at
                        FROM final_inspection_report
                        WHERE order_id = :orderId
                        """)
                .param("orderId", orderId)
                .query((rs, rowNum) -> new FinalInspectionReportResponse(
                        rs.getLong("report_id"),
                        rs.getLong("order_id"),
                        rs.getString("report_no"),
                        rs.getLong("final_node_instance_id"),
                        rs.getLong("final_check_id"),
                        rs.getString("conclusion"),
                        rs.getString("summary"),
                        rs.getObject("inspector_user_id", Long.class),
                        rs.getString("status"),
                        rs.getObject("created_at", LocalDateTime.class),
                        loadFinalInspectionAttachmentFileIds(rs.getLong("report_id"))))
                .optional()
                .orElse(null);
    }

    private FinalInspectionReportResponse loadFinalInspectionReportById(long reportId) {
        return jdbcClient.sql("""
                        SELECT report_id, order_id, report_no, final_node_instance_id, final_check_id,
                               conclusion, summary, inspector_user_id, status, created_at
                        FROM final_inspection_report
                        WHERE report_id = :reportId
                        """)
                .param("reportId", reportId)
                .query((rs, rowNum) -> new FinalInspectionReportResponse(
                        rs.getLong("report_id"),
                        rs.getLong("order_id"),
                        rs.getString("report_no"),
                        rs.getLong("final_node_instance_id"),
                        rs.getLong("final_check_id"),
                        rs.getString("conclusion"),
                        rs.getString("summary"),
                        rs.getObject("inspector_user_id", Long.class),
                        rs.getString("status"),
                        rs.getObject("created_at", LocalDateTime.class),
                        loadFinalInspectionAttachmentFileIds(rs.getLong("report_id"))))
                .single();
    }

    private List<Long> normalizeAttachmentFileIds(List<Long> attachmentFileIds) {
        if (attachmentFileIds == null || attachmentFileIds.isEmpty()) {
            return List.of();
        }
        return attachmentFileIds.stream()
                .filter(fileId -> fileId != null && fileId > 0)
                .distinct()
                .toList();
    }

    private void validateFinalInspectionAttachmentFiles(long orderId, List<Long> attachmentFileIds) {
        if (attachmentFileIds.isEmpty()) {
            return;
        }
        long validCount = jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM file_resource
                        WHERE order_id = :orderId
                          AND status = 'ACTIVE'
                          AND upload_status = 'COMPLETED'
                          AND visibility = 'INTERNAL'
                          AND file_id IN (:fileIds)
                        """)
                .param("orderId", orderId)
                .param("fileIds", attachmentFileIds)
                .query(Long.class)
                .single();
        if (validCount != attachmentFileIds.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "final inspection attachments must be completed internal files for this order");
        }
    }

    private void insertFinalInspectionReportFiles(long reportId, List<Long> attachmentFileIds) {
        for (int index = 0; index < attachmentFileIds.size(); index++) {
            jdbcClient.sql("""
                            INSERT INTO final_inspection_report_file (report_id, file_id, sort_order)
                            VALUES (:reportId, :fileId, :sortOrder)
                            """)
                    .param("reportId", reportId)
                    .param("fileId", attachmentFileIds.get(index))
                    .param("sortOrder", index + 1)
                    .update();
        }
    }

    private List<Long> loadFinalInspectionAttachmentFileIds(long reportId) {
        return jdbcClient.sql("""
                        SELECT file_id
                        FROM final_inspection_report_file
                        WHERE report_id = :reportId
                        ORDER BY sort_order, file_id
                        """)
                .param("reportId", reportId)
                .query(Long.class)
                .list();
    }

    private ReworkRow lockRework(long reworkId) {
        try {
            return jdbcClient.sql("""
                            SELECT rework_id, source_check_id, target_node_instance_id, status
                            FROM rework_record
                            WHERE rework_id = :reworkId
                            FOR UPDATE
                            """)
                    .param("reworkId", reworkId)
                    .query((rs, rowNum) -> new ReworkRow(
                            rs.getLong("rework_id"),
                            rs.getLong("source_check_id"),
                            rs.getLong("target_node_instance_id"),
                            rs.getString("status")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "rework record not found", ex);
        }
    }

    private ReworkRecordResponse loadRework(long reworkId) {
        try {
            return jdbcClient.sql("""
                            SELECT
                                r.rework_id,
                                r.order_id,
                                o.order_no,
                                r.source_check_id,
                                r.from_node_instance_id,
                                from_node.process_name AS from_process_name,
                            r.target_node_instance_id,
                            target_node.process_name AS target_process_name,
                            target_node.node_status AS target_node_status,
                            r.impacted_node_count,
                            CAST(r.impacted_node_instance_ids AS CHAR) AS impacted_node_instance_ids,
                            target_node.assigned_user_id,
                                r.reason_category,
                                r.reason_detail,
                                r.responsibility_type,
                                r.close_note,
                                r.closed_by_user_id,
                                r.closed_at,
                                r.status,
                                r.created_at
                            FROM rework_record r
                            JOIN orders o ON o.order_id = r.order_id
                            LEFT JOIN order_process_node from_node
                              ON from_node.node_instance_id = r.from_node_instance_id
                            LEFT JOIN order_process_node target_node
                              ON target_node.node_instance_id = r.target_node_instance_id
                            WHERE r.rework_id = :reworkId
                            """)
                    .param("reworkId", reworkId)
                    .query((rs, rowNum) -> new ReworkRecordResponse(
                            rs.getLong("rework_id"),
                            rs.getLong("order_id"),
                            rs.getString("order_no"),
                            rs.getLong("source_check_id"),
                            rs.getObject("from_node_instance_id", Long.class),
                            rs.getString("from_process_name"),
                            rs.getObject("target_node_instance_id", Long.class),
                            rs.getString("target_process_name"),
                            rs.getString("target_node_status"),
                            rs.getInt("impacted_node_count"),
                            parseImpactedNodeInstanceIds(rs.getString("impacted_node_instance_ids")),
                            rs.getObject("assigned_user_id", Long.class),
                            rs.getString("reason_category"),
                            rs.getString("reason_detail"),
                            rs.getString("responsibility_type"),
                            rs.getString("close_note"),
                            rs.getObject("closed_by_user_id", Long.class),
                            rs.getObject("closed_at", LocalDateTime.class),
                            rs.getString("status"),
                            rs.getObject("created_at", LocalDateTime.class)))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "rework record not found", ex);
        }
    }

    private ReworkNotificationRow loadReworkNotification(long reworkId) {
        return jdbcClient.sql("""
                        SELECT
                            r.rework_id,
                            r.order_id,
                            o.order_no,
                            o.cs_user_id,
                            r.target_node_instance_id
                        FROM rework_record r
                        JOIN orders o ON o.order_id = r.order_id
                        WHERE r.rework_id = :reworkId
                        """)
                .param("reworkId", reworkId)
                .query((rs, rowNum) -> new ReworkNotificationRow(
                        rs.getLong("rework_id"),
                        rs.getLong("order_id"),
                        rs.getString("order_no"),
                        rs.getObject("cs_user_id", Long.class),
                        rs.getLong("target_node_instance_id")))
                .single();
    }

    private void emitReworkNotification(
            ReworkNotificationRow rework, String eventType, String audienceRole, Long userId, String message) {
        String payload = reworkPayload(rework, eventType, message);
        jdbcClient.sql("""
                        INSERT INTO notification_event
                            (order_id, event_type, audience_role, payload, delivery_status)
                        VALUES
                            (:orderId, :eventType, :audienceRole, CAST(:payload AS JSON), 'PENDING')
                        """)
                .param("orderId", rework.orderId())
                .param("eventType", eventType)
                .param("audienceRole", audienceRole)
                .param("payload", payload)
                .update();
        long eventId = lastInsertId();
        if (userId == null) {
            return;
        }
        jdbcClient.sql("""
                        INSERT IGNORE INTO user_notification (event_id, user_id)
                        VALUES (:eventId, :userId)
                        """)
                .param("eventId", eventId)
                .param("userId", userId)
                .update();
        notificationPushService.pushToUser(userId, eventId, payload);
    }

    private String reworkPayload(ReworkNotificationRow rework, String eventType, String message) {
        try {
            return objectMapper.writeValueAsString(new ReworkNotificationPayload(
                    eventType,
                    rework.orderId(),
                    rework.orderNo(),
                    message,
                    rework.reworkId(),
                    rework.targetNodeInstanceId()));
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "failed to build rework notification payload", ex);
        }
    }

    private boolean hasOpenPause(long workLogId) {
        return jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM work_log_pause_segment
                        WHERE work_log_id = :workLogId
                          AND resumed_at IS NULL
                        """)
                .param("workLogId", workLogId)
                .query(Long.class)
                .single() > 0;
    }

    private WorkLogResponse loadWorkLog(long workLogId, boolean requireExisting) {
        try {
            return jdbcClient.sql("""
                            SELECT work_log_id, node_instance_id, worker_user_id, status,
                                   pause_duration_seconds, effective_duration_seconds
                            FROM work_log
                            WHERE work_log_id = :workLogId
                            """)
                    .param("workLogId", workLogId)
                    .query((rs, rowNum) -> new WorkLogResponse(
                            rs.getLong("work_log_id"),
                            rs.getLong("node_instance_id"),
                            rs.getLong("worker_user_id"),
                            rs.getString("status"),
                            rs.getInt("pause_duration_seconds"),
                            rs.getObject("effective_duration_seconds", Integer.class)))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            if (requireExisting) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "work log not found", ex);
            }
            return null;
        }
    }

    private NodeRow lockNode(long nodeInstanceId) {
        try {
            return jdbcClient.sql("""
                            SELECT
                                n.node_instance_id,
                                n.instance_id,
                                i.order_id,
                                n.assigned_user_id,
                                n.node_status
                            FROM order_process_node n
                            JOIN order_process_instance i ON i.instance_id = n.instance_id
                            WHERE n.node_instance_id = :nodeInstanceId
                            FOR UPDATE
                            """)
                    .param("nodeInstanceId", nodeInstanceId)
                    .query((rs, rowNum) -> new NodeRow(
                            rs.getLong("node_instance_id"),
                            rs.getLong("instance_id"),
                            rs.getLong("order_id"),
                            rs.getObject("assigned_user_id", Long.class),
                            rs.getString("node_status")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "process node not found", ex);
        }
    }

    private WorkLogRow lockWorkLog(long workLogId) {
        try {
            return jdbcClient.sql("""
                            SELECT work_log_id, worker_user_id, status, started_at
                            FROM work_log
                            WHERE work_log_id = :workLogId
                            FOR UPDATE
                            """)
                    .param("workLogId", workLogId)
                    .query((rs, rowNum) -> new WorkLogRow(
                            rs.getLong("work_log_id"),
                            rs.getLong("worker_user_id"),
                            rs.getString("status"),
                            rs.getObject("started_at", LocalDateTime.class)))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "work log not found", ex);
        }
    }

    private void requireWorkerAssignment(NodeRow node, BootstrapIdentity identity) {
        accessControlService.requireAssignedWorkerOrAdmin(identity, node.assignedUserId(), "worker cannot operate this node");
    }

    private void requireWorkLogOwner(WorkLogRow workLog, BootstrapIdentity identity) {
        accessControlService.requireAssignedWorkerOrAdmin(
                identity, workLog.workerUserId(), "worker cannot operate this work log");
    }

    private String normalizeCheckType(int checkType) {
        return switch (checkType) {
            case 1 -> "IN";
            case 2 -> "OUT";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unsupported check_type");
        };
    }

    private Integer denormalizeCheckType(String checkType) {
        if ("IN".equals(checkType)) {
            return 1;
        }
        if ("OUT".equals(checkType)) {
            return 2;
        }
        return null;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String serializeImpactedNodeInstanceIds(List<Long> nodeInstanceIds) {
        try {
            return objectMapper.writeValueAsString(nodeInstanceIds);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "failed to build rework impact audit payload", ex);
        }
    }

    private List<Long> parseImpactedNodeInstanceIds(String payload) {
        if (payload == null || payload.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(payload, LONG_LIST_TYPE);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "failed to parse rework impact audit payload", ex);
        }
    }

    private String normalizeDictionaryValue(
            String value, String dictionaryType, String unsupportedMessage) {
        String normalized = blankToNull(value);
        if (normalized == null) {
            return null;
        }
        String upper = normalized.toUpperCase(Locale.ROOT);
        boolean supported = jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM rework_dictionary_item
                        WHERE dictionary_type = :dictionaryType
                          AND item_code = :code
                          AND status = 'ACTIVE'
                        """)
                .param("dictionaryType", dictionaryType)
                .param("code", upper)
                .query(Long.class)
                .single() > 0;
        if (!supported) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, unsupportedMessage);
        }
        return upper;
    }

    private List<ReworkDictionaryOption> listActiveReworkDictionaryOptions(String dictionaryType) {
        return jdbcClient.sql("""
                        SELECT item_code, item_label
                        FROM rework_dictionary_item
                        WHERE dictionary_type = :dictionaryType
                          AND status = 'ACTIVE'
                        ORDER BY sort_order, item_id
                        """)
                .param("dictionaryType", dictionaryType)
                .query((rs, rowNum) -> new ReworkDictionaryOption(
                        rs.getString("item_code"),
                        rs.getString("item_label")))
                .list();
    }

    private ReworkDictionaryItemResponse requireReworkDictionaryItem(long itemId) {
        return jdbcClient.sql("""
                        SELECT item_id, dictionary_type, item_code, item_label, sort_order, status
                        FROM rework_dictionary_item
                        WHERE item_id = :itemId
                        """)
                .param("itemId", itemId)
                .query((rs, rowNum) -> new ReworkDictionaryItemResponse(
                        rs.getLong("item_id"),
                        rs.getString("dictionary_type"),
                        rs.getString("item_code"),
                        rs.getString("item_label"),
                        rs.getInt("sort_order"),
                        rs.getString("status")))
                .optional()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "rework dictionary item not found"));
    }

    private String normalizeReworkDictionaryType(String dictionaryType) {
        String normalized = normalizeRequired(dictionaryType, "dictionary_type").toUpperCase(Locale.ROOT);
        if (!REWORK_DICTIONARY_TYPES.contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unsupported rework dictionary type");
        }
        return normalized;
    }

    private String normalizeReworkDictionaryStatus(String status) {
        String normalized = normalizeRequired(status, "status").toUpperCase(Locale.ROOT);
        if (!REWORK_DICTIONARY_STATUS.contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unsupported rework dictionary status");
        }
        return normalized;
    }

    private String normalizeRequired(String value, String fieldName) {
        String normalized = blankToNull(value);
        if (normalized == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " is required");
        }
        return normalized;
    }

    private long lastInsertId() {
        return jdbcClient.sql("SELECT LAST_INSERT_ID()")
                .query(Long.class)
                .single();
    }

    private long countLong(String sql, Long userId) {
        return jdbcClient.sql(sql)
                .param("userId", userId)
                .query(Long.class)
                .single();
    }


    private long countLong(String sql, Long userId, PerformancePeriodFilter period) {
        JdbcClient.StatementSpec statement = jdbcClient.sql(sql)
                .param("userId", userId);
        statement = bindPeriod(statement, period);
        return statement.query(Long.class)
                .single();
    }

    private PerformancePeriodFilter performancePeriodFilter(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "end_date cannot be before start_date");
        }
        LocalDateTime startAt = startDate == null ? null : startDate.atStartOfDay();
        LocalDateTime endExclusive = endDate == null ? null : endDate.plusDays(1).atStartOfDay();
        return new PerformancePeriodFilter(startAt, endExclusive);
    }

    private String periodSql(PerformancePeriodFilter period, String columnName) {
        StringBuilder sql = new StringBuilder();
        if (period.startAt() != null) {
            sql.append(" AND ").append(columnName).append(" >= :periodStartAt\n");
        }
        if (period.endExclusive() != null) {
            sql.append(" AND ").append(columnName).append(" < :periodEndExclusive\n");
        }
        return sql.toString();
    }

    private JdbcClient.StatementSpec bindPeriod(JdbcClient.StatementSpec statement, PerformancePeriodFilter period) {
        if (period.startAt() != null) {
            statement = statement.param("periodStartAt", period.startAt());
        }
        if (period.endExclusive() != null) {
            statement = statement.param("periodEndExclusive", period.endExclusive());
        }
        return statement;
    }

    private int percent(long part, long total) {
        if (total == 0) {
            return 0;
        }
        return Math.toIntExact(Math.round((part * 100.0) / total));
    }


    private int performanceScore(
            int durationEfficiency,
            int passRate,
            int onTimeRate,
            long responsibleReworkCount,
            long unclassifiedReworkCount) {
        int cappedEfficiency = Math.min(durationEfficiency, 120);
        long penalty = responsibleReworkCount * 10 + unclassifiedReworkCount * 5;
        long score = Math.round(cappedEfficiency * 0.4 + passRate * 0.3 + onTimeRate * 0.2 + 10 - penalty);
        return Math.toIntExact(Math.max(0, Math.min(score, 100)));
    }

    private double percentage(long part, long total) {
        if (total == 0) {
            return 0.0;
        }
        return BigDecimal.valueOf(part * 100.0 / total)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private double roundedDecimal(BigDecimal value) {
        return roundedDecimal(value, 1);
    }

    private double roundedDecimal(BigDecimal value, int scale) {
        if (value == null) {
            return 0.0;
        }
        return value.setScale(scale, RoundingMode.HALF_UP).doubleValue();
    }

    private record PerformancePeriodFilter(
            LocalDateTime startAt,
            LocalDateTime endExclusive) {
    }

    private record NodeRow(
            long nodeInstanceId,
            long instanceId,
            long orderId,
            Long assignedUserId,
            String nodeStatus) {
    }

    private record WorkLogRow(
            long workLogId,
            long workerUserId,
            String status,
            LocalDateTime startedAt) {
    }

    private record ReworkRow(
            long reworkId,
            long sourceCheckId,
            long targetNodeInstanceId,
            String status) {
    }

    private record QualityCheckSummaryRow(
            long inspectedOrderCount,
            long firstPassCount,
            long finalPassCount) {
    }

    private record QualityReworkSummaryRow(
            long totalReworkCount,
            long internalReworkCount,
            long externalReworkCount,
            long unclassifiedReworkCount) {
    }

    private record EquipmentSummaryRow(
            long totalEquipmentCount,
            long runningCount,
            long idleCount,
            long maintenanceCount,
            long faultCount,
            double averageUtilizationRate) {
    }

    private record EquipmentEventSummaryRow(
            long pendingMaintenanceCount,
            long openFaultCount,
            long downtimeMinutes) {
    }

    private record MaterialExceptionSummaryRow(
            long totalExceptionCount,
            long shortageCount,
            long wrongMaterialCount,
            long batchAbnormalCount,
            long materialLossCount,
            long pendingCount,
            long inProgressCount,
            long closedCount,
            long responsibilityAssignedCount,
            double totalLossQuantity) {
    }

    private record SafetyEnvironmentSummaryRow(
            long totalEventCount,
            long safetyInspectionCount,
            long hazardRectificationCount,
            long environmentRecordCount,
            long ppeDeviceReminderCount,
            long pendingCount,
            long inProgressCount,
            long closedCount,
            long overdueCount,
            long highRiskCount) {
    }

    private record CostSummaryRow(
            long recordCount,
            double totalCostAmount,
            double processCostAmount,
            double materialCostAmount,
            double laborCostAmount,
            double reworkCostAmount,
            double outsourcingCostAmount,
            long abnormalWarningCount) {
    }

    private record RewardPenaltySummaryRow(
            long totalRecordCount,
            long rewardCount,
            long penaltyCount,
            long pendingCount,
            long approvedCount,
            long rejectedCount,
            long effectiveCount,
            long relatedOrderCount,
            long relatedProcessCount,
            long relatedEmployeeCount,
            double monthlyAmount) {
    }

    private record ReworkNotificationRow(
            long reworkId,
            long orderId,
            String orderNo,
            Long csUserId,
            long targetNodeInstanceId) {
    }

    private record ReworkNotificationPayload(
            String event,
            long orderId,
            String orderNo,
            String message,
            long reworkId,
            long targetNodeInstanceId) {
    }

    private record FinalCheckRow(long checkId) {
    }
}

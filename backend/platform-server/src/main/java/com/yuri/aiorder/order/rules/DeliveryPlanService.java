package com.yuri.aiorder.order.rules;

import com.yuri.aiorder.common.BusinessTime;
import com.yuri.aiorder.order.rules.OrderRuleModels.ProcessConfirmationResponse;
import com.yuri.aiorder.order.rules.OrderingRuleCatalog.Rule;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * 交期计算引擎。
 *
 * <p>算式（每一项都来自 {@code ordering_rule_config}，没有一个数字写死在代码里）：
 * <pre>
 *   制作天数 = min(产品标准周期, 订单周期上限)      -- 上限 &lt; 0 表示不设上限
 *            + 过程确认项数 × 每项追加天数          -- 客户口径：每增加一项 +1 天
 *            + 等待天数                            -- 医生超出宽限期未确认的天数
 *   到货日   = 起算日 + 制作天数 + 在途天数          -- 在途天数由运输类型决定
 * </pre>
 *
 * <p>等待天数**按读取时的日期现算**，不依赖定时任务：已回复的确认项在回复时把等待天数落库，
 * 未回复的按 {@code requested_at + 宽限期} 与今天的差算。没有调度器意味着少一个会静默停摆的组件。
 *
 * <p>参与计算的规则里只要有一条是占位值，{@code estimate_status} 就是 {@code PLACEHOLDER}，
 * 界面必须标注「待确认」。被上限盖掉的产品标准周期不计入占位来源——它没有影响结果。
 */
@Service
public class DeliveryPlanService {

    private final JdbcClient jdbcClient;
    private final OrderingRuleCatalog ruleCatalog;

    public DeliveryPlanService(JdbcClient jdbcClient, OrderingRuleCatalog ruleCatalog) {
        this.jdbcClient = jdbcClient;
        this.ruleCatalog = ruleCatalog;
    }

    /** 提交订单时建立交期计划与过程确认清单。重复提交时按幂等更新，不产生第二份计划。 */
    @Transactional
    public void initialize(
            long orderId,
            String workflowProductType,
            OrderRuleSelections selections,
            LocalDate baselineDate) {
        jdbcClient.sql("""
                        INSERT INTO order_delivery_plan
                            (order_id, order_type, priority_code, shipping_method,
                             inbound_tracking_no, baseline_date, base_cycle_days,
                             priority_cap_days, production_days, transit_days,
                             computed_delivery_date, doctor_requested_delivery_date, estimate_status)
                        VALUES
                            (:orderId, :orderType, :priorityCode, :shippingMethod,
                             :inboundTrackingNo, :baselineDate, 0,
                             0, 0, 0,
                             :baselineDate, :requestedDate, 'PLACEHOLDER')
                        ON DUPLICATE KEY UPDATE
                            order_type = VALUES(order_type),
                            priority_code = VALUES(priority_code),
                            shipping_method = VALUES(shipping_method),
                            inbound_tracking_no = VALUES(inbound_tracking_no),
                            baseline_date = VALUES(baseline_date),
                            doctor_requested_delivery_date = VALUES(doctor_requested_delivery_date)
                        """)
                .param("orderId", orderId)
                .param("orderType", selections.orderType())
                .param("priorityCode", selections.priorityCode())
                .param("shippingMethod", selections.shippingMethod())
                .param("inboundTrackingNo", selections.inboundTrackingNo())
                .param("baselineDate", baselineDate)
                .param("requestedDate", selections.requiredDeliveryDate())
                .update();

        int sequence = 0;
        for (String code : selections.processConfirmationCodes()) {
            sequence++;
            jdbcClient.sql("""
                            INSERT INTO order_process_confirmation
                                (order_id, confirmation_code, confirmation_name,
                                 sequence_no, confirmation_status)
                            VALUES
                                (:orderId, :code, :name, :sequenceNo, 'PLANNED')
                            ON DUPLICATE KEY UPDATE
                                sequence_no = VALUES(sequence_no),
                                confirmation_name = VALUES(confirmation_name)
                            """)
                    .param("orderId", orderId)
                    .param("code", code)
                    .param("name", OrderRuleVocabulary.PROCESS_CONFIRMATIONS.get(code))
                    .param("sequenceNo", sequence)
                    .update();
        }
        // 医生在草稿阶段取消勾选的确认项要跟着消失，否则交期会一直按旧的项数加天。
        if (selections.processConfirmationCodes().isEmpty()) {
            jdbcClient.sql("""
                            DELETE FROM order_process_confirmation
                            WHERE order_id = :orderId
                              AND confirmation_status = 'PLANNED'
                            """)
                    .param("orderId", orderId)
                    .update();
        } else {
            jdbcClient.sql("""
                            DELETE FROM order_process_confirmation
                            WHERE order_id = :orderId
                              AND confirmation_status = 'PLANNED'
                              AND confirmation_code NOT IN (:codes)
                            """)
                    .param("orderId", orderId)
                    .param("codes", selections.processConfirmationCodes())
                    .update();
        }
        recompute(orderId, workflowProductType);
    }

    @Transactional
    public Computation recompute(long orderId) {
        return recompute(orderId, productTypeOf(orderId));
    }

    @Transactional
    public Computation recompute(long orderId, String workflowProductType) {
        PlanRow plan = findPlan(orderId);
        if (plan == null) {
            return null;
        }
        List<ConfirmationRow> confirmations = loadConfirmationRows(orderId);
        Rule cycle = longestProductCycle(orderId, workflowProductType);
        Rule cap = ruleCatalog.priorityCap(plan.priorityCode());
        Rule perItem = ruleCatalog.perProcessConfirmationDays();
        Rule grace = ruleCatalog.doctorConfirmationGraceDays();
        Rule transit = ruleCatalog.shippingTransit(plan.shippingMethod());

        boolean capApplies = cap.days() >= 0;
        int productionBase = capApplies ? Math.min(cycle.days(), cap.days()) : cycle.days();
        boolean baseCycleInfluencesResult = !capApplies || cycle.days() <= cap.days();

        int confirmationCount = confirmations.size();
        int confirmationDays = confirmationCount * perItem.days();

        LocalDate today = BusinessTime.today();
        int waitingDays = 0;
        boolean graceInfluencesResult = false;
        for (ConfirmationRow confirmation : confirmations) {
            int pending = pendingWaitingDays(confirmation, grace.days(), today);
            waitingDays += confirmation.settledWaitingDays() + pending;
            if (pending > 0 || confirmation.settledWaitingDays() > 0) {
                graceInfluencesResult = true;
            }
        }

        int productionDays = Math.max(0, productionBase + confirmationDays + waitingDays);
        int transitDays = Math.max(0, transit.days());
        LocalDate calculated = plan.baselineDate().plusDays((long) productionDays + transitDays);
        LocalDate effective = plan.manualDeliveryDate() == null ? calculated : plan.manualDeliveryDate();

        Set<String> placeholders = new LinkedHashSet<>();
        if (baseCycleInfluencesResult && cycle.isPlaceholder()) {
            placeholders.add(cycle.displayName());
        }
        if (capApplies && cap.isPlaceholder()) {
            placeholders.add(cap.displayName());
        }
        if (confirmationCount > 0 && perItem.isPlaceholder()) {
            placeholders.add(perItem.displayName());
        }
        if (graceInfluencesResult && grace.isPlaceholder()) {
            placeholders.add(grace.displayName());
        }
        if (transitDays > 0 && transit.isPlaceholder()) {
            placeholders.add(transit.displayName());
        }
        String estimateStatus = placeholders.isEmpty()
                ? OrderRuleVocabulary.ESTIMATE_CONFIRMED
                : OrderRuleVocabulary.ESTIMATE_PLACEHOLDER;

        Integer varianceDays = plan.manualDeliveryDate() == null
                ? null
                : (int) ChronoUnit.DAYS.between(calculated, plan.manualDeliveryDate());
        String varianceFlag = OrderRuleVocabulary.VARIANCE_NONE;

        jdbcClient.sql("""
                        UPDATE order_delivery_plan
                        SET base_cycle_days = :baseCycleDays,
                            priority_cap_days = :priorityCapDays,
                            process_confirmation_count = :confirmationCount,
                            process_confirmation_days = :confirmationDays,
                            waiting_days = :waitingDays,
                            production_days = :productionDays,
                            transit_days = :transitDays,
                            calculated_delivery_date = :calculatedDeliveryDate,
                            computed_delivery_date = :computedDeliveryDate,
                            variance_days = :varianceDays,
                            variance_flag = :varianceFlag,
                            estimate_status = :estimateStatus
                        WHERE order_id = :orderId
                        """)
                .param("baseCycleDays", cycle.days())
                .param("priorityCapDays", cap.days())
                .param("confirmationCount", confirmationCount)
                .param("confirmationDays", confirmationDays)
                .param("waitingDays", waitingDays)
                .param("productionDays", productionDays)
                .param("transitDays", transitDays)
                .param("calculatedDeliveryDate", calculated)
                .param("computedDeliveryDate", effective)
                .param("varianceDays", varianceDays)
                .param("varianceFlag", varianceFlag)
                .param("estimateStatus", estimateStatus)
                .param("orderId", orderId)
                .update();

        boolean waitingAlert = confirmations.stream()
                .anyMatch(confirmation -> pendingWaitingDays(confirmation, grace.days(), today) > 0);
        return new Computation(findPlan(orderId), List.copyOf(placeholders), waitingAlert);
    }

    /** 客服/管理员人工覆盖系统预计到货日期。重算只更新自动计算基准，不覆盖人工日期。 */
    @Transactional
    public Computation adjustEstimatedDeliveryDate(
            long orderId, LocalDate requestedDate, String reason, Long operatorUserId) {
        int updated = jdbcClient.sql("""
                        UPDATE order_delivery_plan
                        SET manual_delivery_date = :requestedDate,
                            manual_override_reason = :reason,
                            manual_override_by = :operatorUserId,
                            manual_override_at = CURRENT_TIMESTAMP(3)
                        WHERE order_id = :orderId
                        """)
                .param("requestedDate", requestedDate)
                .param("reason", reason)
                .param("operatorUserId", operatorUserId)
                .param("orderId", orderId)
                .update();
        if (updated == 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "order has no delivery plan yet; submit the case group first");
        }
        return recompute(orderId);
    }

    @Transactional
    public ConfirmationRow requestConfirmation(long orderId, String confirmationCode, Long operatorUserId) {
        ConfirmationRow confirmation = loadConfirmation(orderId, confirmationCode);
        if (OrderRuleVocabulary.STATUS_AWAITING_DOCTOR.equals(confirmation.confirmationStatus())) {
            return confirmation;
        }
        jdbcClient.sql("""
                        UPDATE order_process_confirmation
                        SET confirmation_status = 'AWAITING_DOCTOR',
                            requested_at = CURRENT_TIMESTAMP(3),
                            requested_by_user_id = :operatorUserId,
                            responded_at = NULL,
                            responded_by_user_id = NULL
                        WHERE confirmation_id = :confirmationId
                        """)
                .param("operatorUserId", operatorUserId)
                .param("confirmationId", confirmation.confirmationId())
                .update();
        return loadConfirmation(orderId, confirmationCode);
    }

    @Transactional
    public ConfirmationRow respondConfirmation(
            long orderId, String confirmationCode, boolean accepted, String comment, Long operatorUserId) {
        ConfirmationRow confirmation = loadConfirmation(orderId, confirmationCode);
        if (!OrderRuleVocabulary.STATUS_AWAITING_DOCTOR.equals(confirmation.confirmationStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "process confirmation is not awaiting the doctor");
        }
        int settled = pendingWaitingDays(
                confirmation, ruleCatalog.doctorConfirmationGraceDays().days(), BusinessTime.today());
        jdbcClient.sql("""
                        UPDATE order_process_confirmation
                        SET confirmation_status = :status,
                            responded_at = CURRENT_TIMESTAMP(3),
                            responded_by_user_id = :operatorUserId,
                            doctor_comment = :comment,
                            settled_waiting_days = :settledWaitingDays
                        WHERE confirmation_id = :confirmationId
                        """)
                .param("status", accepted
                        ? OrderRuleVocabulary.STATUS_CONFIRMED
                        : OrderRuleVocabulary.STATUS_REJECTED)
                .param("operatorUserId", operatorUserId)
                .param("comment", comment == null || comment.isBlank() ? null : comment.trim())
                .param("settledWaitingDays", settled)
                .param("confirmationId", confirmation.confirmationId())
                .update();
        return loadConfirmation(orderId, confirmationCode);
    }

    public List<ProcessConfirmationResponse> listConfirmations(long orderId) {
        int graceDays = ruleCatalog.doctorConfirmationGraceDays().days();
        LocalDate today = BusinessTime.today();
        List<ProcessConfirmationResponse> result = new ArrayList<>();
        for (ConfirmationRow row : loadConfirmationRows(orderId)) {
            int pending = pendingWaitingDays(row, graceDays, today);
            result.add(new ProcessConfirmationResponse(
                    row.confirmationId(),
                    row.orderId(),
                    row.confirmationCode(),
                    row.confirmationName(),
                    row.sequenceNo(),
                    row.confirmationStatus(),
                    row.requestedAt(),
                    row.respondedAt(),
                    row.doctorComment(),
                    row.settledWaitingDays() + pending,
                    pending > 0));
        }
        return result;
    }

    public int doctorConfirmationGraceDays() {
        return ruleCatalog.doctorConfirmationGraceDays().days();
    }

    @Transactional
    public void startFromCustomerServiceAcceptance(long orderId, LocalDate acceptedOn) {
        jdbcClient.sql("""
                        UPDATE order_delivery_plan
                        SET baseline_date = :acceptedOn
                        WHERE order_id = :orderId
                        """)
                .param("acceptedOn", acceptedOn)
                .param("orderId", orderId)
                .update();
        recompute(orderId);
    }

    private Rule longestProductCycle(long orderId, String fallbackProductType) {
        List<String> productTypes = jdbcClient.sql("""
                        SELECT sibling.product_type
                        FROM orders current_order
                        JOIN orders sibling
                          ON sibling.group_id = current_order.group_id
                          OR (current_order.group_id IS NULL AND sibling.order_id = current_order.order_id)
                        WHERE current_order.order_id = :orderId
                        """)
                .param("orderId", orderId)
                .query(String.class)
                .list();
        if (productTypes.isEmpty()) {
            return ruleCatalog.productCycle(fallbackProductType);
        }
        return productTypes.stream()
                .map(ruleCatalog::productCycle)
                .max(java.util.Comparator.comparingInt(Rule::days))
                .orElseGet(() -> ruleCatalog.productCycle(fallbackProductType));
    }

    public PlanRow findPlan(long orderId) {
        return jdbcClient.sql("""
                        SELECT plan_id, order_id, order_type, priority_code, shipping_method,
                               inbound_tracking_no, baseline_date, base_cycle_days,
                               priority_cap_days, process_confirmation_count,
                               process_confirmation_days, waiting_days, production_days,
                               transit_days, computed_delivery_date, calculated_delivery_date,
                               manual_delivery_date, manual_override_reason,
                               manual_override_by, manual_override_at,
                               doctor_requested_delivery_date, variance_days,
                               variance_flag, estimate_status
                        FROM order_delivery_plan
                        WHERE order_id = :orderId
                        """)
                .param("orderId", orderId)
                .query(DeliveryPlanService::mapPlan)
                .optional()
                .orElse(null);
    }

    private int pendingWaitingDays(ConfirmationRow confirmation, int graceDays, LocalDate today) {
        if (!OrderRuleVocabulary.STATUS_AWAITING_DOCTOR.equals(confirmation.confirmationStatus())
                || confirmation.requestedAt() == null) {
            return 0;
        }
        LocalDate dueDate = confirmation.requestedAt().toLocalDate().plusDays(Math.max(0, graceDays));
        long overdue = ChronoUnit.DAYS.between(dueDate, today);
        return (int) Math.max(0, overdue);
    }

    private String productTypeOf(long orderId) {
        return jdbcClient.sql("SELECT product_type FROM orders WHERE order_id = :orderId")
                .param("orderId", orderId)
                .query(String.class)
                .optional()
                .orElse(null);
    }

    private ConfirmationRow loadConfirmation(long orderId, String confirmationCode) {
        return jdbcClient.sql("""
                        SELECT confirmation_id, order_id, confirmation_code, confirmation_name,
                               sequence_no, confirmation_status, requested_at, responded_at,
                               doctor_comment, settled_waiting_days
                        FROM order_process_confirmation
                        WHERE order_id = :orderId
                          AND confirmation_code = :code
                        FOR UPDATE
                        """)
                .param("orderId", orderId)
                .param("code", confirmationCode)
                .query(DeliveryPlanService::mapConfirmation)
                .optional()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "this order did not request the process confirmation " + confirmationCode));
    }

    private List<ConfirmationRow> loadConfirmationRows(long orderId) {
        return jdbcClient.sql("""
                        SELECT confirmation_id, order_id, confirmation_code, confirmation_name,
                               sequence_no, confirmation_status, requested_at, responded_at,
                               doctor_comment, settled_waiting_days
                        FROM order_process_confirmation
                        WHERE order_id = :orderId
                        ORDER BY sequence_no, confirmation_id
                        """)
                .param("orderId", orderId)
                .query(DeliveryPlanService::mapConfirmation)
                .list();
    }

    private static PlanRow mapPlan(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new PlanRow(
                rs.getLong("plan_id"),
                rs.getLong("order_id"),
                rs.getString("order_type"),
                rs.getString("priority_code"),
                rs.getString("shipping_method"),
                rs.getString("inbound_tracking_no"),
                rs.getObject("baseline_date", LocalDate.class),
                rs.getInt("base_cycle_days"),
                rs.getInt("priority_cap_days"),
                rs.getInt("process_confirmation_count"),
                rs.getInt("process_confirmation_days"),
                rs.getInt("waiting_days"),
                rs.getInt("production_days"),
                rs.getInt("transit_days"),
                rs.getObject("computed_delivery_date", LocalDate.class),
                rs.getObject("calculated_delivery_date", LocalDate.class),
                rs.getObject("manual_delivery_date", LocalDate.class),
                rs.getString("manual_override_reason"),
                rs.getObject("manual_override_by", Long.class),
                rs.getObject("manual_override_at", LocalDateTime.class),
                rs.getObject("doctor_requested_delivery_date", LocalDate.class),
                rs.getObject("variance_days", Integer.class),
                rs.getString("variance_flag"),
                rs.getString("estimate_status"));
    }

    private static ConfirmationRow mapConfirmation(java.sql.ResultSet rs, int rowNum)
            throws java.sql.SQLException {
        return new ConfirmationRow(
                rs.getLong("confirmation_id"),
                rs.getLong("order_id"),
                rs.getString("confirmation_code"),
                rs.getString("confirmation_name"),
                rs.getInt("sequence_no"),
                rs.getString("confirmation_status"),
                rs.getObject("requested_at", LocalDateTime.class),
                rs.getObject("responded_at", LocalDateTime.class),
                rs.getString("doctor_comment"),
                rs.getInt("settled_waiting_days"));
    }

    public record PlanRow(
            long planId,
            long orderId,
            String orderType,
            String priorityCode,
            String shippingMethod,
            String inboundTrackingNo,
            LocalDate baselineDate,
            int baseCycleDays,
            int priorityCapDays,
            int processConfirmationCount,
            int processConfirmationDays,
            int waitingDays,
            int productionDays,
            int transitDays,
            LocalDate computedDeliveryDate,
            LocalDate calculatedDeliveryDate,
            LocalDate manualDeliveryDate,
            String manualOverrideReason,
            Long manualOverrideBy,
            LocalDateTime manualOverrideAt,
            LocalDate doctorRequestedDeliveryDate,
            Integer varianceDays,
            String varianceFlag,
            String estimateStatus) {
    }

    public record ConfirmationRow(
            long confirmationId,
            long orderId,
            String confirmationCode,
            String confirmationName,
            int sequenceNo,
            String confirmationStatus,
            LocalDateTime requestedAt,
            LocalDateTime respondedAt,
            String doctorComment,
            int settledWaitingDays) {
    }

    /** 一次计算的结果：落库后的计划、用到的占位规则、是否有超期未确认。 */
    public record Computation(PlanRow plan, List<String> placeholderRules, boolean waitingAlert) {
    }
}

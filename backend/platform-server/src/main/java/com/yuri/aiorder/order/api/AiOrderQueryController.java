package com.yuri.aiorder.order.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.DataResponse;
import com.yuri.aiorder.common.UserRole;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:5173}")
public class AiOrderQueryController {

    private final OrderProjectionQueryService queryService;

    public AiOrderQueryController(OrderProjectionQueryService queryService) {
        this.queryService = queryService;
    }

    @PostMapping("/ai/order-query")
    public DataResponse<OrderQueryAnswer> orderQuery(
            @Valid @RequestBody OrderQueryRequest request,
            @RequestHeader(name = "X-Bootstrap-Role", required = false) String role,
            @RequestHeader(name = "X-Bootstrap-User-Id", required = false) Long userId,
            @RequestHeader(name = "X-Bootstrap-Clinic-Id", required = false) Long clinicId) {
        BootstrapIdentity identity = BootstrapIdentity.fromHeaders(role, userId, clinicId);
        if (identity.role() != UserRole.DOCTOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "AI-3 is doctor only");
        }

        DoctorOrderAssistantReadModel readModel = queryService.getAssistantReadModel(request.orderId(), identity);
        String answer = "您的订单当前状态：" + readModel.externalStatus() + "。" +
                (readModel.publicMessage() == null ? "" : readModel.publicMessage()) +
                (readModel.trackingNo() == null ? "" : "物流单号：" + readModel.trackingNo() + "。");
        return new DataResponse<>(new OrderQueryAnswer(answer));
    }

    public record OrderQueryRequest(
            @JsonProperty("order_id") @NotNull Long orderId,
            @NotBlank String question) {
    }

    public record OrderQueryAnswer(String answer) {
    }
}

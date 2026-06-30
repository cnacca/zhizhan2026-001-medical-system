package com.yuri.aiorder.order.form;

import com.yuri.aiorder.common.DataResponse;
import com.yuri.aiorder.common.UserRole;
import com.yuri.aiorder.common.auth.RequirePermission;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:5173}")
public class FormConfigController {

    private final FormConfigService formConfigService;

    public FormConfigController(FormConfigService formConfigService) {
        this.formConfigService = formConfigService;
    }

    @GetMapping("/form-configs")
    @RequirePermission(value = {"order:read-doctor", "order:read-internal"}, roles = {
            UserRole.ADMIN, UserRole.CS, UserRole.WORKER, UserRole.DOCTOR})
    public DataResponse<List<FormFieldConfigResponse>> listFormConfigs(
            @RequestParam(name = "product_type", required = false) String productType) {
        return new DataResponse<>(formConfigService.listActiveFields(productType));
    }
}

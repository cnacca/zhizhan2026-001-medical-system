package com.yuri.aiorder.workflow.definition;

import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:5173}")
public class WorkflowChainController {

    private final WorkflowChainQueryService queryService;

    public WorkflowChainController(WorkflowChainQueryService queryService) {
        this.queryService = queryService;
    }

    @GetMapping("/workflow-chains")
    public DataResponse<WorkflowChainSummary> listChains() {
        return new DataResponse<>(queryService.listChains());
    }

    @GetMapping("/workflow-chains/{chainId}/nodes")
    public DataResponse<WorkflowNodeSummary> listNodes(@PathVariable long chainId) {
        return new DataResponse<>(queryService.listNodes(chainId));
    }

    public record DataResponse<T>(List<T> data) {
    }
}

package com.yuri.aiorder.collaboration;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReceiptAutoConfirmationScheduler {

    private final CollaborationService collaborationService;

    public ReceiptAutoConfirmationScheduler(CollaborationService collaborationService) {
        this.collaborationService = collaborationService;
    }

    @Scheduled(cron = "${app.logistics.receipt-auto-confirm-cron:0 */15 * * * *}")
    public void processPendingReceipts() {
        collaborationService.remindPendingAutoReceipts();
        collaborationService.autoConfirmDueReceipts();
    }
}

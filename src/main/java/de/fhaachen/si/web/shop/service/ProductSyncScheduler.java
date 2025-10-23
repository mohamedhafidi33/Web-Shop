package de.fhaachen.si.web.shop.service;

import java.nio.file.Path;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import de.fhaachen.si.web.shop.service.file.api.FileService;

@Service
public class ProductSyncScheduler {

	@Autowired
    protected FileService productFileService;

    @Scheduled(cron = "${app.erp.remote.call.period}")
    public void syncProducts() {
        try {
            Path csvPath = productFileService.downloadFile();
            productFileService.importFromJson(csvPath);
            System.out.println("Product sync completed successfully at " + LocalDateTime.now());
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Product sync failed: " + e.getMessage());
        }
    }
}

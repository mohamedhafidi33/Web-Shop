package de.fhaachen.si.web.shop.service;

import java.nio.file.Path;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import de.fhaachen.si.web.shop.service.file.api.FileService;

@Service
public class ProductSyncScheduler {

    @Autowired
    protected FileService productFileService;

    public void syncProducts(String endpoint, String username, String password) {
        try {
            Path csvPath = productFileService.downloadFile(endpoint, username, password);
            productFileService.importFromJson(csvPath);
            System.out.println("Product sync completed successfully at " + LocalDateTime.now());
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Product sync failed: " + e.getMessage());
        }
    }
}

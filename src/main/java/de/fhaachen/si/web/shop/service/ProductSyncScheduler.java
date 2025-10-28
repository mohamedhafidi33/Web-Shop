package de.fhaachen.si.web.shop.service;

import java.nio.file.Path;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import de.fhaachen.si.web.shop.service.file.api.FileService;

@Service
public class ProductSyncScheduler {

    private volatile boolean running = false;
    private volatile String lastImport = null;
    private volatile String lastPeriod = null;

    @Autowired
    protected FileService productFileService;

    public void syncProducts(String endpoint, String username, String password) {
        running = true;
        try {
            Path csvPath = productFileService.downloadFile(endpoint, username, password);
            productFileService.importFromJson(csvPath);
            lastImport = LocalDateTime.now().toString();
            System.out.println("Product sync completed successfully at " + LocalDateTime.now());
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Product sync failed: " + e.getMessage());
            running = false;
        }
        running = false;
    }

    public boolean isRunning() {
        return running;
    }

    public String getLastImport() {
        return lastImport;
    }

    public String getLastPeriod() {
        return lastPeriod;
    }

    public void setLastPeriod(String period) {
        this.lastPeriod = period;
    }

    public void setRunning(boolean running) {
        this.running = running;
    }
}

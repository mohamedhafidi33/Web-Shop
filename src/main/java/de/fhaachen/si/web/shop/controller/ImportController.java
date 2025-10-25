package de.fhaachen.si.web.shop.controller;

import java.util.concurrent.ScheduledFuture;

import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import de.fhaachen.si.web.shop.service.ProductSyncScheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import de.fhaachen.si.web.shop.service.ProductService;

@RestController
@RequestMapping("/import/admin")
public class ImportController {

	@Autowired
	protected ProductService productService;
	@Autowired
	private TaskScheduler taskScheduler;
	@Autowired
	private ProductSyncScheduler scheduler;

	private ScheduledFuture<?> scheduled;

	@PostMapping("/start")
	public ResponseEntity<String> start(@RequestParam String endpoint,
			@RequestParam String username,
			@RequestParam String password,
			@RequestParam String period) {
		try {
			if (scheduled != null && !scheduled.isCancelled()) {
				scheduled.cancel(false);
			}
			scheduled = taskScheduler.schedule(
					() -> scheduler.syncProducts(endpoint, username, password),
					new CronTrigger(period));
			return ResponseEntity.ok("Scheduled with period: " + period);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("Start failed: " + e.getMessage());
		}
	}

	@PostMapping("/stop")
	public ResponseEntity<String> stop() {
		try {
			if (scheduled != null) {
				scheduled.cancel(false);
				scheduled = null;
			}
			return ResponseEntity.ok("Stopped");
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("Stop failed: " + e.getMessage());
		}
	}

	@PostMapping("/run-now")
	public ResponseEntity<String> runNow(@RequestParam String endpoint,
			@RequestParam String username,
			@RequestParam String password) {
		try {
			scheduler.syncProducts(endpoint, username, password);
			return ResponseEntity.ok("Executed");
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("Run failed: " + e.getMessage());
		}
	}
}

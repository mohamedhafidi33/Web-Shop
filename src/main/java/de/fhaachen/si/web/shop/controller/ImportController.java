package de.fhaachen.si.web.shop.controller;

import java.util.concurrent.ScheduledFuture;

import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import de.fhaachen.si.web.shop.service.ProductSyncScheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import de.fhaachen.si.web.shop.dto.ProductSyncDTO;
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
	public ResponseEntity<String> start(@RequestBody ProductSyncDTO dto) {
		try {
			if (scheduled != null && !scheduled.isCancelled()) {
				scheduled.cancel(false);
			}
			scheduled = taskScheduler.schedule(
					() -> scheduler.syncProducts(dto.getEndpoint(), dto.getUsername(), dto.getPassword()),
					new CronTrigger(dto.getPeriod()));
			return ResponseEntity.ok("Scheduled with period: " + dto.getPeriod());
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
	public ResponseEntity<String> runNow(@RequestBody ProductSyncDTO dto) {
		try {
			scheduler.syncProducts(dto.getEndpoint(), dto.getUsername(), dto.getPassword());
			return ResponseEntity.ok("Executed");
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("Run failed: " + e.getMessage());
		}
	}
}

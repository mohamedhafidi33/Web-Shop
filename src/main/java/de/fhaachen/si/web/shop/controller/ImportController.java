package de.fhaachen.si.web.shop.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import de.fhaachen.si.web.shop.service.ProductService;

@RestController
@RequestMapping("/api/import/admin")
public class ImportController {

	@Autowired
	protected ProductService productService;

	@PostMapping("/products")
	public ResponseEntity<String> importProducts(@RequestParam("file") MultipartFile file) {
		try {
			productService.importProductsFromFile(file);
			return ResponseEntity.ok("Products imported successfully");
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("Import failed: " + e.getMessage());
		}
	}
}

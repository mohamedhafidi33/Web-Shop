package de.fhaachen.si.web.shop.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.fhaachen.si.web.shop.dto.ProductDTO;
import de.fhaachen.si.web.shop.service.api.IProductService;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    protected IProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping("/admin")
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductDTO product) {
        ProductDTO created = productService.createProduct(product);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @RequestBody ProductDTO product) {
        ProductDTO updated = productService.updateProduct(id,product);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stock/{id}")
    public ResponseEntity<?> getProductStock(@PathVariable String id) {
        ProductDTO product = productService.getProductById(id);
		if (product == null) {
			return ResponseEntity.notFound().build();
		}

        String externalId = product.getProductID();

        if (externalId == null || externalId.isEmpty()) {
            return ResponseEntity.badRequest().body("Product has no valid external ID.");
        }

        try {
            int stock = productService.getStockFromGrpc(externalId);
            return ResponseEntity.ok(stock);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to fetch stock for ID: " + externalId);
        }
    }
}

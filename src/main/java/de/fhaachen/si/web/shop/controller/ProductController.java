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
import de.fhaachen.si.web.shop.entity.Product;
import de.fhaachen.si.web.shop.mapper.ProductMapper;
import de.fhaachen.si.web.shop.service.ProductService;

@RestController
@RequestMapping("/products")
public class ProductController {

	@Autowired
	protected ProductService productService;
    
	@Autowired
    protected ProductMapper productMapper;
    
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts().stream().map(product -> productMapper.productToProductDTO(product)).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/admin")
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductDTO product) {
        Product created = productService.createProduct(productMapper.productDTOToProduct(product));
        return ResponseEntity.ok(productMapper.productToProductDTO(created));
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @RequestBody ProductDTO product) {
        Product updated = productService.updateProduct(id, productMapper.productDTOToProduct(product));
        return ResponseEntity.ok(productMapper.productToProductDTO(updated));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}

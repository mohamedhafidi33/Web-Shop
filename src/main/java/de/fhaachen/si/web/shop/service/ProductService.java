package de.fhaachen.si.web.shop.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import de.fhaachen.si.web.shop.entity.Product;
import de.fhaachen.si.web.shop.grpc.StockClient;
import de.fhaachen.si.web.shop.repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    protected ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setName(updatedProduct.getName());
                    product.setDescription(updatedProduct.getDescription());
                    product.setPrice(updatedProduct.getPrice());
                    product.setImageUrl(updatedProduct.getImageUrl());
                    product.setStock(updatedProduct.getStock());
                    return productRepository.save(product);
                })
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found");
        }
        productRepository.deleteById(id);
    }

    public void importProductsFromFile(MultipartFile file) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            reader.readLine();
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length < 4) {
                    throw new IllegalArgumentException("Invalid format at line: " + line);
                }

                Long productId = Long.parseLong(parts[0]);
                String name = parts[1];
                String description = parts[2];
                Double price = Double.parseDouble(parts[3]);

                Product product = productRepository.findById(productId).orElse(new Product());
                product.setId(productId);
                product.setName(name);
                product.setDescription(description);
                product.setPrice(price);

                productRepository.save(product);
            }
        }
    }

    public int getStockFromGrpc(String productId) {
        try {
            StockClient client = new StockClient();
            return client.getStock(String.valueOf(productId));
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch stock: " + e.getMessage(), e);
        }
    }
}
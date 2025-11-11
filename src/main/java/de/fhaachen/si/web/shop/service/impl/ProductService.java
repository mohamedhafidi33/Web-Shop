package de.fhaachen.si.web.shop.service.impl;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import de.fhaachen.si.web.shop.dto.ProductDTO;
import de.fhaachen.si.web.shop.entity.Product;
import de.fhaachen.si.web.shop.grpc.StockClient;
import de.fhaachen.si.web.shop.mapper.ProductMapper;
import de.fhaachen.si.web.shop.repository.ProductRepository;
import de.fhaachen.si.web.shop.service.api.IProductService;

@Service
@Profile({"local", "default"})
public class ProductService implements IProductService{

    @Autowired
    protected ProductRepository productRepository;
    
    @Autowired
    protected ProductMapper productMapper;

    @Override
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream().map(productMapper::productToProductDTO).toList();
    }

    @Override
    public ProductDTO getProductById(String id) {
        return productMapper.productToProductDTO(productRepository.findById(Long.parseLong(id)).orElse(null));
    }

    @Override
    public ProductDTO createProduct(ProductDTO product) {
        return productMapper.productToProductDTO(productRepository.save(productMapper.productDTOToProduct(product)));
    }

    @Override
    public ProductDTO updateProduct(Long id, ProductDTO updatedProduct) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setName(updatedProduct.getName());
                    product.setDescription(updatedProduct.getDescription());
                    product.setPrice(updatedProduct.getPrice());
                    product.setImageUrl(updatedProduct.getImageUrl());
                    product.setStock(updatedProduct.getStock());
                    return productMapper.productToProductDTO(productRepository.save(product));
                })
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @Override
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
package de.fhaachen.si.web.shop.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import de.fhaachen.si.web.shop.dto.ProductDTO;
import de.fhaachen.si.web.shop.grpc.ProductClient;
import de.fhaachen.si.web.shop.grpc.ProductResponse;
import de.fhaachen.si.web.shop.grpc.StockClient;
import de.fhaachen.si.web.shop.service.api.IProductService;

@Service
@Profile("erp")
public class ProductServiceErp implements IProductService{
	
	@Autowired
	protected StockClient stockClient;
	
	@Autowired
	protected ProductClient productClient;

	@Override
	public List<ProductDTO> getAllProducts() {
		return productClient.getAllProducts().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
	}

	@Override
	public ProductDTO getProductById(String id) {
        return getAllProducts().stream().filter(p -> p.getProductID().equals(id)).findFirst().get();
	}

	@Override
	public ProductDTO createProduct(ProductDTO productDTO) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void deleteProduct(Long id) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public int getStockFromGrpc(String productId) {
        try {
            StockClient client = new StockClient();
            return client.getStock(String.valueOf(productId));
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch stock: " + e.getMessage(), e);
        }
	}
	
	
    private ProductDTO toDTO(ProductResponse p) {
        ProductDTO dto = new ProductDTO();
        dto.setProductID(p.getId());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setCurrency(p.getCurrency());
        dto.setStock(p.getStock());
        return dto;
    }

}

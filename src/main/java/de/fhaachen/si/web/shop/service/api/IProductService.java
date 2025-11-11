package de.fhaachen.si.web.shop.service.api;

import java.util.List;
import de.fhaachen.si.web.shop.dto.ProductDTO;

public interface IProductService {

	List<ProductDTO> getAllProducts();

	ProductDTO getProductById(String id);

	ProductDTO createProduct(ProductDTO productDTO);

	void deleteProduct(Long id);

	ProductDTO updateProduct(Long id, ProductDTO productDTO);

	int getStockFromGrpc(String productId);

}

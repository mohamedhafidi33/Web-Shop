package de.fhaachen.si.web.shop.mapper;

import org.mapstruct.Mapper;

import de.fhaachen.si.web.shop.dto.ProductDTO;
import de.fhaachen.si.web.shop.entity.Product;

@Mapper
public interface ProductMapper {
	
	Product productToProductDTO(ProductDTO productDTO);
	ProductDTO productDTOToProduct(Product product);
}

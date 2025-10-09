package de.fhaachen.si.web.shop.mapper;

import org.mapstruct.Mapper;

import de.fhaachen.si.web.shop.dto.ProductDTO;
import de.fhaachen.si.web.shop.entity.Product;

@Mapper(componentModel = "spring")
public interface ProductMapper {
	
	ProductDTO productToProductDTO(Product product);
	Product productDTOToProduct(ProductDTO productDTO);
}

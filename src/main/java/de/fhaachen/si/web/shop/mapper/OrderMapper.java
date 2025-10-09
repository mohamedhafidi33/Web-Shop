package de.fhaachen.si.web.shop.mapper;

import org.mapstruct.Mapper;

import de.fhaachen.si.web.shop.dto.OrderDTO;
import de.fhaachen.si.web.shop.entity.Order;

@Mapper(componentModel = "spring")
public interface OrderMapper {
	OrderDTO orderDTOTOOrder(Order order);

	Order orderToOrderDTO(OrderDTO orderDTO);
}

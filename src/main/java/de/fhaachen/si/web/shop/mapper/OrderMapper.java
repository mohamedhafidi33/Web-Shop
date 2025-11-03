package de.fhaachen.si.web.shop.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import de.fhaachen.si.web.shop.dto.OrderDTO;
import de.fhaachen.si.web.shop.dto.OrderItemDTO;
import de.fhaachen.si.web.shop.entity.OrderStatus;
import de.fhaachen.si.web.shop.entity.Order;
import de.fhaachen.si.web.shop.entity.OrderItem;

@Mapper(componentModel = "spring")
public interface OrderMapper {

	@Mapping(source = "customer.id", target = "customerId")
	@Mapping(source = "customer.name", target = "customerName")
	@Mapping(source = "status", target = "status", qualifiedByName = "statusToString")
	@Mapping(target = "items", source = "orderItems")
	OrderDTO orderToOrderDTO(Order order);

    // @Mapping(source = "product.id", target = "productId")
    // @Mapping(source = "product.name", target = "productName")
    // OrderItemDTO orderItemToOrderItemDTO(OrderItem item);
    
    // @Mapping(source = "productId", target = "product.id")
    // OrderItem orderItemDTOToOrderItem(OrderItemDTO dto);
	
	// @Mapping(source = "customerId", target = "customer.id")
	// @Mapping(source = "customer.name", target = "customerName")
	// @Mapping(source = "status", target = "status", qualifiedByName = "stringToStatus")
	// @Mapping(target = "orderItems", source = "items")
	// Order orderDTOToOrder(OrderDTO orderDTO);

	@Named("statusToString")
	public static String mapStatusToString(OrderStatus status) {
		return status != null ? status.name() : null;
	}

	@Named("stringToStatus")
	public static OrderStatus mapStringToStatus(String status) {
		return status != null ? OrderStatus.valueOf(status) : null;
	}
}

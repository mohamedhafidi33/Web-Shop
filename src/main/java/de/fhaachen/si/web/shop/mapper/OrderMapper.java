package de.fhaachen.si.web.shop.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import de.fhaachen.si.web.shop.dto.OrderDTO;
import de.fhaachen.si.web.shop.entity.OrderStatus;
import de.fhaachen.si.web.shop.entity.Order;

@Mapper(componentModel = "spring")
public interface OrderMapper {

	@Mapping(source = "customer.id", target = "customerId")
	@Mapping(source = "status", target = "status", qualifiedByName = "statusToString")
	OrderDTO orderToOrderDTO(Order order);

	@Mapping(source = "customerId", target = "customer.id")
	@Mapping(source = "status", target = "status", qualifiedByName = "stringToStatus")
	Order orderDTOToOrder(OrderDTO orderDTO);

	@Named("statusToString")
	public static String mapStatusToString(OrderStatus status) {
		return status != null ? status.name() : null;
	}

	@Named("stringToStatus")
	public static OrderStatus mapStringToStatus(String status) {
		return status != null ? OrderStatus.valueOf(status) : null;
	}
}

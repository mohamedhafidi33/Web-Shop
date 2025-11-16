package de.fhaachen.si.web.shop.service.api;

import java.util.List;

import de.fhaachen.si.web.shop.dto.OrderDTO;
import de.fhaachen.si.web.shop.entity.OrderStatus;

public interface IOrderService {
	
	public OrderDTO createOrderFromDTO(OrderDTO orderDTO);
	
	public List<OrderDTO> getOrdersForCustomer(Long customerId);
	
	public List<OrderDTO> getAllOrders();
	
	public OrderDTO updateOrderStatus(Long orderId, OrderStatus status);
	
	public OrderDTO getOrderById(Long id);
}

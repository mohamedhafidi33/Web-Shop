package de.fhaachen.si.web.shop.service.impl;

import java.util.List;

import org.joda.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import de.fhaachen.si.web.shop.dto.OrderDTO;
import de.fhaachen.si.web.shop.entity.OrderStatus;
import de.fhaachen.si.web.shop.grpc.OrderClient;
import de.fhaachen.si.web.shop.grpc.OrderRequest;
import de.fhaachen.si.web.shop.grpc.OrderResponse;
import de.fhaachen.si.web.shop.service.api.IOrderService;

@Service
@Profile("erp")
public class OrderServiceErp implements IOrderService {
	@Autowired
	protected OrderClient orderClient;

    @Override
    public OrderDTO createOrderFromDTO(OrderDTO order) {
        OrderRequest req = OrderRequest.newBuilder()
                .setCustomerId(order.getCustomerId().toString())
                .setOrderDate(LocalDate.now().toString())
                .setOrderAmount(order.getTotalAmount())
                .setCurrency("EUR")
                // map items here
                .build();

        OrderResponse res = orderClient.createOrder(req);
        OrderDTO createdOrder = prepareOrder(res);
        return createdOrder;
    }


    public OrderDTO getOrderById(Long id) {
        OrderResponse res = orderClient.getOrderById(id.toString());
        OrderDTO createdOrder = prepareOrder(res);
        return createdOrder;
    }

    @Override
    public OrderDTO updateOrderStatus(Long orderId, OrderStatus orderStatus) {
        OrderResponse res = orderClient.changeOrderStatus(orderId.toString(), orderStatus.toString());
        OrderDTO createdOrder = prepareOrder(res);
        return createdOrder;
    }

	@Override
	public List<OrderDTO> getOrdersForCustomer(Long customerId) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<OrderDTO> getAllOrders() {
		// TODO Auto-generated method stub
		return null;
	}
	private OrderDTO prepareOrder(OrderResponse res) {
		OrderDTO createdOrder = new OrderDTO();
        createdOrder.setStatus(res.getStatus());
        createdOrder.setTotalAmount(res.getTotalAmount());
        createdOrder.setId(res.getOrderId());
		return createdOrder;
	}
}

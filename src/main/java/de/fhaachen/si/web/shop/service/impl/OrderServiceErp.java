package de.fhaachen.si.web.shop.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.joda.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import de.fhaachen.si.web.shop.dto.OrderDTO;
import de.fhaachen.si.web.shop.dto.OrderItemDTO;
import de.fhaachen.si.web.shop.dto.ProductDTO;
import de.fhaachen.si.web.shop.entity.OrderStatus;
import de.fhaachen.si.web.shop.grpc.OrderClient;
import de.fhaachen.si.web.shop.grpc.OrderItem;
import de.fhaachen.si.web.shop.grpc.OrderRequest;
import de.fhaachen.si.web.shop.grpc.OrderResponse;
import de.fhaachen.si.web.shop.repository.CustomerRepository;
import de.fhaachen.si.web.shop.repository.OrderRepository;
import de.fhaachen.si.web.shop.service.api.IOrderService;

@Service
@Profile("erp")
public class OrderServiceErp implements IOrderService {
	@Autowired
	protected OrderClient orderClient;
	
	@Autowired
	protected ProductServiceErp productService;
	
	@Autowired
	protected CustomerRepository customerRepository;

    @Override
    public OrderDTO createOrderFromDTO(OrderDTO order) {

        OrderRequest.Builder req = OrderRequest.newBuilder()
                .setCustomerId(order.getCustomerUUID())
                .setOrderDate(LocalDate.now().toString())
                .setOrderAmount(order.getTotalAmount())
                .setCurrency("EUR");

        int idx = 1;
        for (OrderItemDTO item : order.getItems()) {
            OrderItem grpcItem = OrderItem.newBuilder()
            		    .setItemId(idx)
                    .setProductUuid(item.getProductUuid())
                    .setQuantity(item.getQuantity())
                    .setItemAmount(item.getPrice() != null ? item.getPrice() : 0.0)
                    .setCurrency("EUR")
                    .build();
            req.addItems(grpcItem);
        }

        OrderResponse res = orderClient.createOrder(req.build());
        return prepareOrder(res);
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
		return orderClient.getAllOrders().stream().filter(
				order -> customerRepository.findById(customerId).get().getCustomerUUID().toString().equals(order.getCustomerId()))
				.map(this::prepareOrder).collect(Collectors.toList());
	}

	@Override
	public List<OrderDTO> getAllOrders() {
		return orderClient.getAllOrders().stream().map(this::prepareOrder).collect(Collectors.toList());
	}

	private OrderDTO prepareOrder(OrderResponse res) {
	    OrderDTO createdOrder = new OrderDTO();
	    createdOrder.setStatus(res.getStatus());
	    createdOrder.setTotalAmount(res.getTotalAmount());
	    createdOrder.setId(res.getOrderId());
	    
	    createdOrder.setItems(new ArrayList<>()); 

	    for (var item : res.getItemsList()) {
	        List<ProductDTO> products = productService.getProductByUUID(item.getProductUuid());
	        
	        if (!products.isEmpty()) {
	            ProductDTO product = products.get(0);
	            
	            OrderItemDTO orderItemDto = new OrderItemDTO();
	            orderItemDto.setProductId(product.getProductID());
	            orderItemDto.setProductName(product.getName());
	            orderItemDto.setProductUuid(product.getProductUUID());
	            
	            orderItemDto.setQuantity(item.getQuantity());
	            orderItemDto.setPrice(item.getItemAmount());
	            
	            createdOrder.getItems().add(orderItemDto);
	        } else {
	            System.err.println("Product not found for UUID: " + item.getProductUuid());
	        }
	    }
	    return createdOrder;
	}
}

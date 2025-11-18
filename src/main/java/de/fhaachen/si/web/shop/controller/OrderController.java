package de.fhaachen.si.web.shop.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import de.fhaachen.si.web.shop.dto.OrderDTO;
import de.fhaachen.si.web.shop.entity.OrderStatus;
import de.fhaachen.si.web.shop.service.CustomerService;
import de.fhaachen.si.web.shop.service.api.IOrderService;

@RestController
@RequestMapping("/orders")
public class OrderController {
	@Autowired
	protected IOrderService orderService;
	
	@Autowired
	protected CustomerService customerService;
	
	@PostMapping("/customer/{customerId}")
    public ResponseEntity<OrderDTO> createOrder(@PathVariable Long customerId, @RequestBody OrderDTO orderDTO) {
        OrderDTO order = orderService.createOrderFromDTO(orderDTO);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderDTO>> getCustomerOrders(@PathVariable Long customerId) {
        List<OrderDTO> orders = orderService.getOrdersForCustomer(customerId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<OrderDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/admin/{orderId}/status")
    public ResponseEntity<OrderDTO> updateStatus(@PathVariable Long orderId, @RequestParam String status) {
        OrderDTO updated = orderService.updateOrderStatus(orderId, OrderStatus.valueOf(status));
        return ResponseEntity.ok(updated);
    }
}

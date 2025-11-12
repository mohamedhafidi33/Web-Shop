package de.fhaachen.si.web.shop.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import de.fhaachen.si.web.shop.dto.OrderDTO;
import de.fhaachen.si.web.shop.entity.Order;
import de.fhaachen.si.web.shop.entity.OrderStatus;
import de.fhaachen.si.web.shop.mapper.OrderMapper;
import de.fhaachen.si.web.shop.service.CustomerService;
import de.fhaachen.si.web.shop.service.OrderService;

@RestController
@RequestMapping("/orders")
public class OrderController {
	@Autowired
	protected OrderService orderService;
	
	@Autowired
	protected CustomerService customerService;
	
	@Autowired
	protected OrderMapper orderMapper;
	
	@PostMapping("/customer/{customerId}")
    public ResponseEntity<OrderDTO> createOrder(@PathVariable Long customerId, @RequestBody OrderDTO orderDTO) {
        Order order = orderService.createOrderFromDTO(orderDTO);
        return ResponseEntity.ok(orderMapper.orderToOrderDTO(order));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderDTO>> getCustomerOrders(@PathVariable Long customerId) {
        List<Order> orders = orderService.getOrdersForCustomer(customerId);
        return ResponseEntity.ok(orders.stream().map(orderMapper::orderToOrderDTO).toList());
    }

    /**
     * NEW: Return only the orders for the authenticated user.
     * Security: authentication must be present (SecurityConfig requires /orders/** authenticated),
     * and SecurityConfig already restricts /orders/admin/** to ADMIN.
     */
    @GetMapping("")
    public ResponseEntity<List<OrderDTO>> getMyOrders(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName(); // JwtAuthFilter sets principal name to email
        List<Order> orders = orderService.getOrdersForCustomerByEmail(email);
        return ResponseEntity.ok(orders.stream().map(orderMapper::orderToOrderDTO).toList());
    }

    @GetMapping("/admin")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders.stream().map(orderMapper::orderToOrderDTO).toList());
    }

    @PutMapping("/admin/{orderId}/status")
    public ResponseEntity<OrderDTO> updateStatus(@PathVariable Long orderId, @RequestParam String status) {
        Order updated = orderService.updateOrderStatus(orderId, OrderStatus.valueOf(status));
        return ResponseEntity.ok(orderMapper.orderToOrderDTO(updated));
    }

    @DeleteMapping("/admin/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.noContent().build();
    }
}

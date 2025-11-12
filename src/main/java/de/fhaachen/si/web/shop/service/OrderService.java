package de.fhaachen.si.web.shop.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import de.fhaachen.si.web.shop.dto.OrderDTO;
import de.fhaachen.si.web.shop.entity.Customer;
import de.fhaachen.si.web.shop.entity.Order;
import de.fhaachen.si.web.shop.entity.OrderItem;
import de.fhaachen.si.web.shop.entity.OrderStatus;
import de.fhaachen.si.web.shop.entity.Product;
import de.fhaachen.si.web.shop.mapper.OrderMapper;
import de.fhaachen.si.web.shop.repository.CustomerRepository;
import de.fhaachen.si.web.shop.repository.OrderRepository;
import de.fhaachen.si.web.shop.repository.ProductRepository;
import de.fhaachen.si.web.shop.repository.UserRepository;
import jakarta.transaction.Transactional;

@Service
public class OrderService {
	
	@Autowired
	protected OrderRepository orderRepository;
	
	@Autowired
    protected ProductRepository productRepository;
	
	@Autowired
    protected CustomerRepository customerRepository;

    @Autowired
    protected UserRepository userRepository;
	
	@Autowired
	protected OrderMapper orderMapper;

    @Transactional
    public Order createOrder(Long customerId, List<OrderItem> items) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Order order = new Order();
        order.setCustomer(customer);

        for (OrderItem item : items) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            item.setOrder(order);
            item.setProduct(product);
        }

        order.setOrderItems(items);
        order.calculateTotal();

        return orderRepository.save(order);
    }
    
    @Transactional
    public Order createOrderFromDTO(OrderDTO orderDTO) {
        Order order = orderMapper.orderDTOToOrder(orderDTO);

        Customer customer = customerRepository.findById(orderDTO.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        order.setCustomer(customer);

        for (OrderItem item : order.getOrderItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            item.setOrder(order);
            item.setProduct(product);
            item.setPrice(product.getPrice());
        }

        order.calculateTotal();
        return orderRepository.save(order);
    }

    public List<Order> getOrdersForCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return orderRepository.findByCustomer(customer);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }
    /**
     * NEW: return orders for the authenticated user identified by email.
     * Uses UserRepository to map email -> User -> Customer.
     */
    public List<Order> getOrdersForCustomerByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    Customer customer = user.getCustomer();
                    if (customer == null) throw new RuntimeException("Customer information missing for user");
                    return orderRepository.findByCustomer(customer);
                })
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    public void deleteOrder(Long orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Order not found");
        }
        orderRepository.deleteById(orderId);
    }
}

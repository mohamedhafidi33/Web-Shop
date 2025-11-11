package de.fhaachen.si.web.shop.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
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
import de.fhaachen.si.web.shop.service.api.IOrderService;
import jakarta.transaction.Transactional;

@Service
@Profile("local")
public class OrderService implements IOrderService{
	
	@Autowired
	protected OrderRepository orderRepository;
	
	@Autowired
    protected ProductRepository productRepository;
	
	@Autowired
    protected CustomerRepository customerRepository;
	
	@Autowired
	protected OrderMapper orderMapper;

    @Transactional
    public OrderDTO createOrder(Long customerId, List<OrderItem> items) {
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

        return orderMapper.orderToOrderDTO(orderRepository.save(order));
    }
    
    @Transactional
    @Override
    public OrderDTO createOrderFromDTO(OrderDTO orderDTO) {
        Order order = orderMapper.orderDTOToOrder(orderDTO);

        Customer customer = customerRepository.findById(orderDTO.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        order.setCustomer(customer);

        for (OrderItem item : order.getOrderItems()) {
            String rawProductId = item.getProduct() != null ? item.getProduct().getId().toString() : null;
            Product product;

            if (rawProductId == null) {
                throw new RuntimeException("Product ID missing for one of the order items.");
            }

            try {
                Long localId = Long.parseLong(rawProductId);
                product = productRepository.findById(localId)
                        .orElseThrow(() -> new RuntimeException("Local product not found with id " + localId));
            } catch (NumberFormatException ex) {
                product = new Product();
                product.setProductID(rawProductId);
                product.setName("ERP Product " + rawProductId);
                product.setPrice(0.0);
                product.setStock(0);
            }

            item.setOrder(order);
            item.setProduct(product);
            item.setPrice(product.getPrice());
        }

        order.calculateTotal();
        return orderMapper.orderToOrderDTO(orderRepository.save(order));
    }


    public List<OrderDTO> getOrdersForCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return orderRepository.findByCustomer(customer).stream().map(orderMapper::orderToOrderDTO).toList();
    }

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream().map(orderMapper::orderToOrderDTO).toList();
    }

    public OrderDTO updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderMapper.orderToOrderDTO(orderRepository.save(order));
    }

	public boolean createOrder(de.fhaachen.si.web.shop.grpc.dto.OrderDTO order) {
		// TODO Auto-generated method stub
		return false;
	}

	public Order createOrder(OrderDTO orderDTO) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public OrderDTO getOrderById(Long id) {
		Order order = orderRepository.findById(id).orElse(null);
		return orderMapper.orderToOrderDTO(order);
	}
}

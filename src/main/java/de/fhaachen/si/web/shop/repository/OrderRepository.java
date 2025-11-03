package de.fhaachen.si.web.shop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.fhaachen.si.web.shop.entity.Customer;
import de.fhaachen.si.web.shop.entity.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>{
	List<Order> findByCustomer(Customer customer);
	
}

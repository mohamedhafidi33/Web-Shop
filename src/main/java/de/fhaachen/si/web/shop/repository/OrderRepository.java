package de.fhaachen.si.web.shop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.fhaachen.si.web.shop.entity.Customer;
import de.fhaachen.si.web.shop.entity.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>{
	List<Order> findByCustomer(Customer customer);
	 @Query("select distinct o from Order o " +
           "join fetch o.customer c " +
           "left join fetch o.orderItems oi " +
           "left join fetch oi.product p " +
           "order by o.createdAt desc")
    List<Order> findAllWithCustomerAndItems();
}

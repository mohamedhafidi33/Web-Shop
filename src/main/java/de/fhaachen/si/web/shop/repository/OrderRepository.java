package de.fhaachen.si.web.shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import de.fhaachen.si.web.shop.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long>{

}

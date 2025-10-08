package de.fhaachen.si.web.shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import de.fhaachen.si.web.shop.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long>{

}

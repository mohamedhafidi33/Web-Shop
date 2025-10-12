package de.fhaachen.si.web.shop.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.fhaachen.si.web.shop.entity.Customer;
import de.fhaachen.si.web.shop.entity.User;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long>{
	public Optional<Customer> findByUser(User user);
}

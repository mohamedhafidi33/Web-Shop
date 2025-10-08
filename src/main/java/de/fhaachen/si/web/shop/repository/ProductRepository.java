package de.fhaachen.si.web.shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import de.fhaachen.si.web.shop.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long>{

}

package de.fhaachen.si.web.shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.fhaachen.si.web.shop.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>{

}

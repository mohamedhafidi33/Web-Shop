package de.fhaachen.si.web.shop.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import de.fhaachen.si.web.shop.entity.User;

public interface UserRepository extends JpaRepository<User, Long>{
	public Optional<User> findByEmail(String email);
}

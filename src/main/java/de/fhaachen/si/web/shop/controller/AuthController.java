package de.fhaachen.si.web.shop.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.fhaachen.si.web.shop.dto.CustomerDTO;
import de.fhaachen.si.web.shop.entity.Customer;
import de.fhaachen.si.web.shop.mapper.CustomerMapper;
import de.fhaachen.si.web.shop.security.JwtUtil;
import de.fhaachen.si.web.shop.service.CustomerService;
import de.fhaachen.si.web.shop.service.UserService;

@RestController
@RequestMapping("/auth")
public class AuthController {

	@Autowired
	protected UserService userService;
	
	@Autowired
	protected CustomerService customerService;
	
	@Autowired
	protected CustomerMapper customerMapper;

	@Autowired
	protected PasswordEncoder passwordEncoder;

	@Autowired
	protected JwtUtil jwtUtil;

	@PostMapping("/register")
	public ResponseEntity<?> register(@RequestBody CustomerDTO customerDTO) {
		if (userService.findByEmail(customerDTO.getEmail()).isPresent()) {
			return ResponseEntity.badRequest().body("Email already exists");
		}
		customerDTO.setPassword(passwordEncoder.encode(customerDTO.getPassword()));
		customerDTO.setRole("CUSTOMER");
		Customer createdCustomer = customerService.createCustomer(customerMapper.cutomerDTOTOCustomer(customerDTO));
		return ResponseEntity.ok(Map.of(
				"customer", createdCustomer,
				"token", jwtUtil.generateToken(createdCustomer.getUser().getEmail(), createdCustomer.getUser().getRole().toString()),
                "role", createdCustomer.getUser().getRole()
				));
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
	    String email = loginData.get("email");
	    String password = loginData.get("password");

	    return userService.findByEmail(email)
	            .filter(u -> passwordEncoder.matches(password, u.getPassword()))
	            .<ResponseEntity<?>>map(u -> ResponseEntity.ok(
	                    Map.of(
	                            "token", jwtUtil.generateToken(u.getEmail(), u.getRole().toString()),
	                            "role", u.getRole(),
	                            "email", u.getEmail()
	                    )
	            ))
	            .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid credentials")));
	}

}
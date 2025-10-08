package de.fhaachen.si.web.shop.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import de.fhaachen.si.web.shop.repository.CustomerRepository;

@Service
public class CustomerService {
	
	@Autowired
	protected CustomerRepository customerRepository;
	
}

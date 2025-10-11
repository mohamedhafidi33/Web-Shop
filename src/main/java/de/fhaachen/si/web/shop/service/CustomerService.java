package de.fhaachen.si.web.shop.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import de.fhaachen.si.web.shop.entity.Customer;
import de.fhaachen.si.web.shop.repository.CustomerRepository;

@Service
public class CustomerService {

	@Autowired
	private CustomerRepository customerRepository;

	public List<Customer> getAllCustomers() {
		return customerRepository.findAll();
	}

	public Optional<Customer> getCustomerById(Long id) {
		return customerRepository.findById(id);
	}

	public Customer createCustomer(Customer customer) {
		return customerRepository.save(customer);
	}

	public Customer updateCustomer(Long id, Customer updatedCustomer) {
		return customerRepository.findById(id).map(customer -> {
			customer.setName(updatedCustomer.getName());
			customer.setAddress(updatedCustomer.getAddress());
			customer.setId(id);
			customer.setOrders(updatedCustomer.getOrders());
			customer.setEmail(updatedCustomer.getEmail());
			customer.setPassword(updatedCustomer.getPassword());
			return customerRepository.save(customer);
		}).orElseThrow(() -> new RuntimeException("Customer not found"));
	}

	public void deleteCustomer(Long id) {
		if (!customerRepository.existsById(id)) {
			throw new RuntimeException("Customer not found");
		}
		customerRepository.deleteById(id);
	}

}

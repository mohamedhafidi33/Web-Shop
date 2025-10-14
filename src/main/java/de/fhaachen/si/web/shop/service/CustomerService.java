package de.fhaachen.si.web.shop.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import de.fhaachen.si.web.shop.entity.Customer;
import de.fhaachen.si.web.shop.entity.User;
import de.fhaachen.si.web.shop.mapper.CustomerMapper;
import de.fhaachen.si.web.shop.repository.CustomerRepository;

@Service
public class CustomerService {

	@Autowired
    protected UserService userService;

	@Autowired
	protected CustomerRepository customerRepository;
	
	@Autowired
	protected CustomerMapper customerMapper;

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
		return customerRepository.findById(id).map(existing -> {
			existing.setName(updatedCustomer.getName());
			existing.setAddress(updatedCustomer.getAddress());
			User user = existing.getUser();
			if (user != null && updatedCustomer.getUser() != null) {
				user.setEmail(updatedCustomer.getUser().getEmail());
			}
			return customerRepository.save(existing);
		}).orElseThrow(() -> new RuntimeException("Customer not found"));
	}



	public void deleteCustomer(Long id) {
		if (!customerRepository.existsById(id)) {
			throw new RuntimeException("Customer not found");
		}
		customerRepository.deleteById(id);
	}
	
	public Optional<Customer> findByEmail(String email) {
		Optional<User> user = userService.findByEmail(email);
		return customerRepository.findByUser(user.get());
	}

}

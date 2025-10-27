package de.fhaachen.si.web.shop.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import de.fhaachen.si.web.shop.repository.UserRepository;
import de.fhaachen.si.web.shop.entity.User;

import de.fhaachen.si.web.shop.dto.CustomerDTO;
import de.fhaachen.si.web.shop.entity.Customer;
import de.fhaachen.si.web.shop.entity.Role;
import de.fhaachen.si.web.shop.mapper.CustomerMapper;
import de.fhaachen.si.web.shop.service.CustomerService;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    @Autowired
    protected CustomerService customerService;

    @Autowired
    protected CustomerMapper customerMapper;

    @Autowired
    private UserRepository userRepository;

	@GetMapping("/admin")
	public ResponseEntity<List<CustomerDTO>> getAllCustomers() {
		return ResponseEntity.ok(customerService.getAllCustomers().stream()
				.map(Customer -> customerMapper.customerToCustomerDTO(Customer))
				.filter(c -> !c.getRole().equals("ADMIN")).toList());
	}

    @GetMapping("/admin/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        return customerService.getCustomerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/admin")
    public ResponseEntity<CustomerDTO> createCustomer(@RequestBody CustomerDTO customerDTO) {
        Customer created = customerService.createCustomer(customerMapper.cutomerDTOTOCustomer(customerDTO));
        return ResponseEntity.ok(customerMapper.customerToCustomerDTO(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerDTO> updateCustomer(@PathVariable Long id, @RequestBody CustomerDTO customerDTO) {
        Customer updated = customerService.updateCustomer(id, customerMapper.cutomerDTOTOCustomer(customerDTO));
        return ResponseEntity.ok(customerMapper.customerToCustomerDTO(updated));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentCustomer(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.getCustomer() == null) {
            return ResponseEntity.notFound().build();
        }

        Customer customer = user.getCustomer();
        Map<String, Object> body = new HashMap<>();
        body.put("id", customer.getId());
        body.put("name", customer.getName());
        body.put("address", customer.getAddress());
        body.put("email", user.getEmail());

        return ResponseEntity.ok(body);
    }
}
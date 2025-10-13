package de.fhaachen.si.web.shop.controller;

import java.util.List;

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
import de.fhaachen.si.web.shop.mapper.CustomerMapper;
import de.fhaachen.si.web.shop.service.CustomerService;

@RestController
@RequestMapping("/customers/admin")
public class CustomerController {

    @Autowired
    protected CustomerService customerService;

    @Autowired
    protected CustomerMapper customerMapper;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CustomerDTO>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers().stream()
                .map(Customer -> customerMapper.customerToCustomerDTO(Customer)).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        return customerService.getCustomerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CustomerDTO> createCustomer(@RequestBody CustomerDTO customerDTO) {
        Customer created = customerService.createCustomer(customerMapper.cutomerDTOTOCustomer(customerDTO));
        return ResponseEntity.ok(customerMapper.customerToCustomerDTO(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerDTO> updateCustomer(@PathVariable Long id, @RequestBody CustomerDTO customerDTO) {
        Customer updated = customerService.updateCustomer(id, customerMapper.cutomerDTOTOCustomer(customerDTO));
        return ResponseEntity.ok(customerMapper.customerToCustomerDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<CustomerDTO> getCurrentCustomer(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.getCustomer() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(customerMapper.customerToCustomerDTO(user.getCustomer()));
    }
}
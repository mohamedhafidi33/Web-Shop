package de.fhaachen.si.web.shop.dto;

import java.util.List;
import java.util.UUID;

public class CustomerDTO {
	private Long id;

	private String name;

	private String email;

	private String address;

	private List<OrderDTO> orders;

	private String password;
	
	private String role;
	
	private UUID customerUUID;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public List<OrderDTO> getOrders() {
		return orders;
	}

	public void setOrders(List<OrderDTO> orders) {
		this.orders = orders;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public UUID getCustomerUUID() {
		return customerUUID;
	}

	public void setCustomerUUID(UUID customerUUID) {
		this.customerUUID = customerUUID;
	}
	
}

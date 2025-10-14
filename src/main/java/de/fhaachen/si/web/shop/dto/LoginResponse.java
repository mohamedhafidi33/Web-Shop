package de.fhaachen.si.web.shop.dto;

public class LoginResponse {

	private String token;
	private String role;
	private String email;
	private CustomerDTO customer;
	
	public LoginResponse(String token, String role, String email, CustomerDTO customer) {
		this.token = token;
		this.role = role;
		this.email = email;
		this.customer = customer;
	}

	public String getToken() {
		return token;
	}

	public String getRole() {
		return role;
	}

	public String getEmail() {
		return email;
	}

	public CustomerDTO getCustomer() {
		return customer;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public void setCustomer(CustomerDTO customer) {
		this.customer = customer;
	}
}
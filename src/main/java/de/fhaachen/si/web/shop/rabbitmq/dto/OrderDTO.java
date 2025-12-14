package de.fhaachen.si.web.shop.rabbitmq.dto;

import java.time.LocalDateTime;
import java.util.List;

public class OrderDTO {
	private String customer;
	private String orderDate;
	private Double orderAmount;
	private String currency;
	private List<OrderItemDTO> items;
	public String getCustomer() {
		return customer;
	}
	public void setCustomer(String customer) {
		this.customer = customer;
	}
	public String getOrderDate() {
		return orderDate;
	}
	public void setOrderDate(String orderDate) {
		this.orderDate = orderDate;
	}
	public Double getOrderAmount() {
		return orderAmount;
	}
	public void setOrderAmount(Double orderAmount) {
		this.orderAmount = orderAmount;
	}
	public String getCurrency() {
		return currency;
	}
	public void setCurrency(String currency) {
		this.currency = currency;
	}
	public List<OrderItemDTO> getItems() {
		return items;
	}
	public void setItems(List<OrderItemDTO> items) {
		this.items = items;
	}
}

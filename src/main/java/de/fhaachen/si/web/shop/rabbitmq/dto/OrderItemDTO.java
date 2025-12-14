package de.fhaachen.si.web.shop.rabbitmq.dto;

public class OrderItemDTO {
	private String itemID;
	private String product;
	private Integer quantity;
	private Double itemAmount;
	private String currency;
	
	public String getItemID() {
		return itemID;
	}
	public void setItemID(String itemId) {
		this.itemID = itemId;
	}
	public String getProduct() {
		return product;
	}
	public void setProduct(String product) {
		this.product = product;
	}
	public Integer getQuantity() {
		return quantity;
	}
	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}
	public Double getItemAmount() {
		return itemAmount;
	}
	public void setItemAmount(Double itemAmount) {
		this.itemAmount = itemAmount;
	}
	public String getCurrency() {
		return currency;
	}
	public void setCurrency(String currency) {
		this.currency = currency;
	}
	
}

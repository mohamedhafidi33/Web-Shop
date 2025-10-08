package de.fhaachen.si.web.shop.mapper;

import org.mapstruct.Mapper;

import de.fhaachen.si.web.shop.dto.CustomerDTO;
import de.fhaachen.si.web.shop.entity.Customer;

@Mapper
public interface CustomerMapper {
	Customer cutomerDTOTOCustomer(CustomerDTO customerDTO);

	CustomerDTO customerToCustomerDTO(Customer customer);
}

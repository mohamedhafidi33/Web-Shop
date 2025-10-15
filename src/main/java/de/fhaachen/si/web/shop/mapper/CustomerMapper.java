package de.fhaachen.si.web.shop.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import de.fhaachen.si.web.shop.dto.CustomerDTO;
import de.fhaachen.si.web.shop.entity.Customer;

@Mapper(componentModel = "spring", uses = OrderMapper.class)
public interface CustomerMapper {
	
	@Mapping(source = "email", target = "user.email")
	@Mapping(source = "password", target = "user.password")
	@Mapping(source = "role", target ="user.role")
	Customer cutomerDTOTOCustomer(CustomerDTO customerDTO);

	@Mapping(source = "customer.user.email", target = "email")
	@Mapping(source = "customer.user.password", target = "password")
	@Mapping(source = "customer.user.role", target ="role")
	CustomerDTO customerToCustomerDTO(Customer customer);
	
	@Mapping(target = "id", ignore = true)
	@Mapping(target = "user", ignore = true)
	void updateCustomerFromDto(CustomerDTO dto, @MappingTarget Customer customer);

}

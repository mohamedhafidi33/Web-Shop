package de.fhaachen.si.web.shop;

import java.math.BigDecimal;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import de.fhaachen.si.web.shop.entity.Product;
import de.fhaachen.si.web.shop.repository.ProductRepository;

@SpringBootApplication
public class WebShopApplication {

	public static void main(String[] args) {
		SpringApplication.run(WebShopApplication.class, args);
	}
	
    @Bean
    CommandLineRunner initDatabase(ProductRepository productRepository) {
        return args -> {
            if (productRepository.count() == 0) {
                Product p1 = new Product();
                p1.setName("Wireless Mouse");
                p1.setDescription("Ergonomic wireless mouse with USB receiver");
                p1.setPrice(29.99);

                Product p2 = new Product();
                p2.setName("Mechanical Keyboard");
                p2.setDescription("RGB backlit mechanical keyboard with blue switches");
                p2.setPrice(89.99);

                Product p3 = new Product();
                p3.setName("USB-C Hub");
                p3.setDescription("7-in-1 USB-C hub with HDMI, SD card, and Ethernet ports");
                p3.setPrice(59.99);
                
                productRepository.save(p1);
                productRepository.save(p2);
                productRepository.save(p3);

                System.out.println("Products inserted into database.");
            } else {
                System.out.println("Products already exist.");
            }
        };
    }

}

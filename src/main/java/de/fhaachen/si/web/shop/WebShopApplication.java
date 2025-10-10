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
                p1.setImageUrl(
                        "https://images.unsplash.com/photo-1660491083562-d91a64d6ea9c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1481");

                Product p2 = new Product();
                p2.setName("Mechanical Keyboard");
                p2.setDescription("RGB backlit mechanical keyboard with blue switches");
                p2.setPrice(89.99);
                p2.setImageUrl(
                        "https://images.unsplash.com/photo-1625130694338-4110ba634e59?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1035");

                Product p3 = new Product();
                p3.setName("USB-C Hub");
                p3.setDescription("7-in-1 USB-C hub with HDMI, SD card, and Ethernet ports");
                p3.setPrice(59.99);
                p3.setImageUrl(
                        "https://images.unsplash.com/photo-1616578781650-cd818fa41e57?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1364");

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

package de.fhaachen.si.web.shop.service.file.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import de.fhaachen.si.web.shop.service.file.dto.ProductDTO;
import de.fhaachen.si.web.shop.entity.Product;
import de.fhaachen.si.web.shop.repository.ProductRepository;
import de.fhaachen.si.web.shop.service.file.api.FileService;
import jakarta.transaction.Transactional;

@Service
public class ProductFileService implements FileService {

	@Autowired
	protected ProductRepository productRepository;

	private final ObjectMapper objectMapper = new ObjectMapper();

	@Value("${app.erp.remote.url}")
	private String fileUrl;

	@Value("${app.erp.remote.username}")
	private String username;

	@Value("${app.erp.remote.password}")
	private String password;

	@Value("${app.files.products.path}")
	private String filePath;

	@Override
	public Path downloadFile() throws IOException {
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy - HH:mm:ss").withLocale(Locale.GERMANY);
		Path path = Paths.get(filePath + " - " + LocalDateTime.now().format(formatter));
		Files.createDirectories(path.getParent());

		WebClient webClient = WebClient.builder().defaultHeaders(headers -> headers.setBasicAuth(username, password))
				.build();

		byte[] fileBytes = webClient.get().uri(fileUrl).retrieve().bodyToMono(byte[].class)
				.onErrorMap(e -> new RuntimeException("Failed to download product file: " + e.getMessage(), e)).block();

		if (fileBytes == null || fileBytes.length == 0) {
			throw new RuntimeException("Downloaded file is empty");
		}

		Files.write(path, fileBytes);
		System.out.println("File downloaded and saved to: " + path.toAbsolutePath());

		return path;
	}

	@Transactional
	public void importFromJson(Path filePath) throws IOException {
		List<ProductDTO> remoteProducts = readProductsFromFile(filePath);
		insertOrUpdateProducts(remoteProducts);
		deleteMissingProducts(remoteProducts);
	}

	/**
	 * Reads the remote JSON file into a list of ProductDTOs.
	 */
	public List<ProductDTO> readProductsFromFile(Path filePath) throws IOException {
		byte[] jsonData = Files.readAllBytes(filePath);
		List<ProductDTO> products = objectMapper.readValue(jsonData, new TypeReference<List<ProductDTO>>() {
		});
		System.out.printf("Read %d products from JSON file%n", products.size());
		return products;
	}

	/**
	 * Inserts new products and updates existing ones.
	 */
	@Transactional
	public void insertOrUpdateProducts(List<ProductDTO> productDtos) {
		for (ProductDTO dto : productDtos) {
			double priceValue = parsePrice(dto.getPrice());

			Product product = productRepository.findByProductID(dto.getProductID()).orElseGet(() -> {
				Product p = new Product();
				p.setProductID(dto.getProductID());
				return p;
			});

			product.setName(dto.getName());
			product.setDescription(dto.getDescription());
			product.setPrice(priceValue);
			product.setStock(dto.getStock());

			productRepository.save(product);
		}

		System.out.printf("Inserted/Updated %d products%n", productDtos.size());
	}

	/**
	 * Deletes products that exist in DB but are not present in the new remote list.
	 * Keeps all local-only products (those without a productID).
	 */
	@Transactional
	public void deleteMissingProducts(List<ProductDTO> remoteProductDtos) {
		Set<String> remoteProductIds = remoteProductDtos.stream().map(ProductDTO::getProductID).filter(Objects::nonNull)
				.collect(Collectors.toSet());

		List<Product> productsToDelete = productRepository.findAll().stream()
				.filter(p -> p.getProductID() != null && !remoteProductIds.contains(p.getProductID()))
				.collect(Collectors.toList());

		if (!productsToDelete.isEmpty()) {
			productRepository.deleteAll(productsToDelete);
			System.out.printf("Deleted %d outdated products%n", productsToDelete.size());
		} else {
			System.out.println("No products to delete.");
		}
	}

	/**
	 * Parses the price string, stripping currency.
	 */
	private double parsePrice(String priceStr) {
		if (priceStr == null)
			return 0.0;
		return Double.parseDouble(priceStr.replace("EUR", "").trim());
	}
}

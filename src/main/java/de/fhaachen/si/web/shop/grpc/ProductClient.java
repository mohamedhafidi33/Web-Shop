package de.fhaachen.si.web.shop.grpc;

import java.util.List;

import org.springframework.stereotype.Component;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

@Component
public class ProductClient {
	  private final ProductGrpc.ProductBlockingStub stub;

	    public ProductClient() {
	        ManagedChannel channel = ManagedChannelBuilder.forAddress("host.docker.internal", 9090)
	                .usePlaintext()
	                .build();
	        stub = ProductGrpc.newBlockingStub(channel);
	    }

	    public List<ProductResponse> getAllProducts() {
	        return stub.getAllProducts(Empty.newBuilder().build()).getProductsList();
	    }

	    public ProductResponse getProductById(String id) {
	        return stub.getProductById(ProductIdRequest.newBuilder().setId(id).build());
	    }
}

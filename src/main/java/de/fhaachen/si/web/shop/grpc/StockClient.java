package de.fhaachen.si.web.shop.grpc;

import org.springframework.stereotype.Component;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.StatusRuntimeException;
import si.StockGrpc;
import si.StockRequest;
import si.StockResponse;

@Component
public class StockClient {
    private final StockGrpc.StockBlockingStub stub;

    public StockClient() {
        System.out.println("[gRPC] Creating channel to host.docker.internal:9090...");
        ManagedChannel channel = ManagedChannelBuilder.forAddress("host.docker.internal", 9090)
                .usePlaintext()
                .build();
        System.out.println("[gRPC] Channel created successfully.");
        stub = StockGrpc.newBlockingStub(channel);
    }

    public int getStock(String productId) {
        System.out.println("[gRPC] Requesting stock for productId: " + productId);
        try {
            StockResponse response = stub.getStock(StockRequest.newBuilder().setItemId(productId).build());
            System.out.println("[gRPC] Response received: quantity=" + response.getQuantity());
            return response.getQuantity();
        } catch (StatusRuntimeException e) {
            System.err.println("[gRPC] Request failed: " + e.getStatus());
            e.printStackTrace();
            return -1;
        } catch (Exception e) {
            System.err.println("[gRPC] Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return -2;
        }
    }
}
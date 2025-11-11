package de.fhaachen.si.web.shop.grpc;

import org.springframework.stereotype.Component;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.StatusRuntimeException;
@Component
public class OrderClient {

	 private final OrderGrpc.OrderBlockingStub stub;

	    public OrderClient() {
	        ManagedChannel channel = ManagedChannelBuilder
	                .forAddress("host.docker.internal", 9090)
	                .usePlaintext()
	                .build();
	        this.stub = OrderGrpc.newBlockingStub(channel);
	    }

	    public OrderResponse createOrder(OrderRequest request) {
	        try {
	            System.out.println("[gRPC] Sending CreateOrder request...");
	            return stub.createOrder(request);
	        } catch (StatusRuntimeException e) {
	            System.err.println("[gRPC] CreateOrder failed: " + e.getStatus());
	            throw e;
	        }
	    }

	    public OrderResponse getOrderById(String orderId) {
	        try {
	            return stub.getOrderById(OrderIdRequest.newBuilder().setOrderId(orderId).build());
	        } catch (StatusRuntimeException e) {
	            System.err.println("[gRPC] GetOrderById failed: " + e.getStatus());
	            throw e;
	        }
	    }

	    public OrderResponse changeOrderStatus(String orderId, String newStatus) {
	        try {
	            return stub.changeOrderStatus(OrderStatusRequest.newBuilder()
	                    .setOrderId(orderId)
	                    .setNewStatus(newStatus)
	                    .build());
	        } catch (StatusRuntimeException e) {
	            System.err.println("[gRPC] ChangeOrderStatus failed: " + e.getStatus());
	            throw e;
	        }
	    }
}

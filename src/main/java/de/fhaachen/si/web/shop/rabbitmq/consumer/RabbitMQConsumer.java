package de.fhaachen.si.web.shop.rabbitmq.consumer;

import java.util.Map;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQConsumer {
	 
	@RabbitListener(queues = "${app.queues.order-response}")
	public void consume(String response) {
		System.out.println("Receiving message");
		System.out.println("ERP Response Received: " + response);

		// TODO
	}
	
	@RabbitListener(queues = "${app.queues.order-error}")
	public void processFailedOrders(String failedOrderJson, @Header(required = false) Map<String, Object> headers) {
	    System.err.println("Admin Alert: Order failed processing.");
	    System.err.println("Payload: " + failedOrderJson);
	    
	    // Logic: Save to a database table "FAILED_ORDERS" for an admin dashboard
	}
}

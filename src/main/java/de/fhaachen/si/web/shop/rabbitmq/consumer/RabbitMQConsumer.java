package de.fhaachen.si.web.shop.rabbitmq.consumer;

import java.util.Map;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQConsumer {
	 
	@RabbitListener(queues = "${app.queues.order-response}")
	public void consume(Map<String, Object> response) {
		System.out.println("Receiving message");
		System.out.println("ERP Response Received: " + response);

		// TODO
	}
}

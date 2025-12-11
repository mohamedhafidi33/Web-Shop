package de.fhaachen.si.web.shop.rabbitmq.producer;

import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import de.fhaachen.si.web.shop.grpc.dto.OrderDTO;
import de.fhaachen.si.web.shop.rabbitmq.config.RabbitMQConfig;

@Service
public class RabbitMQProducer {
	private final AmqpTemplate amqpTemplate;
	
    @Autowired
    public RabbitMQProducer(AmqpTemplate amqpTemplate) {
        this.amqpTemplate = amqpTemplate;
    }
    
    public void sendOrder(OrderDTO message) {
        amqpTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                "order.request",
                message
        );
    }
}

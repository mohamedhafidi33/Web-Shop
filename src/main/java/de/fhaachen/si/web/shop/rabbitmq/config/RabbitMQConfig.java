package de.fhaachen.si.web.shop.rabbitmq.config;

import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${app.queues.order-request}")
    private String orderRequestQueue;

    @Value("${app.queues.order-response}")
    private String orderResponseQueue;

    public static final String EXCHANGE = "orders.exchange";

    @Bean
    public DirectExchange ordersExchange() {
        return new DirectExchange(EXCHANGE);
    }

    @Bean
    public Queue orderRequestQueue() {
        return new Queue(orderRequestQueue, true);
    }

    @Bean
    public Queue orderResponseQueue() {
        return new Queue(orderResponseQueue, true);
    }

    @Bean
    public Binding bindOrderRequestQueue() {
        return BindingBuilder.bind(orderRequestQueue())
                .to(ordersExchange())
                .with("order.request");
    }

    @Bean
    public Binding bindOrderResponseQueue() {
        return BindingBuilder.bind(orderResponseQueue())
                .to(ordersExchange())
                .with("order.response");
    }

    @Bean
    public MessageConverter jsonConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonConverter());
        return template;
    }
}

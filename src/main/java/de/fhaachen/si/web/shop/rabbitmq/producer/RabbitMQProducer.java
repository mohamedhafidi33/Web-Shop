package de.fhaachen.si.web.shop.rabbitmq.producer;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import de.fhaachen.si.web.shop.dto.OrderDTO;

@Service
public class RabbitMQProducer {
        @Autowired
        private RabbitTemplate rabbitTemplate;

        public void sendOrder(OrderDTO order) {
                String correlationId = UUID.randomUUID().toString();
                System.out.println("Sending message (correlationId=" + correlationId + ")");

                de.fhaachen.si.web.shop.rabbitmq.dto.OrderDTO erpOrder = prepareOrder(order);

                rabbitTemplate.convertAndSend(
                                "orders.request",
                                erpOrder,
                                message -> {
                                        message.getMessageProperties().setCorrelationId(correlationId);
                                        return message;
                                });
        }

        private de.fhaachen.si.web.shop.rabbitmq.dto.OrderItemDTO prepareOrderItem(
                        de.fhaachen.si.web.shop.dto.OrderItemDTO orderItem) {

                de.fhaachen.si.web.shop.rabbitmq.dto.OrderItemDTO dto = new de.fhaachen.si.web.shop.rabbitmq.dto.OrderItemDTO();

                dto.setItemID("10");
                dto.setProduct(orderItem.getProductUuid());
                dto.setQuantity(orderItem.getQuantity());
                dto.setItemAmount(orderItem.getPrice());
                dto.setCurrency("EUR");

                return dto;
        }

        private de.fhaachen.si.web.shop.rabbitmq.dto.OrderDTO prepareOrder(
                        OrderDTO order) {

                de.fhaachen.si.web.shop.rabbitmq.dto.OrderDTO dto = new de.fhaachen.si.web.shop.rabbitmq.dto.OrderDTO();

                dto.setCurrency("EUR");
                dto.setOrderDate(LocalDate.now().toString());
                dto.setCustomer(order.getCustomerUUID());
                dto.setOrderAmount(order.getTotalAmount());

                dto.setItems(
                                order.getItems().stream()
                                                .map(this::prepareOrderItem)
                                                .toList());

                return dto;
        }

}

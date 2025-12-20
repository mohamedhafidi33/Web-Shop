# Web-Shop
### Integration Systems

### Application Evolution Overview

This project was developed incrementally to demonstrate different enterprise integration patterns and technologies. Each version builds on the previous one.
<ol>
  <li>
    <strong>Version 1 – Simple Web Shop</strong><br><br>
    <strong>Goal:</strong><br>
    Implement a basic web shop with a clean separation between frontend and backend.<br><br>
    <strong>Key characteristics:</strong>
    <ul>
      <li>React frontend for product browsing and ordering</li>
      <li>Spring Boot backend exposing REST APIs</li>
      <li>PostgreSQL database for persistence</li>
      <li>CRUD operations for products, customers, and orders</li>
      <li>Direct synchronous REST communication</li>
      <li>No external system integration</li>
    </ul>
  </li>

  <li>
    <strong>Version 2 – Transferring Product Information Using Files</strong><br><br>
    <strong>Goal:</strong><br>
    Integrate product data from an external ERP system using file-based exchange.<br><br>
    <strong>Key characteristics:</strong>
    <ul>
      <li>Product data imported from ERP-generated files (e.g. JSON)</li>
      <li>File polling mechanism in the Spring Boot backend</li>
      <li>Mapping ERP product format to internal ProductDTO</li>
      <li>Local database updated from file contents</li>
      <li>One-way, batch-oriented data synchronization</li>
    </ul>
  </li>

  <li>
    <strong>Version 3 – Synchronizing Product Stock and Purchase Orders</strong><br><br>
    <strong>Goal:</strong><br>
    Enable real-time synchronization between the web shop and the ERP system.<br><br>
    <strong>Key characteristics:</strong>
    <ul>
      <li>ERP system accessed via OData/REST APIs</li>
      <li>gRPC gateway introduced between web shop and ERP</li>
      <li>Products retrieved directly from ERP instead of local storage</li>
      <li>Orders sent synchronously to ERP</li>
      <li>Stock availability validated against ERP before checkout</li>
      <li>Dual product identifier handling (local ID and ERP product identifiers)</li>
    </ul>
  </li>

  <li>
    <strong>Version 4 – Exchanging Data Using Messages</strong><br><br>
    <strong>Goal:</strong><br>
    Decouple the web shop from the ERP system using asynchronous messaging.<br><br>
    <strong>Key characteristics:</strong>
    <ul>
      <li>RabbitMQ used as messaging middleware</li>
      <li>Orders published to a message queue after checkout</li>
      <li>Apache Camel (Karavan) used for message routing and transformation</li>
      <li>Camel routes consume order messages and invoke ERP OData services</li>
      <li>Request–response communication implemented via separate message queues</li>
      <li>Correlation ID used to match ERP responses to originating orders</li>
      <li>Improved system decoupling and fault tolerance</li>
      <li>Dead Letter Channel (DLQ) configured in RabbitMQ to capture and handle failed messages when the ERP system is unavailable</li>
    </ul>
  </li>
</ol>

## Run with Docker Compose:
```
docker compose up --build
```

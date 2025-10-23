FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-agentlib:jdwp=transport=dt_socket,address=*:5005,server=y,suspend=n","-Djava.security.egd=file:/dev/./urandom","-jar","app.jar"]

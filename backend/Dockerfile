# Change from JRE to JDK for compilation
FROM eclipse-temurin:21-jdk-alpine as builder
WORKDIR /app

# Install necessary packages for Gradle
RUN apk add --no-cache bash

# Copy Gradle wrapper and build files
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle .
COPY settings.gradle .
COPY src ./src

# Make gradlew executable
RUN chmod +x ./gradlew

# Build the application
RUN ./gradlew clean build -x test

# Second stage: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-root user
RUN addgroup -S spring && adduser -S spring -G spring

# Create a directory for the JAR file
RUN mkdir -p /app/jar

# Copy the JAR file from builder stage
COPY --from=builder /app/build/libs/label-0.0.1-SNAPSHOT.jar /app/jar/

# Set permissions
RUN chown spring:spring /app/jar/label-0.0.1-SNAPSHOT.jar && \
    chmod 644 /app/jar/label-0.0.1-SNAPSHOT.jar

# Switch to non-root user
USER spring

EXPOSE 8080
#ENTRYPOINT ["java", "-jar", "/app/jar/label-0.0.1-SNAPSHOT.jar"]
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-XX:InitialRAMPercentage=50.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-Dserver.port=${PORT:8080}", \
    "-Dspring.profiles.active=prod", \
    "-jar", "/app/jar/label-0.0.1-SNAPSHOT.jar"]

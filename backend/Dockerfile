FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-root user
RUN addgroup -S spring && adduser -S spring -G spring

# Create a directory for the JAR file
RUN mkdir -p /app/jar

# Copy the JAR file from local build/libs directory
COPY build/libs/label-0.0.1-SNAPSHOT.jar /app/jar/

# Verify files in /app/jar
RUN echo "=== Contents of /app/jar ===" && \
    ls -la /app/jar/

RUN chown spring:spring /app/jar/label-0.0.1-SNAPSHOT.jar && \
    chmod 644 /app/jar/label-0.0.1-SNAPSHOT.jar

# Switch to non-root user
USER spring

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/jar/label-0.0.1-SNAPSHOT.jar"]

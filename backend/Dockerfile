# Build stage
FROM gradle:8.6.0-jdk21 AS build
WORKDIR /app

# Copy only the build files first to leverage Docker cache
COPY build.gradle settings.gradle gradlew gradlew.bat ./
COPY gradle ./gradle

# Download dependencies (this layer will be cached unless build.gradle changes)
RUN gradle dependencies --no-daemon

# Copy source code
COPY src ./src

# Build the application
RUN gradle clean build --no-daemon -x test

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

# Create a non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

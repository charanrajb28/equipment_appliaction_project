# Step 1: Build the application
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Step 2: Run the application
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
# Copy the built JAR file
COPY --from=build /app/target/*.jar app.jar
# Copy the SSL certificate for RDS
COPY --from=build /app/global-bundle.pem global-bundle.pem

# Render/Railway sets the PORT environment variable automatically
EXPOSE 8080
ENTRYPOINT ["java", "-Dserver.port=${PORT:8080}", "-jar", "app.jar"]

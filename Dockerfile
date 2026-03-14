# --- Phase 1: Build Frontend ---
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# Hardcode the production API URL or use an environment variable
ENV NEXT_PUBLIC_API_URL=/
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Phase 2: Build Backend ---
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline

COPY backend/src ./src
COPY backend/global-bundle.pem .
# Copy the built frontend into Spring Boot's static resources folder
COPY --from=frontend-build /frontend/out ./src/main/resources/static

RUN mvn clean package -DskipTests

# --- Phase 3: Final Image ---
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=backend-build /backend/target/*.jar app.jar
COPY --from=backend-build /backend/global-bundle.pem global-bundle.pem

EXPOSE 8080
ENTRYPOINT ["java", "-Xmx256m", "-Xms128m", "-Dserver.port=${PORT:8080}", "-jar", "app.jar"]

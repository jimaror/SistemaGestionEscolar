# ---------- Build ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Descargar dependencias primero (cache de Docker)
COPY pom.xml .
RUN mvn -B dependency:go-offline -Dmaven.enforcer.skip=true

# Copiar el codigo y compilar
COPY src ./src
RUN mvn -B clean package -DskipTests -Dmaven.enforcer.skip=true

# ---------- Runtime ----------
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Crear usuario sin privilegios
RUN useradd -ms /bin/bash -u 10001 appuser

COPY --from=build /build/target/escolar-0.0.1-SNAPSHOT.jar app.jar

# Carpeta para archivos subidos
RUN mkdir -p /app/archivos && chown -R appuser:appuser /app
USER appuser

EXPOSE 8080

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
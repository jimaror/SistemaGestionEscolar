# ============================================================
#  Backend - Colegio Otto de la Rocha
#  Build en 2 etapas: compila con Maven (JDK 25) y ejecuta con JRE 25.
# ============================================================

# ---------- Etapa 1: Compilar ----------
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /build

# Solo el pom: cache de las dependencias entre builds.
COPY pom.xml ./
RUN mvn -B -q dependency:go-offline -Dmaven.enforcer.skip=true || true

# Codigo fuente y compilacion.
COPY src ./src
RUN mvn -B clean package \
        -DskipTests \
        -Dmaven.enforcer.skip=true \
        -Dmaven.test.skip=true \
        -Djacoco.skip=true

# ---------- Etapa 2: Ejecutar ----------
FROM eclipse-temurin:25-jre-jammy
WORKDIR /app

# Usuario sin privilegios.
RUN useradd -ms /bin/bash -u 10001 appuser

COPY --from=build /build/target/escolar-0.0.1-SNAPSHOT.jar /app/app.jar

# Carpeta de archivos subidos (materiales).
RUN mkdir -p /app/archivos && chown -R appuser:appuser /app

# Script de entrada (se copia y se hace ejecutable antes del cambio de usuario).
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh && chown appuser:appuser /app/entrypoint.sh

USER appuser

EXPOSE 8080

ENV JAVA_OPTS="-XX:MaxRAMPercentage=70.0 -Djava.security.egd=file:/dev/./urandom"

# Verifica que el JAR exista (si no, falla aqui y no al arrancar).
RUN test -f /app/app.jar

ENTRYPOINT ["/app/entrypoint.sh"]

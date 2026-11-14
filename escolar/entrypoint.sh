#!/bin/sh
# Construye la URL de conexion a PostgreSQL desde las variables separadas
# que Render inyecta desde la base de datos.

if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ] && [ -n "$DB_NAME" ]; then
  export DB_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}?user=${DB_USER}&password=${DB_PASSWORD}"
  echo "DB_URL construida: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}?user=****&password=****"
fi

exec java $JAVA_OPTS -jar /app/app.jar
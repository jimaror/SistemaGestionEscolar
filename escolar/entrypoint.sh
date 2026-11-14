#!/bin/sh
# Render entrega DB_URL como "postgresql://user:pass@host/db" (sin puerto).
# El driver de PostgreSQL necesita "jdbc:postgresql://host:5432/db?user=...&password=..."
# Reconstruimos la URL con el puerto y credenciales separadas.

if [ -n "$DB_URL" ]; then
  URL="${DB_URL#jdbc:}"
  URL="${URL#postgresql://}"

  HOST_DB="${URL#*@}"
  HOST="${HOST_DB%%/*}"
  DB_NAME="${HOST_DB#*/}"

  if [ -n "$HOST" ] && [ -n "$DB_NAME" ]; then
    export DB_URL="jdbc:postgresql://${HOST}:5432/${DB_NAME}?user=${DB_USER}&password=${DB_PASSWORD}"
    echo "DB_URL reconstruida: $DB_URL"
  else
    echo "No se pudo reconstruir DB_URL, se usa la original con jdbc:"
    if [ "${DB_URL#jdbc:}" = "$DB_URL" ]; then
      export DB_URL="jdbc:$DB_URL"
    fi
  fi
fi

exec java $JAVA_OPTS -jar /app/app.jar
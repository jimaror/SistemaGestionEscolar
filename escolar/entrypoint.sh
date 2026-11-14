#!/bin/sh
# Render entrega DB_URL como "postgresql://user:pass@host/db"
# HikariCP necesita "jdbc:postgresql://user:pass@host/db"
# Agregamos el prefijo si falta.
if [ -n "$DB_URL" ] && [ "${DB_URL#jdbc:}" = "$DB_URL" ]; then
  export DB_URL="jdbc:$DB_URL"
  echo "DB_URL corregida a: $DB_URL"
fi
exec java $JAVA_OPTS -jar /app/app.jar
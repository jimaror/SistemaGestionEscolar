package com.unmrma.escolar.configuracion;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Sincroniza las secuencias de ID en PostgreSQL cuando hay filas insertadas
 * con IDs explícitos (por ejemplo, datos iniciales). Evita errores de llave
 * duplicada al crear nuevos registros.
 */
@Component
public class SincronizadorSecuencias {

    private static final Logger log = LoggerFactory.getLogger(SincronizadorSecuencias.class);

    @PersistenceContext
    private EntityManager entityManager;

    private record Tabla(String nombre, String columnaId) {}

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void sincronizar() {
        List<Tabla> tablas = List.of(
                new Tabla("mensajes", "id_mensaje"),
                new Tabla("conversaciones", "id_conversacion"),
                new Tabla("conversacion_participantes", "id_participante"),
                new Tabla("materiales", "id_material"),
                new Tabla("reuniones", "id_reunion"),
                new Tabla("reunion_participantes", "id_participante"),
                new Tabla("tareas", "id_tarea"),
                new Tabla("entregas_tareas", "id_entrega"),
                new Tabla("notificaciones", "id_notificacion")
        );

        for (Tabla tabla : tablas) {
            try {
                String sql = "SELECT setval(pg_get_serial_sequence('" + tabla.nombre() + "', '" + tabla.columnaId()
                        + "'), COALESCE((SELECT MAX(" + tabla.columnaId() + ") FROM " + tabla.nombre() + "), 1), true)";
                entityManager.createNativeQuery(sql).getSingleResult();
            } catch (Exception e) {
                // Si la tabla/secuencia no existe o el motor no es PostgreSQL, se omite.
                log.debug("No se pudo sincronizar secuencia de {}.{}: {}", tabla.nombre(), tabla.columnaId(), e.getMessage());
            }
        }
        log.info("Sincronización de secuencias verificada");
    }
}
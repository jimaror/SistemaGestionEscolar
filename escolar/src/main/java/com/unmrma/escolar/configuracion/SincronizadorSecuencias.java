package com.unmrma.escolar.configuracion;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

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
    public void sincronizar() {
        List<Tabla> tablas = List.of(
                new Tabla("usuarios", "id_usuario"),
                new Tabla("alumnos", "id_alumno"),
                new Tabla("maestros", "id_maestro"),
                new Tabla("tutores", "id_tutor"),
                new Tabla("grados", "id_grado"),
                new Tabla("secciones", "id_seccion"),
                new Tabla("anios_escolares", "id_anio"),
                new Tabla("asignaturas", "id_asignatura"),
                new Tabla("asignaciones_docentes", "id_asignacion"),
                new Tabla("matriculas", "id_matricula"),
                new Tabla("asistencias", "id_asistencia"),
                new Tabla("evaluaciones", "id_evaluacion"),
                new Tabla("notas", "id_nota"),
                new Tabla("materiales", "id_material"),
                new Tabla("tareas", "id_tarea"),
                new Tabla("entregas_tareas", "id_entrega"),
                new Tabla("justificaciones_ausencia", "id_justificacion"),
                new Tabla("conversaciones", "id_conversacion"),
                new Tabla("conversacion_participantes", "id_participante"),
                new Tabla("mensajes", "id_mensaje"),
                new Tabla("reuniones", "id_reunion"),
                new Tabla("reunion_participantes", "id_participante"),
                new Tabla("notificaciones", "id_notificacion")
        );

        try {
            for (Tabla tabla : tablas) {
                try {
                    String sql = "SELECT setval(pg_get_serial_sequence('" + tabla.nombre() + "', '" + tabla.columnaId()
                            + "'), COALESCE((SELECT MAX(" + tabla.columnaId() + ") FROM " + tabla.nombre() + "), 1), true)";
                    entityManager.createNativeQuery(sql).getSingleResult();
                } catch (Exception e) {
                    // Si la tabla/secuencia no existe o el motor no es PostgreSQL, se omite sin romper el arranque.
                    log.debug("No se pudo sincronizar secuencia de {}.{}: {}", tabla.nombre(), tabla.columnaId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            log.warn("Sincronización de secuencias omitida por error general: {}", e.getMessage());
        }
        log.info("Sincronización de secuencias verificada");
    }
}
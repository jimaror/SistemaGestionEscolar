package com.unmrma.escolar.dtos.mensaje;

/**
 * Resumen de un usuario que puede recibir mensajes. Se expone desde un unico
 * endpoint para que cualquier rol (Director, Maestro, Alumno o Tutor) pueda
 * elegir destinatario sin depender de permisos de otros catalogos.
 */
public record DestinatarioRespuesta(
        Integer usuarioId,
        String nombres,
        String apellidos,
        String rol,
        String username
) {
}

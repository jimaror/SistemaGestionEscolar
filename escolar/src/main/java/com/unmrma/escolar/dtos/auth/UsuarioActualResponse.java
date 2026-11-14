package com.unmrma.escolar.dtos.auth;

/**
 * Datos públicos del usuario dueño del token. No incluye la contraseña ni
 * información interna de la entidad.
 */
public record UsuarioActualResponse(
        Integer id,
        String username,
        String email,
        String rol,
        String nombres,
        String apellidos,
        String estado) {
}

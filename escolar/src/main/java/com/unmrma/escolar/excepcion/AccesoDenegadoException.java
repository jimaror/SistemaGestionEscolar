package com.unmrma.escolar.excepcion;

/**
 * El usuario está autenticado pero no tiene permiso sobre el recurso o la
 * operación solicitada. Se traduce a HTTP 403.
 */
public class AccesoDenegadoException extends RuntimeException {

    public AccesoDenegadoException(String mensaje) {
        super(mensaje);
    }
}

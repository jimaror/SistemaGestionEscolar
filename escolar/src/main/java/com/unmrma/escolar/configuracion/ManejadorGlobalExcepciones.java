package com.unmrma.escolar.configuracion;

import com.unmrma.escolar.excepcion.AccesoDenegadoException;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.excepcion.ReglaNegocioException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Traduce las excepciones de la aplicación a respuestas JSON con el código HTTP
 * correcto. Sin esto, cualquier excepción no controlada terminaba en un 500.
 */
@RestControllerAdvice
public class ManejadorGlobalExcepciones {

    private static final Logger log = LoggerFactory.getLogger(ManejadorGlobalExcepciones.class);

    /** Recurso inexistente: 404. */
    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> noEncontrado(RecursoNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(cuerpo("No encontrado", ex.getMessage()));
    }

    /** Regla de negocio incumplida (duplicados, estados inválidos, etc.): 409. */
    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<Map<String, Object>> reglaNegocio(ReglaNegocioException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(cuerpo("Conflicto", ex.getMessage()));
    }

    /** Errores de validación de @Valid: 400 con el detalle por campo. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validacion(MethodArgumentNotValidException ex) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            campos.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(datosConCampos(campos));
    }

    /**
     * Errores de validación que ocurren fuera del @Valid del controlador
     * (por ejemplo, al persistir una entidad). Se devuelven por campo.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> restricciones(ConstraintViolationException ex) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (ConstraintViolation<?> violacion : ex.getConstraintViolations()) {
            campos.putIfAbsent(
                    ultimoSegmento(violacion.getPropertyPath().toString()),
                    violacion.getMessage());
        }
        return ResponseEntity.badRequest().body(datosConCampos(campos));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> cuerpoIlegible(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest()
                .body(cuerpo("Solicitud inválida",
                        "El cuerpo de la petición no es válido o tiene un formato incorrecto"));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> tipoIncorrecto(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity.badRequest()
                .body(cuerpo("Parámetro inválido",
                        "El parámetro '" + ex.getName() + "' tiene un valor no permitido: " + ex.getValue()));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> parametroFaltante(MissingServletRequestParameterException ex) {
        return ResponseEntity.badRequest()
                .body(cuerpo("Parámetro faltante",
                        "Falta el parámetro obligatorio '" + ex.getParameterName() + "'"));
    }

    /** Método HTTP no permitido para la ruta: 405. */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> metodoNoPermitido(HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(cuerpo("Método no permitido",
                        "El método " + ex.getMethod() + " no está permitido para esta ruta"));
    }

    /** Content-Type no soportado: 415. */
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> tipoContenidoNoSoportado(HttpMediaTypeNotSupportedException ex) {
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(cuerpo("Tipo de contenido no soportado",
                        "Envía el cuerpo con Content-Type: application/json"));
    }

    /** Ruta que no existe: 404 en JSON en lugar del error por defecto de Spring. */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> rutaNoEncontrada(NoResourceFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(cuerpo("No encontrado", "La ruta solicitada no existe"));
    }

    /** Claves foráneas o valores únicos duplicados en la base: 409. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> integridad(DataIntegrityViolationException ex) {
        log.warn("Conflicto de integridad en la base de datos: {}",
                ex.getMostSpecificCause().getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(cuerpo("Conflicto con los datos",
                        "La operación viola una relación o un valor único de la base de datos"));
    }

    /** Credenciales inválidas en el login: 401. */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> credencialesInvalidas(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(cuerpo("No autorizado", "Usuario o contraseña incorrectos"));
    }

    /** Cuenta desactivada: 403. */
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<Map<String, Object>> cuentaInactiva(DisabledException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(cuerpo("Cuenta inactiva", "El usuario está inactivo"));
    }

    /**
     * El usuario está autenticado pero intenta acceder a un recurso que no le
     * pertenece o ejecutar una operación que su rol no permite: 403.
     */
    @ExceptionHandler(AccesoDenegadoException.class)
    public ResponseEntity<Map<String, Object>> accesoDenegado(AccesoDenegadoException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(cuerpo("Acceso denegado", ex.getMessage()));
    }

    /**
     * Denegación lanzada por Spring Security al evaluar @PreAuthorize o
     * expresiones de autorización dentro de un controlador: 403.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> accesoDenegadoSeguridad(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(cuerpo("Acceso denegado", "No tienes permiso para realizar esta operación"));
    }

    /** Cualquier error no controlado: 500 con log, sin exponer detalles al cliente. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> errorInterno(Exception ex) {
        log.error("Error no controlado", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(cuerpo("Error interno", "Ocurrió un error inesperado. Intenta de nuevo."));
    }

    private Map<String, Object> datosConCampos(Map<String, String> campos) {
        Map<String, Object> datos = cuerpo("Datos inválidos", "Revisa los campos marcados");
        datos.put("campos", campos);
        return datos;
    }

    /** De "guardar.entidad.seccion" devuelve "seccion". */
    private String ultimoSegmento(String ruta) {
        if (ruta == null || ruta.isBlank()) {
            return "solicitud";
        }
        int punto = ruta.lastIndexOf('.');
        return punto >= 0 ? ruta.substring(punto + 1) : ruta;
    }

    private Map<String, Object> cuerpo(String error, String mensaje) {
        Map<String, Object> datos = new LinkedHashMap<>();
        datos.put("error", error);
        datos.put("mensaje", mensaje == null ? "" : mensaje);
        return datos;
    }
}
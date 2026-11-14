package com.unmrma.escolar.controlador;

import com.unmrma.escolar.dtos.justificacionausencia.JustificacionAusenciaActualizarRequest;
import com.unmrma.escolar.dtos.justificacionausencia.JustificacionAusenciaCrearRequest;
import com.unmrma.escolar.dtos.justificacionausencia.JustificacionAusenciaRespuesta;
import com.unmrma.escolar.modelo.JustificacionAusencia;
import com.unmrma.escolar.seguridad.ServicioAutorizacion;
import com.unmrma.escolar.servicio.JustificacionAusenciaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/justificaciones-ausencia")
public class JustificacionAusenciaController {

    private final JustificacionAusenciaService servicio;
    private final ServicioAutorizacion acceso;

    public JustificacionAusenciaController(JustificacionAusenciaService servicio,
                                           ServicioAutorizacion acceso) {
        this.servicio = servicio;
        this.acceso = acceso;
    }

    /**
     * Director y maestro ven todas las justificaciones. Un alumno solo las de
     * sus propias ausencias y un tutor solo las de sus hijos.
     */
    @GetMapping
    public List<JustificacionAusenciaRespuesta> listarTodos() {
        List<JustificacionAusenciaRespuesta> justificaciones = servicio.listarTodos();
        if (acceso.esDirector() || acceso.esMaestro()) {
            return justificaciones;
        }
        return justificaciones.stream()
                .filter(j -> acceso.puedeVerJustificacionId(j.getAsistenciaId()))
                .toList();
    }

    /** Un alumno o tutor que pida una justificación ajena recibe 403. */
    @GetMapping("/{id}")
    public ResponseEntity<JustificacionAusenciaRespuesta> obtenerPorId(@PathVariable Integer id) {
        JustificacionAusenciaRespuesta justificacion = servicio.buscarPorId(id);
        acceso.exigirVerJustificacionId(justificacion.getAsistenciaId());
        return ResponseEntity.ok(justificacion);
    }

    /**
     * El alumno y el tutor solo justifican ausencias propias o de sus hijos.
     * Nadie puede crear una justificación ya aprobada: siempre nace pendiente
     * y sin datos de aprobación, aunque los envíe en el cuerpo.
     */
    @PostMapping
    public ResponseEntity<JustificacionAusenciaRespuesta> guardar(
            @Valid @RequestBody JustificacionAusenciaCrearRequest solicitud) {
        // Validar que el usuario puede justificar esta asistencia
        JustificacionAusencia entidadValidacion = new JustificacionAusencia();
        entidadValidacion.setAsistenciaId(solicitud.getAsistenciaId());
        acceso.exigirCrearJustificacion(entidadValidacion);

        return new ResponseEntity<>(servicio.guardar(solicitud), HttpStatus.CREATED);
    }

    /**
     * El director aprueba o rechaza cualquier justificación. El alumno o tutor
     * dueño solo corrige el motivo, las fechas y el documento mientras siga
     * pendiente; no puede cambiar la asistencia ni aprobarse a sí mismo.
     */
    @PutMapping("/{id}")
    public ResponseEntity<JustificacionAusenciaRespuesta> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody JustificacionAusenciaActualizarRequest solicitud) {

        JustificacionAusenciaRespuesta existente = servicio.buscarPorId(id);
        acceso.exigirVerJustificacionId(existente.getAsistenciaId());

        if (acceso.esDirector()) {
            // Director puede editar cualquier campo, incluido estado y aprobación.
            // Si no envía estado, se conserva el actual (antes se pisaba con null).
            JustificacionAusencia entidad = new JustificacionAusencia();
            entidad.setAsistenciaId(existente.getAsistenciaId());
            entidad.setMotivo(solicitud.getMotivo() != null ? solicitud.getMotivo() : existente.getMotivo());
            entidad.setFechaDesde(solicitud.getFechaDesde() != null ? solicitud.getFechaDesde() : existente.getFechaDesde());
            entidad.setFechaHasta(solicitud.getFechaHasta() != null ? solicitud.getFechaHasta() : existente.getFechaHasta());
            entidad.setDocumentoAdjunto(solicitud.getDocumentoAdjunto() != null ? solicitud.getDocumentoAdjunto() : existente.getDocumentoAdjunto());
            entidad.setEstado(solicitud.getEstado() != null ? solicitud.getEstado() : existente.getEstado());
            entidad.setObservacionAprobacion(solicitud.getObservacionAprobacion() != null
                    ? solicitud.getObservacionAprobacion() : existente.getObservacionAprobacion());

            // Al aprobar o rechazar se registra quién y cuándo (solo si cambia el estado).
            String estadoNuevo = entidad.getEstado() != null ? entidad.getEstado() : "";
            String estadoPrevio = existente.getEstado() != null ? existente.getEstado() : "";
            boolean cambiaResolucion = !estadoNuevo.equals(estadoPrevio)
                    && (estadoNuevo.equalsIgnoreCase("Aprobada") || estadoNuevo.equalsIgnoreCase("Rechazada"));
            entidad.setAprobadoPorId(cambiaResolucion ? acceso.usuarioId() : existente.getAprobadoPorId());
            entidad.setFechaAprobacion(cambiaResolucion ? java.time.LocalDateTime.now() : existente.getFechaAprobacion());

            return ResponseEntity.ok(servicio.actualizarDirector(id, entidad));
        } else {
            // Alumno/tutor solo corrige motivo, fechas y documento, solo si pendiente
            acceso.exigirEditarJustificacionId(existente.getAsistenciaId(), existente.getEstado());

            // Construir el request de actualización con los valores fusionados
            JustificacionAusenciaActualizarRequest request = new JustificacionAusenciaActualizarRequest();
            request.setMotivo(solicitud.getMotivo() != null ? solicitud.getMotivo() : existente.getMotivo());
            request.setFechaDesde(solicitud.getFechaDesde() != null ? solicitud.getFechaDesde() : existente.getFechaDesde());
            request.setFechaHasta(solicitud.getFechaHasta() != null ? solicitud.getFechaHasta() : existente.getFechaHasta());
            request.setDocumentoAdjunto(solicitud.getDocumentoAdjunto() != null ? solicitud.getDocumentoAdjunto() : existente.getDocumentoAdjunto());

            return ResponseEntity.ok(servicio.actualizar(id, request));
        }
    }

    /** Eliminar justificaciones queda reservado al director. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

package com.unmrma.escolar.dtos.justificacionausencia;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * DTO de solicitud para actualizar una justificacion de ausencia.
 * Todos los campos son opcionales para permitir actualizaciones parciales,
 * evitando mass assignment de campos no enviados. Solo el director puede
 * enviar estado y observacionAprobacion (aprobar o rechazar).
 */
public class JustificacionAusenciaActualizarRequest {

    @Size(max = 255, message = "El motivo no puede exceder 255 caracteres")
    private String motivo;

    private LocalDate fechaDesde;

    private LocalDate fechaHasta;

    @Size(max = 255, message = "El documento adjunto no puede exceder 255 caracteres")
    private String documentoAdjunto;

    @Size(max = 20, message = "El estado no puede exceder 20 caracteres")
    private String estado;

    @Size(max = 255, message = "La observación de aprobación no puede exceder 255 caracteres")
    private String observacionAprobacion;

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public LocalDate getFechaDesde() { return fechaDesde; }
    public void setFechaDesde(LocalDate fechaDesde) { this.fechaDesde = fechaDesde; }

    public LocalDate getFechaHasta() { return fechaHasta; }
    public void setFechaHasta(LocalDate fechaHasta) { this.fechaHasta = fechaHasta; }

    public String getDocumentoAdjunto() { return documentoAdjunto; }
    public void setDocumentoAdjunto(String documentoAdjunto) { this.documentoAdjunto = documentoAdjunto; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getObservacionAprobacion() { return observacionAprobacion; }
    public void setObservacionAprobacion(String observacionAprobacion) { this.observacionAprobacion = observacionAprobacion; }
}

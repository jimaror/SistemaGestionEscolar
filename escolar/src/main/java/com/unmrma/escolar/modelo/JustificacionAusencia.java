package com.unmrma.escolar.modelo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "justificaciones_ausencia")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class JustificacionAusencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_justificacion")
    private Integer id;

    @NotNull(message = "La asistencia es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_asistencia", nullable = false)
    private Asistencia asistencia;

    @NotBlank(message = "El motivo es obligatorio")
    @Size(max = 255)
    @Column(name = "motivo", nullable = false, length = 255)
    private String motivo;

    @NotNull(message = "La fecha desde es obligatoria")
    @Column(name = "fecha_desde", nullable = false)
    private LocalDate fechaDesde;

    @NotNull(message = "La fecha hasta es obligatoria")
    @Column(name = "fecha_hasta", nullable = false)
    private LocalDate fechaHasta;

    @Column(name = "documento_adjunto", length = 255)
    private String documentoAdjunto;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "Pendiente";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aprobado_por")
    private Usuario aprobadoPor;

    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;

    @Column(name = "observacion_aprobacion", length = 255)
    private String observacionAprobacion;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Asistencia getAsistencia() { return asistencia; }
    public void setAsistencia(Asistencia asistencia) { this.asistencia = asistencia; }

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

    public Usuario getAprobadoPor() { return aprobadoPor; }
    public void setAprobadoPor(Usuario aprobadoPor) { this.aprobadoPor = aprobadoPor; }

    public LocalDateTime getFechaAprobacion() { return fechaAprobacion; }
    public void setFechaAprobacion(LocalDateTime fechaAprobacion) { this.fechaAprobacion = fechaAprobacion; }

    public String getObservacionAprobacion() { return observacionAprobacion; }
    public void setObservacionAprobacion(String observacionAprobacion) { this.observacionAprobacion = observacionAprobacion; }

    public Integer getAsistenciaId() { return asistencia == null ? null : asistencia.getId(); }
    public void setAsistenciaId(Integer id) {
        if (id == null) { this.asistencia = null; return; }
        Asistencia a = new Asistencia();
        a.setId(id);
        this.asistencia = a;
    }

    public Integer getAprobadoPorId() { return aprobadoPor == null ? null : aprobadoPor.getId(); }
    public void setAprobadoPorId(Integer id) {
        if (id == null) { this.aprobadoPor = null; return; }
        Usuario u = new Usuario();
        u.setId(id);
        this.aprobadoPor = u;
    }
}

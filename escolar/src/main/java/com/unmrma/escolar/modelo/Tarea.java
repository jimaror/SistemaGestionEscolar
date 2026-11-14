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
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tareas")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Tarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tarea")
    private Integer id;

    @NotNull(message = "La asignación docente es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_asignacion_docente", nullable = false)
    private AsignacionDocente asignacionDocente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_evaluacion")
    private Evaluacion evaluacion;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 150)
    @Column(name = "titulo", nullable = false, length = 150)
    private String titulo;

    @Column(name = "descripcion", columnDefinition = "text")
    private String descripcion;

    @Column(name = "fecha_publicacion", nullable = false)
    private LocalDateTime fechaPublicacion = LocalDateTime.now();

    @NotNull(message = "La fecha límite es obligatoria")
    @Column(name = "fecha_limite", nullable = false)
    private LocalDateTime fechaLimite;

    @Column(name = "valor_puntos", precision = 5, scale = 2)
    private BigDecimal valorPuntos;

    @Column(name = "archivo_adjunto", length = 255)
    private String archivoAdjunto;

    @Column(name = "estado", nullable = false)
    private Boolean estado = true;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public AsignacionDocente getAsignacionDocente() { return asignacionDocente; }
    public void setAsignacionDocente(AsignacionDocente asignacionDocente) { this.asignacionDocente = asignacionDocente; }

    public Evaluacion getEvaluacion() { return evaluacion; }
    public void setEvaluacion(Evaluacion evaluacion) { this.evaluacion = evaluacion; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public LocalDateTime getFechaPublicacion() { return fechaPublicacion; }
    public void setFechaPublicacion(LocalDateTime fechaPublicacion) { this.fechaPublicacion = fechaPublicacion; }

    public LocalDateTime getFechaLimite() { return fechaLimite; }
    public void setFechaLimite(LocalDateTime fechaLimite) { this.fechaLimite = fechaLimite; }

    public BigDecimal getValorPuntos() { return valorPuntos; }
    public void setValorPuntos(BigDecimal valorPuntos) { this.valorPuntos = valorPuntos; }

    public String getArchivoAdjunto() { return archivoAdjunto; }
    public void setArchivoAdjunto(String archivoAdjunto) { this.archivoAdjunto = archivoAdjunto; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }

    public Integer getAsignacionDocenteId() { return asignacionDocente == null ? null : asignacionDocente.getId(); }
    public void setAsignacionDocenteId(Integer id) {
        if (id == null) { this.asignacionDocente = null; return; }
        AsignacionDocente a = new AsignacionDocente();
        a.setId(id);
        this.asignacionDocente = a;
    }

    public Integer getEvaluacionId() { return evaluacion == null ? null : evaluacion.getId(); }
    public void setEvaluacionId(Integer id) {
        if (id == null) { this.evaluacion = null; return; }
        Evaluacion e = new Evaluacion();
        e.setId(id);
        this.evaluacion = e;
    }
}

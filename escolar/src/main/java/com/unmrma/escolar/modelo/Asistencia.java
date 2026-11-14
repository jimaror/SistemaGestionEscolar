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
@Table(name = "asistencias")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Asistencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asistencia")
    private Integer id;

    @NotNull(message = "La matrícula es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_matricula", nullable = false)
    private Matricula matricula;

    @NotNull(message = "La asignación docente es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_asignacion_docente", nullable = false)
    private AsignacionDocente asignacionDocente;

    @NotNull(message = "La fecha es obligatoria")
    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @NotBlank(message = "El estado es obligatorio")
    @Size(max = 20)
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @Column(name = "observacion", length = 255)
    private String observacion;

    @NotNull(message = "El usuario que registra es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registrado_por", nullable = false)
    private Usuario registradoPor;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro = LocalDateTime.now();

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Matricula getMatricula() { return matricula; }
    public void setMatricula(Matricula matricula) { this.matricula = matricula; }

    public AsignacionDocente getAsignacionDocente() { return asignacionDocente; }
    public void setAsignacionDocente(AsignacionDocente asignacionDocente) { this.asignacionDocente = asignacionDocente; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }

    public Usuario getRegistradoPor() { return registradoPor; }
    public void setRegistradoPor(Usuario registradoPor) { this.registradoPor = registradoPor; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public Integer getMatriculaId() { return matricula == null ? null : matricula.getId(); }
    public void setMatriculaId(Integer id) {
        if (id == null) { this.matricula = null; return; }
        Matricula m = new Matricula();
        m.setId(id);
        this.matricula = m;
    }

    public Integer getAsignacionDocenteId() { return asignacionDocente == null ? null : asignacionDocente.getId(); }
    public void setAsignacionDocenteId(Integer id) {
        if (id == null) { this.asignacionDocente = null; return; }
        AsignacionDocente a = new AsignacionDocente();
        a.setId(id);
        this.asignacionDocente = a;
    }

    public Integer getRegistradoPorId() { return registradoPor == null ? null : registradoPor.getId(); }
    public void setRegistradoPorId(Integer id) {
        if (id == null) { this.registradoPor = null; return; }
        Usuario u = new Usuario();
        u.setId(id);
        this.registradoPor = u;
    }
}

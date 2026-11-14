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
import java.time.LocalDateTime;

@Entity
@Table(name = "reuniones")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Reunion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reunion")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_asignacion_docente")
    private AsignacionDocente asignacionDocente;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 150)
    @Column(name = "titulo", nullable = false, length = 150)
    private String titulo;

    @Column(name = "descripcion", columnDefinition = "text")
    private String descripcion;

    @NotBlank(message = "El enlace es obligatorio")
    @Size(max = 255)
    @Column(name = "enlace", nullable = false, length = 255)
    private String enlace;

    @NotNull(message = "La fecha y hora son obligatorias")
    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @Column(name = "duracion_minutos")
    private Integer duracionMinutos;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "Programada";

    @NotNull(message = "El creador es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creada_por", nullable = false)
    private Usuario creadaPor;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public AsignacionDocente getAsignacionDocente() { return asignacionDocente; }
    public void setAsignacionDocente(AsignacionDocente asignacionDocente) { this.asignacionDocente = asignacionDocente; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getEnlace() { return enlace; }
    public void setEnlace(String enlace) { this.enlace = enlace; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public Integer getDuracionMinutos() { return duracionMinutos; }
    public void setDuracionMinutos(Integer duracionMinutos) { this.duracionMinutos = duracionMinutos; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Usuario getCreadaPor() { return creadaPor; }
    public void setCreadaPor(Usuario creadaPor) { this.creadaPor = creadaPor; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public Integer getAsignacionDocenteId() { return asignacionDocente == null ? null : asignacionDocente.getId(); }
    public void setAsignacionDocenteId(Integer id) {
        if (id == null) { this.asignacionDocente = null; return; }
        AsignacionDocente a = new AsignacionDocente();
        a.setId(id);
        this.asignacionDocente = a;
    }

    public Integer getCreadaPorId() { return creadaPor == null ? null : creadaPor.getId(); }
    public void setCreadaPorId(Integer id) {
        if (id == null) { this.creadaPor = null; return; }
        Usuario u = new Usuario();
        u.setId(id);
        this.creadaPor = u;
    }
}

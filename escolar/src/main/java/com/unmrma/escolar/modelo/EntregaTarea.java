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
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "entregas_tareas")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class EntregaTarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_entrega")
    private Integer id;

    @NotNull(message = "La tarea es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tarea", nullable = false)
    private Tarea tarea;

    @NotNull(message = "El alumno es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_alumno", nullable = false)
    private Alumno alumno;

    @Column(name = "contenido", columnDefinition = "text")
    private String contenido;

    @Column(name = "archivo_entrega", length = 255)
    private String archivoEntrega;

    @Column(name = "fecha_entrega", nullable = false)
    private LocalDateTime fechaEntrega = LocalDateTime.now();

    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "Entregada";

    @Size(max = 255)
    @Column(name = "observacion_profesor", length = 255)
    private String observacionProfesor;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Tarea getTarea() { return tarea; }
    public void setTarea(Tarea tarea) { this.tarea = tarea; }

    public Alumno getAlumno() { return alumno; }
    public void setAlumno(Alumno alumno) { this.alumno = alumno; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public String getArchivoEntrega() { return archivoEntrega; }
    public void setArchivoEntrega(String archivoEntrega) { this.archivoEntrega = archivoEntrega; }

    public LocalDateTime getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(LocalDateTime fechaEntrega) { this.fechaEntrega = fechaEntrega; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getObservacionProfesor() { return observacionProfesor; }
    public void setObservacionProfesor(String observacionProfesor) { this.observacionProfesor = observacionProfesor; }

    public Integer getTareaId() { return tarea == null ? null : tarea.getId(); }
    public void setTareaId(Integer id) {
        if (id == null) { this.tarea = null; return; }
        Tarea t = new Tarea();
        t.setId(id);
        this.tarea = t;
    }

    public Integer getAlumnoId() { return alumno == null ? null : alumno.getId(); }
    public void setAlumnoId(Integer id) {
        if (id == null) { this.alumno = null; return; }
        Alumno a = new Alumno();
        a.setId(id);
        this.alumno = a;
    }
}

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
import java.time.LocalDate;

@Entity
@Table(name = "matriculas")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_matricula")
    private Integer id;

    @NotNull(message = "El alumno es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_alumno", nullable = false)
    private Alumno alumno;

    @NotNull(message = "La sección es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_seccion", nullable = false)
    private Seccion seccion;

    @NotNull(message = "El año escolar es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_anio_escolar", nullable = false)
    private AnioEscolar anioEscolar;

    @Column(name = "fecha_matricula", nullable = false)
    private LocalDate fechaMatricula = LocalDate.now();

    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "Activa";

    @Size(max = 255)
    @Column(name = "observaciones", length = 255)
    private String observaciones;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Alumno getAlumno() { return alumno; }
    public void setAlumno(Alumno alumno) { this.alumno = alumno; }

    public Seccion getSeccion() { return seccion; }
    public void setSeccion(Seccion seccion) { this.seccion = seccion; }

    public AnioEscolar getAnioEscolar() { return anioEscolar; }
    public void setAnioEscolar(AnioEscolar anioEscolar) { this.anioEscolar = anioEscolar; }

    public LocalDate getFechaMatricula() { return fechaMatricula; }
    public void setFechaMatricula(LocalDate fechaMatricula) { this.fechaMatricula = fechaMatricula; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public Integer getAlumnoId() { return alumno == null ? null : alumno.getId(); }
    public void setAlumnoId(Integer id) {
        if (id == null) { this.alumno = null; return; }
        Alumno a = new Alumno();
        a.setId(id);
        this.alumno = a;
    }

    public Integer getSeccionId() { return seccion == null ? null : seccion.getId(); }
    public void setSeccionId(Integer id) {
        if (id == null) { this.seccion = null; return; }
        Seccion s = new Seccion();
        s.setId(id);
        this.seccion = s;
    }

    public Integer getAnioEscolarId() { return anioEscolar == null ? null : anioEscolar.getId(); }
    public void setAnioEscolarId(Integer id) {
        if (id == null) { this.anioEscolar = null; return; }
        AnioEscolar a = new AnioEscolar();
        a.setId(id);
        this.anioEscolar = a;
    }
}

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

@Entity
@Table(name = "alumno_tutor")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class AlumnoTutor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_alumno_tutor")
    private Integer id;

    @NotNull(message = "El alumno es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_alumno", nullable = false)
    private Alumno alumno;

    @NotNull(message = "El tutor es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tutor", nullable = false)
    private Tutor tutor;

    @NotBlank(message = "El parentesco es obligatorio")
    @Size(max = 20)
    @Column(name = "parentesco", nullable = false, length = 20)
    private String parentesco;

    @Column(name = "es_principal", nullable = false)
    private Boolean esPrincipal = false;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Alumno getAlumno() { return alumno; }
    public void setAlumno(Alumno alumno) { this.alumno = alumno; }

    public Tutor getTutor() { return tutor; }
    public void setTutor(Tutor tutor) { this.tutor = tutor; }

    public String getParentesco() { return parentesco; }
    public void setParentesco(String parentesco) { this.parentesco = parentesco; }

    public Boolean getEsPrincipal() { return esPrincipal; }
    public void setEsPrincipal(Boolean esPrincipal) { this.esPrincipal = esPrincipal; }

    public Integer getAlumnoId() { return alumno == null ? null : alumno.getId(); }
    public void setAlumnoId(Integer id) {
        if (id == null) { this.alumno = null; return; }
        Alumno a = new Alumno();
        a.setId(id);
        this.alumno = a;
    }

    public Integer getTutorId() { return tutor == null ? null : tutor.getId(); }
    public void setTutorId(Integer id) {
        if (id == null) { this.tutor = null; return; }
        Tutor t = new Tutor();
        t.setId(id);
        this.tutor = t;
    }
}

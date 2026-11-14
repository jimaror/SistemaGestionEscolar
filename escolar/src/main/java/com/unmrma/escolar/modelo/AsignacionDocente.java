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

@Entity
@Table(name = "asignaciones_docentes")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class AsignacionDocente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asignacion")
    private Integer id;

    @NotNull(message = "La asignatura es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_asignatura", nullable = false)
    private Asignatura asignatura;

    @NotNull(message = "La sección es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_seccion", nullable = false)
    private Seccion seccion;

    @NotNull(message = "El maestro es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_maestro", nullable = false)
    private Maestro maestro;

    @Column(name = "horas_semanales")
    private Byte horasSemanales;

    @Column(name = "estado", nullable = false)
    private Boolean estado = true;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Asignatura getAsignatura() { return asignatura; }
    public void setAsignatura(Asignatura asignatura) { this.asignatura = asignatura; }

    public Seccion getSeccion() { return seccion; }
    public void setSeccion(Seccion seccion) { this.seccion = seccion; }

    public Maestro getMaestro() { return maestro; }
    public void setMaestro(Maestro maestro) { this.maestro = maestro; }

    public Byte getHorasSemanales() { return horasSemanales; }
    public void setHorasSemanales(Byte horasSemanales) { this.horasSemanales = horasSemanales; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }

    public Integer getAsignaturaId() { return asignatura == null ? null : asignatura.getId(); }
    public void setAsignaturaId(Integer id) {
        if (id == null) { this.asignatura = null; return; }
        Asignatura a = new Asignatura();
        a.setId(id);
        this.asignatura = a;
    }

    public Integer getSeccionId() { return seccion == null ? null : seccion.getId(); }
    public void setSeccionId(Integer id) {
        if (id == null) { this.seccion = null; return; }
        Seccion s = new Seccion();
        s.setId(id);
        this.seccion = s;
    }

    public Integer getMaestroId() { return maestro == null ? null : maestro.getId(); }
    public void setMaestroId(Integer id) {
        if (id == null) { this.maestro = null; return; }
        Maestro m = new Maestro();
        m.setId(id);
        this.maestro = m;
    }
}

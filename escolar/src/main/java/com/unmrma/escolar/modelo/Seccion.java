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
@Table(name = "secciones")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Seccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_seccion")
    private Integer id;

    @NotNull(message = "El año escolar es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_anio_escolar", nullable = false)
    private AnioEscolar anioEscolar;

    @NotNull(message = "El grado es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_grado", nullable = false)
    private Grado grado;

    @NotBlank(message = "El nombre de la sección es obligatorio")
    @Size(max = 10)
    @Column(name = "nombre", nullable = false, length = 10)
    private String nombre;

    @NotBlank(message = "El turno es obligatorio")
    @Size(max = 12)
    @Column(name = "turno", nullable = false, length = 12)
    private String turno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_maestro_guia")
    private Maestro maestroGuia;

    @Column(name = "cupo_maximo")
    private Byte cupoMaximo = 35;

    @Column(name = "estado", nullable = false, length = 10)
    private String estado = "Activo";

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public AnioEscolar getAnioEscolar() { return anioEscolar; }
    public void setAnioEscolar(AnioEscolar anioEscolar) { this.anioEscolar = anioEscolar; }

    public Grado getGrado() { return grado; }
    public void setGrado(Grado grado) { this.grado = grado; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getTurno() { return turno; }
    public void setTurno(String turno) { this.turno = turno; }

    public Maestro getMaestroGuia() { return maestroGuia; }
    public void setMaestroGuia(Maestro maestroGuia) { this.maestroGuia = maestroGuia; }

    public Byte getCupoMaximo() { return cupoMaximo; }
    public void setCupoMaximo(Byte cupoMaximo) { this.cupoMaximo = cupoMaximo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Integer getAnioEscolarId() { return anioEscolar == null ? null : anioEscolar.getId(); }
    public void setAnioEscolarId(Integer id) {
        if (id == null) { this.anioEscolar = null; return; }
        AnioEscolar a = new AnioEscolar();
        a.setId(id);
        this.anioEscolar = a;
    }

    public Byte getGradoId() { return grado == null ? null : grado.getId(); }
    public void setGradoId(Byte id) {
        if (id == null) { this.grado = null; return; }
        Grado g = new Grado();
        g.setId(id);
        this.grado = g;
    }

    public Integer getMaestroGuiaId() { return maestroGuia == null ? null : maestroGuia.getId(); }
    public void setMaestroGuiaId(Integer id) {
        if (id == null) { this.maestroGuia = null; return; }
        Maestro m = new Maestro();
        m.setId(id);
        this.maestroGuia = m;
    }
}

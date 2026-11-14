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
@Table(name = "tutores")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Tutor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tutor")
    private Integer id;

    @NotNull(message = "El usuario es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "ocupacion", length = 100)
    private String ocupacion;

    @Column(name = "lugar_trabajo", length = 120)
    private String lugarTrabajo;

    @Column(name = "telefono_trabajo", length = 8)
    private String telefonoTrabajo;

    @Column(name = "correo_personal", length = 100)
    private String correoPersonal;

    @Column(name = "direccion_trabajo", length = 255)
    private String direccionTrabajo;

    @Column(name = "horario_atencion", length = 100)
    private String horarioAtencion;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public String getOcupacion() { return ocupacion; }
    public void setOcupacion(String ocupacion) { this.ocupacion = ocupacion; }

    public String getLugarTrabajo() { return lugarTrabajo; }
    public void setLugarTrabajo(String lugarTrabajo) { this.lugarTrabajo = lugarTrabajo; }

    public String getTelefonoTrabajo() { return telefonoTrabajo; }
    public void setTelefonoTrabajo(String telefonoTrabajo) { this.telefonoTrabajo = telefonoTrabajo; }

    public String getCorreoPersonal() { return correoPersonal; }
    public void setCorreoPersonal(String correoPersonal) { this.correoPersonal = correoPersonal; }

    public String getDireccionTrabajo() { return direccionTrabajo; }
    public void setDireccionTrabajo(String direccionTrabajo) { this.direccionTrabajo = direccionTrabajo; }

    public String getHorarioAtencion() { return horarioAtencion; }
    public void setHorarioAtencion(String horarioAtencion) { this.horarioAtencion = horarioAtencion; }

    public Integer getUsuarioId() { return usuario == null ? null : usuario.getId(); }
    public void setUsuarioId(Integer id) {
        if (id == null) { this.usuario = null; return; }
        Usuario u = new Usuario();
        u.setId(id);
        this.usuario = u;
    }
}

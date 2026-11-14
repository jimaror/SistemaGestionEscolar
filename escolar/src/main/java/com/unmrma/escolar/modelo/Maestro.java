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
@Table(name = "maestros")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Maestro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_maestro")
    private Integer id;

    @NotNull(message = "El usuario es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Size(max = 15)
    @Column(name = "numero_inss", length = 15)
    private String numeroInss;

    @Column(name = "especialidad", length = 255)
    private String especialidad;

    @Column(name = "titulo", length = 100)
    private String titulo;

    @NotNull(message = "La fecha de ingreso es obligatoria")
    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso;

    @Column(name = "correo", length = 255)
    private String correo;

    @Column(name = "telefono", length = 255)
    private String telefono;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Integer getUsuarioId() { return usuario == null ? null : usuario.getId(); }
    public void setUsuarioId(Integer id) {
        if (id == null) { this.usuario = null; return; }
        Usuario u = new Usuario();
        u.setId(id);
        this.usuario = u;
    }

    public String getNombre() { return usuario == null ? null : usuario.getNombres(); }
    public String getApellido() { return usuario == null ? null : usuario.getApellidos(); }

    public String getNumeroInss() { return numeroInss; }
    public void setNumeroInss(String numeroInss) { this.numeroInss = numeroInss; }

    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public LocalDate getFechaIngreso() { return fechaIngreso; }
    public void setFechaIngreso(LocalDate fechaIngreso) { this.fechaIngreso = fechaIngreso; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
}

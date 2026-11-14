package com.unmrma.escolar.dtos.maestro;

import java.time.LocalDate;

/**
 * DTO de respuesta para un expediente de maestro. Expone solo los campos
 * planos y el ID del usuario vinculado, sin exponer el objeto Usuario
 * completo (evita exponer password ni otros datos sensibles).
 */
public class MaestroRespuesta {

    private Integer id;
    private Integer idUsuario;
    private String nombre;
    private String apellido;
    private String numeroInss;
    private String especialidad;
    private String titulo;
    private LocalDate fechaIngreso;
    private String correo;
    private String telefono;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

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

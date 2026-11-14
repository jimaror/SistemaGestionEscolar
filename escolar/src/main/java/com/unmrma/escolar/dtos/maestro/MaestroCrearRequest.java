package com.unmrma.escolar.dtos.maestro;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * DTO de solicitud para crear un expediente de maestro. Solo lo usa el
 * director. El campo idUsuario es obligatorio para vincular al usuario.
 */
public class MaestroCrearRequest {

    @NotNull(message = "El usuario es obligatorio")
    private Integer idUsuario;

    @Size(max = 15, message = "El número INSS no puede exceder 15 caracteres")
    private String numeroInss;

    @Size(max = 255, message = "La especialidad no puede exceder 255 caracteres")
    private String especialidad;

    @Size(max = 100, message = "El título no puede exceder 100 caracteres")
    private String titulo;

    @NotNull(message = "La fecha de ingreso es obligatoria")
    private LocalDate fechaIngreso;

    @Size(max = 255, message = "El correo no puede exceder 255 caracteres")
    private String correo;

    @Size(max = 255, message = "El teléfono no puede exceder 255 caracteres")
    private String telefono;

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

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

package com.unmrma.escolar.dtos.reunion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * DTO de solicitud para crear una reunion. Solo director y maestro pueden
 * crearla, y el maestro solo en sus propias asignaciones (valido en el
 * controlador). El campo creadaPor se fuerza desde la cuenta autenticada.
 */
public class ReunionCrearRequest {

    private Integer asignacionDocenteId;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 150, message = "El título no puede exceder 150 caracteres")
    private String titulo;

    @Size(max = 1000, message = "La descripción no puede exceder 1000 caracteres")
    private String descripcion;

    @NotBlank(message = "El enlace es obligatorio")
    @Size(max = 255, message = "El enlace no puede exceder 255 caracteres")
    private String enlace;

    @NotNull(message = "La fecha y hora son obligatorias")
    private LocalDateTime fechaHora;

    private Integer duracionMinutos;

    private String estado = "Programada";

    public Integer getAsignacionDocenteId() { return asignacionDocenteId; }
    public void setAsignacionDocenteId(Integer asignacionDocenteId) { this.asignacionDocenteId = asignacionDocenteId; }

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
}

package com.unmrma.escolar.dtos.reunion;

import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * DTO de solicitud para actualizar una reunion. Todos los campos son
 * opcionales para permitir actualizaciones parciales, evitando mass
 * assignment de campos no enviados. No se puede cambiar asignacionDocenteId
 * ni creadaPorId.
 */
public class ReunionActualizarRequest {

    @Size(max = 150, message = "El título no puede exceder 150 caracteres")
    private String titulo;

    @Size(max = 1000, message = "La descripción no puede exceder 1000 caracteres")
    private String descripcion;

    @Size(max = 255, message = "El enlace no puede exceder 255 caracteres")
    private String enlace;

    private LocalDateTime fechaHora;

    private Integer duracionMinutos;

    private String estado;

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

package com.unmrma.escolar.dtos.material;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO de solicitud para crear un material. Solo director y maestro pueden
 * crearlo, y el maestro solo en sus propias asignaciones (valido en el
 * controlador).
 */
public class MaterialCrearRequest {

    @NotNull(message = "La asignación docente es obligatoria")
    private Integer asignacionDocenteId;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 150, message = "El título no puede exceder 150 caracteres")
    private String titulo;

    @Size(max = 1000, message = "La descripción no puede exceder 1000 caracteres")
    private String descripcion;

    @NotBlank(message = "El tipo es obligatorio")
    @Size(max = 30, message = "El tipo no puede exceder 30 caracteres")
    private String tipo;

    @Size(max = 255, message = "La ruta del archivo no puede exceder 255 caracteres")
    private String rutaArchivo;

    private Boolean visible = true;

    public Integer getAsignacionDocenteId() { return asignacionDocenteId; }
    public void setAsignacionDocenteId(Integer asignacionDocenteId) { this.asignacionDocenteId = asignacionDocenteId; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getRutaArchivo() { return rutaArchivo; }
    public void setRutaArchivo(String rutaArchivo) { this.rutaArchivo = rutaArchivo; }

    public Boolean getVisible() { return visible; }
    public void setVisible(Boolean visible) { this.visible = visible; }
}

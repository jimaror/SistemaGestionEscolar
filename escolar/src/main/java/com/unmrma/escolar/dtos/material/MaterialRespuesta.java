package com.unmrma.escolar.dtos.material;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para un material. Expone solo los campos planos y el ID
 * de la asignación docente relacionada, sin exponer el objeto completo.
 */
public class MaterialRespuesta {

    private Integer id;
    private Integer asignacionDocenteId;
    private String titulo;
    private String descripcion;
    private String tipo;
    private String rutaArchivo;
    private LocalDateTime fechaPublicacion;
    private Boolean visible;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

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

    public LocalDateTime getFechaPublicacion() { return fechaPublicacion; }
    public void setFechaPublicacion(LocalDateTime fechaPublicacion) { this.fechaPublicacion = fechaPublicacion; }

    public Boolean getVisible() { return visible; }
    public void setVisible(Boolean visible) { this.visible = visible; }
}

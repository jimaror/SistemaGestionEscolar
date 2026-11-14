package com.unmrma.escolar.dtos.asignatura;

import jakarta.validation.constraints.Size;

/**
 * DTO de solicitud para actualizar una asignatura. Todos los campos son
 * opcionales para permitir actualizaciones parciales, evitando mass
 * assignment de campos no enviados.
 */
public class AsignaturaActualizarRequest {

    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String nombre;

    @Size(max = 10, message = "La abreviatura no puede exceder 10 caracteres")
    private String abreviatura;

    @Size(max = 20, message = "El codigo no puede exceder 20 caracteres")
    private String codigo;

    private Boolean activo;

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getAbreviatura() { return abreviatura; }
    public void setAbreviatura(String abreviatura) { this.abreviatura = abreviatura; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}

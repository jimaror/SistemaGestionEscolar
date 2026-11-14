package com.unmrma.escolar.dtos.asignatura;

/**
 * DTO de respuesta para una asignatura. Expone solo los campos planos
 * sin exponer la entidad completa ni relaciones anidadas.
 */
public class AsignaturaRespuesta {

    private Integer id;
    private String nombre;
    private String abreviatura;
    private String codigo;
    private Boolean activo;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getAbreviatura() { return abreviatura; }
    public void setAbreviatura(String abreviatura) { this.abreviatura = abreviatura; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}

package com.unmrma.escolar.dtos.grado;

/**
 * DTO de respuesta para un grado. Expone solo los campos planos del grado.
 */
public class GradoRespuesta {

    private Byte id;
    private String nombre;
    private String nivel;
    private Byte orden;

    public Byte getId() { return id; }
    public void setId(Byte id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getNivel() { return nivel; }
    public void setNivel(String nivel) { this.nivel = nivel; }

    public Byte getOrden() { return orden; }
    public void setOrden(Byte orden) { this.orden = orden; }
}

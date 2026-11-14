package com.unmrma.escolar.dtos.asignaciondocente;

/**
 * DTO de respuesta para una asignacion docente. Expone los IDs de las
 * entidades relacionadas sin exponer los objetos completos, evitando
 * exposicion innecesaria de datos anidados.
 */
public class AsignacionDocenteRespuesta {

    private Integer id;
    private Integer asignaturaId;
    private Integer seccionId;
    private Integer maestroId;
    private Byte horasSemanales;
    private Boolean estado;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getAsignaturaId() { return asignaturaId; }
    public void setAsignaturaId(Integer asignaturaId) { this.asignaturaId = asignaturaId; }

    public Integer getSeccionId() { return seccionId; }
    public void setSeccionId(Integer seccionId) { this.seccionId = seccionId; }

    public Integer getMaestroId() { return maestroId; }
    public void setMaestroId(Integer maestroId) { this.maestroId = maestroId; }

    public Byte getHorasSemanales() { return horasSemanales; }
    public void setHorasSemanales(Byte horasSemanales) { this.horasSemanales = horasSemanales; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }
}

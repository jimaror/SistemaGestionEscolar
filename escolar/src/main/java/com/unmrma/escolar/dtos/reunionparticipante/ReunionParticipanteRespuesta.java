package com.unmrma.escolar.dtos.reunionparticipante;

/**
 * DTO de respuesta para un participante de reunion.
 * Expone solo los campos planos y los IDs de las entidades relacionadas.
 */
public class ReunionParticipanteRespuesta {

    private Integer id;
    private Integer reunionId;
    private Integer usuarioId;
    private Boolean confirmado;
    private Boolean asistio;
    private String observacion;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getReunionId() { return reunionId; }
    public void setReunionId(Integer reunionId) { this.reunionId = reunionId; }

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }

    public Boolean getConfirmado() { return confirmado; }
    public void setConfirmado(Boolean confirmado) { this.confirmado = confirmado; }

    public Boolean getAsistio() { return asistio; }
    public void setAsistio(Boolean asistio) { this.asistio = asistio; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }
}

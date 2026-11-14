package com.unmrma.escolar.dtos.mensaje;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para un mensaje. Expone solo los campos planos y los IDs
 * de las entidades relacionadas, sin exponer los objetos completos.
 */
public class MensajeRespuesta {

    private Integer id;
    private Integer conversacionId;
    private Integer remitenteId;
    private String contenido;
    private LocalDateTime fechaEnvio;
    private Boolean leido;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getConversacionId() { return conversacionId; }
    public void setConversacionId(Integer conversacionId) { this.conversacionId = conversacionId; }

    public Integer getRemitenteId() { return remitenteId; }
    public void setRemitenteId(Integer remitenteId) { this.remitenteId = remitenteId; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }

    public Boolean getLeido() { return leido; }
    public void setLeido(Boolean leido) { this.leido = leido; }
}

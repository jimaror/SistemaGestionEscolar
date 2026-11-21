package com.unmrma.escolar.dtos.conversacionparticipante;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para un participante de conversacion. Expone solo los
 * campos planos y los IDs de las entidades relacionadas.
 */
public class ConversacionParticipanteRespuesta {

    private Integer id;
    private Integer conversacionId;
    private Integer usuarioId;
    private String rolEnConversacion;
    private String usuarioNombre;
    private String usuarioApellidos;
    private String usuarioRol;
    private LocalDateTime fechaUltimaLectura;
    private Boolean activo;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getConversacionId() { return conversacionId; }
    public void setConversacionId(Integer conversacionId) { this.conversacionId = conversacionId; }

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }

    public String getRolEnConversacion() { return rolEnConversacion; }
    public void setRolEnConversacion(String rolEnConversacion) { this.rolEnConversacion = rolEnConversacion; }

    public String getUsuarioNombre() { return usuarioNombre; }
    public void setUsuarioNombre(String usuarioNombre) { this.usuarioNombre = usuarioNombre; }

    public String getUsuarioApellidos() { return usuarioApellidos; }
    public void setUsuarioApellidos(String usuarioApellidos) { this.usuarioApellidos = usuarioApellidos; }

    public String getUsuarioRol() { return usuarioRol; }
    public void setUsuarioRol(String usuarioRol) { this.usuarioRol = usuarioRol; }

    public LocalDateTime getFechaUltimaLectura() { return fechaUltimaLectura; }
    public void setFechaUltimaLectura(LocalDateTime fechaUltimaLectura) { this.fechaUltimaLectura = fechaUltimaLectura; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}

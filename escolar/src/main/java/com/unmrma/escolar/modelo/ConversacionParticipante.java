package com.unmrma.escolar.modelo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversacion_participantes")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class ConversacionParticipante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_participante")
    private Integer id;

    @NotNull(message = "La conversación es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_conversacion", nullable = false)
    private Conversacion conversacion;

    @NotNull(message = "El usuario es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Size(max = 20)
    @Column(name = "rol_en_conversacion", nullable = false, length = 20)
    private String rolEnConversacion = "Participante";

    @Column(name = "fecha_ultima_lectura")
    private LocalDateTime fechaUltimaLectura;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Conversacion getConversacion() { return conversacion; }
    public void setConversacion(Conversacion conversacion) { this.conversacion = conversacion; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public String getRolEnConversacion() { return rolEnConversacion; }
    public void setRolEnConversacion(String rolEnConversacion) { this.rolEnConversacion = rolEnConversacion; }

    public LocalDateTime getFechaUltimaLectura() { return fechaUltimaLectura; }
    public void setFechaUltimaLectura(LocalDateTime fechaUltimaLectura) { this.fechaUltimaLectura = fechaUltimaLectura; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public Integer getConversacionId() { return conversacion == null ? null : conversacion.getId(); }
    public void setConversacionId(Integer id) {
        if (id == null) { this.conversacion = null; return; }
        Conversacion c = new Conversacion();
        c.setId(id);
        this.conversacion = c;
    }

    public Integer getUsuarioId() { return usuario == null ? null : usuario.getId(); }
    public void setUsuarioId(Integer id) {
        if (id == null) { this.usuario = null; return; }
        Usuario u = new Usuario();
        u.setId(id);
        this.usuario = u;
    }
}

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

@Entity
@Table(name = "reunion_participantes")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class ReunionParticipante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_registro")
    private Integer id;

    @NotNull(message = "La reunión es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reunion", nullable = false)
    private Reunion reunion;

    @NotNull(message = "El usuario es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "confirmado")
    private Boolean confirmado;

    @Column(name = "asistio")
    private Boolean asistio;

    @Size(max = 255)
    @Column(name = "observacion", length = 255)
    private String observacion;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Reunion getReunion() { return reunion; }
    public void setReunion(Reunion reunion) { this.reunion = reunion; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Boolean getConfirmado() { return confirmado; }
    public void setConfirmado(Boolean confirmado) { this.confirmado = confirmado; }

    public Boolean getAsistio() { return asistio; }
    public void setAsistio(Boolean asistio) { this.asistio = asistio; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }

    public Integer getReunionId() { return reunion == null ? null : reunion.getId(); }
    public void setReunionId(Integer id) {
        if (id == null) { this.reunion = null; return; }
        Reunion r = new Reunion();
        r.setId(id);
        this.reunion = r;
    }

    public Integer getUsuarioId() { return usuario == null ? null : usuario.getId(); }
    public void setUsuarioId(Integer id) {
        if (id == null) { this.usuario = null; return; }
        Usuario u = new Usuario();
        u.setId(id);
        this.usuario = u;
    }
}

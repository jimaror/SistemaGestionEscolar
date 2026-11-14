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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "materiales")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_material")
    private Integer id;

    @NotNull(message = "La asignación docente es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_asignacion_docente", nullable = false)
    private AsignacionDocente asignacionDocente;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 150)
    @Column(name = "titulo", nullable = false, length = 150)
    private String titulo;

    @Column(name = "descripcion", columnDefinition = "text")
    private String descripcion;

    @NotBlank(message = "El tipo es obligatorio")
    @Size(max = 30)
    @Column(name = "tipo", nullable = false, length = 30)
    private String tipo;

    @Column(name = "ruta_archivo", length = 255)
    private String rutaArchivo;

    @Column(name = "fecha_publicacion", nullable = false)
    private LocalDateTime fechaPublicacion = LocalDateTime.now();

    @Column(name = "visible", nullable = false)
    private Boolean visible = true;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public AsignacionDocente getAsignacionDocente() { return asignacionDocente; }
    public void setAsignacionDocente(AsignacionDocente asignacionDocente) { this.asignacionDocente = asignacionDocente; }

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

    public Integer getAsignacionDocenteId() { return asignacionDocente == null ? null : asignacionDocente.getId(); }
    public void setAsignacionDocenteId(Integer id) {
        if (id == null) { this.asignacionDocente = null; return; }
        AsignacionDocente a = new AsignacionDocente();
        a.setId(id);
        this.asignacionDocente = a;
    }
}

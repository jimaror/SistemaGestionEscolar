package com.unmrma.escolar.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "alumnos")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Alumno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_alumno")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "codigo_mined", length = 20)
    private String codigoMined;

    @Column(name = "colegio_procedencia", length = 120)
    private String colegioProcedencia;

    @Column(name = "necesidad_especial", length = 255)
    private String necesidadEspecial;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso;

    @Column(name = "transporte", length = 30)
    private String transporte;

    @Column(name = "alergias", columnDefinition = "text")
    private String alergias;

    @Column(name = "enfermedades", columnDefinition = "text")
    private String enfermedades;

    @Column(name = "medicamentos", columnDefinition = "text")
    private String medicamentos;

    @Column(name = "correo", length = 255)
    private String correo;

    @Column(name = "direccion", length = 255)
    private String direccion;

    @Column(name = "telefono", length = 255)
    private String telefono;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Integer getUsuarioId() { return usuario == null ? null : usuario.getId(); }

    public String getNombre() { return usuario == null ? null : usuario.getNombres(); }

    public String getApellido() { return usuario == null ? null : usuario.getApellidos(); }

    public String getCodigoMined() { return codigoMined; }
    public void setCodigoMined(String codigoMined) { this.codigoMined = codigoMined; }

    public String getColegioProcedencia() { return colegioProcedencia; }
    public void setColegioProcedencia(String colegioProcedencia) { this.colegioProcedencia = colegioProcedencia; }

    public String getNecesidadEspecial() { return necesidadEspecial; }
    public void setNecesidadEspecial(String necesidadEspecial) { this.necesidadEspecial = necesidadEspecial; }

    public LocalDate getFechaIngreso() { return fechaIngreso; }
    public void setFechaIngreso(LocalDate fechaIngreso) { this.fechaIngreso = fechaIngreso; }

    public String getTransporte() { return transporte; }
    public void setTransporte(String transporte) { this.transporte = transporte; }

    public String getAlergias() { return alergias; }
    public void setAlergias(String alergias) { this.alergias = alergias; }

    public String getEnfermedades() { return enfermedades; }
    public void setEnfermedades(String enfermedades) { this.enfermedades = enfermedades; }

    public String getMedicamentos() { return medicamentos; }
    public void setMedicamentos(String medicamentos) { this.medicamentos = medicamentos; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
}

package com.unmrma.escolar.dtos.alumno;

import java.time.LocalDate;

/**
 * DTO de respuesta para un expediente de alumno. Expone solo los datos
 * necesarios para la vista, sin exponer credenciales ni datos sensibles del
 * usuario vinculado (password, rol interno, etc.).
 */
public class AlumnoRespuesta {

    private Integer id;
    private Integer idUsuario;
    private String nombre;
    private String apellido;
    private String codigoMined;
    private String colegioProcedencia;
    private String necesidadEspecial;
    private LocalDate fechaIngreso;
    private String transporte;
    private String alergias;
    private String enfermedades;
    private String medicamentos;
    private String direccion;
    private String telefono;
    private String correo;
    private String estado;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

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

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}

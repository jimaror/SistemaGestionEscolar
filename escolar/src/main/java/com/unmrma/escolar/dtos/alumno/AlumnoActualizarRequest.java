package com.unmrma.escolar.dtos.alumno;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * DTO de solicitud para actualizar un expediente de alumno. No incluye
 * idUsuario porque no se puede cambiar el usuario vinculado a un alumno
 * existente. Todos los campos son opcionales para permitir actualizaciones
 * parciales, con limites de tamano para evitar mass assignment.
 */
public class AlumnoActualizarRequest {

    @Size(max = 20, message = "El codigo Mined no puede exceder 20 caracteres")
    private String codigoMined;

    @Size(max = 120, message = "El colegio de procedencia no puede exceder 120 caracteres")
    private String colegioProcedencia;

    @Size(max = 255, message = "La necesidad especial no puede exceder 255 caracteres")
    private String necesidadEspecial;

    private LocalDate fechaIngreso;

    @Size(max = 30, message = "El transporte no puede exceder 30 caracteres")
    private String transporte;

    @Size(max = 1000, message = "Las alergias no pueden exceder 1000 caracteres")
    private String alergias;

    @Size(max = 1000, message = "Las enfermedades no pueden exceder 1000 caracteres")
    private String enfermedades;

    @Size(max = 1000, message = "Los medicamentos no pueden exceder 1000 caracteres")
    private String medicamentos;

    @Size(max = 255, message = "El correo no puede exceder 255 caracteres")
    private String correo;

    @Size(max = 255, message = "La direccion no puede exceder 255 caracteres")
    private String direccion;

    @Size(max = 255, message = "El telefono no puede exceder 255 caracteres")
    private String telefono;

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

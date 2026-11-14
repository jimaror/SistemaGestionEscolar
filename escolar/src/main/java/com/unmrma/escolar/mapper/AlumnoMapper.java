package com.unmrma.escolar.mapper;

import com.unmrma.escolar.dtos.alumno.AlumnoActualizarRequest;
import com.unmrma.escolar.dtos.alumno.AlumnoCrearRequest;
import com.unmrma.escolar.dtos.alumno.AlumnoRespuesta;
import com.unmrma.escolar.modelo.Alumno;
import com.unmrma.escolar.modelo.Usuario;
import org.springframework.stereotype.Component;

@Component
public class AlumnoMapper {

    public Alumno aEntidad(AlumnoCrearRequest solicitud, Usuario usuario) {
        Alumno alumno = new Alumno();
        alumno.setUsuario(usuario);
        aplicar(solicitud, alumno);
        return alumno;
    }

    /**
     * Aplica los datos de creacion a una entidad Alumno. Se usa tanto para
     * crear como para actualizar, pero solo los campos que no son sensibles
     * (no se cambia el usuario vinculado).
     */
    public void aplicar(AlumnoCrearRequest solicitud, Alumno alumno) {
        alumno.setCodigoMined(solicitud.getCodigoMined());
        alumno.setColegioProcedencia(solicitud.getColegioProcedencia());
        alumno.setNecesidadEspecial(solicitud.getNecesidadEspecial());
        alumno.setFechaIngreso(solicitud.getFechaIngreso());
        alumno.setTransporte(solicitud.getTransporte());
        alumno.setAlergias(solicitud.getAlergias());
        alumno.setEnfermedades(solicitud.getEnfermedades());
        alumno.setMedicamentos(solicitud.getMedicamentos());
        alumno.setCorreo(solicitud.getCorreo());
        alumno.setDireccion(solicitud.getDireccion());
        alumno.setTelefono(solicitud.getTelefono());
    }

    /**
     * Aplica los datos de actualizacion a una entidad Alumno. No toca
     * idUsuario ni el objeto Usuario vinculado.
     */
    public void aplicar(AlumnoActualizarRequest solicitud, Alumno alumno) {
        if (solicitud.getCodigoMined() != null) {
            alumno.setCodigoMined(solicitud.getCodigoMined());
        }
        if (solicitud.getColegioProcedencia() != null) {
            alumno.setColegioProcedencia(solicitud.getColegioProcedencia());
        }
        if (solicitud.getNecesidadEspecial() != null) {
            alumno.setNecesidadEspecial(solicitud.getNecesidadEspecial());
        }
        if (solicitud.getFechaIngreso() != null) {
            alumno.setFechaIngreso(solicitud.getFechaIngreso());
        }
        if (solicitud.getTransporte() != null) {
            alumno.setTransporte(solicitud.getTransporte());
        }
        if (solicitud.getAlergias() != null) {
            alumno.setAlergias(solicitud.getAlergias());
        }
        if (solicitud.getEnfermedades() != null) {
            alumno.setEnfermedades(solicitud.getEnfermedades());
        }
        if (solicitud.getMedicamentos() != null) {
            alumno.setMedicamentos(solicitud.getMedicamentos());
        }
        if (solicitud.getCorreo() != null) {
            alumno.setCorreo(solicitud.getCorreo());
        }
        if (solicitud.getDireccion() != null) {
            alumno.setDireccion(solicitud.getDireccion());
        }
        if (solicitud.getTelefono() != null) {
            alumno.setTelefono(solicitud.getTelefono());
        }
    }

    public AlumnoRespuesta aRespuesta(Alumno alumno) {
        AlumnoRespuesta respuesta = new AlumnoRespuesta();
        respuesta.setId(alumno.getId());
        respuesta.setIdUsuario(alumno.getUsuarioId());
        respuesta.setNombre(alumno.getNombre());
        respuesta.setApellido(alumno.getApellido());
        respuesta.setCodigoMined(alumno.getCodigoMined());
        respuesta.setColegioProcedencia(alumno.getColegioProcedencia());
        respuesta.setNecesidadEspecial(alumno.getNecesidadEspecial());
        respuesta.setFechaIngreso(alumno.getFechaIngreso());
        respuesta.setTransporte(alumno.getTransporte());
        respuesta.setAlergias(alumno.getAlergias());
        respuesta.setEnfermedades(alumno.getEnfermedades());
        respuesta.setMedicamentos(alumno.getMedicamentos());
        respuesta.setDireccion(alumno.getDireccion());
        respuesta.setTelefono(alumno.getTelefono());
        respuesta.setCorreo(alumno.getCorreo() != null
                ? alumno.getCorreo()
                : alumno.getUsuario() == null ? null : alumno.getUsuario().getEmail());
        respuesta.setEstado(alumno.getUsuario() == null ? null : alumno.getUsuario().getEstado());
        return respuesta;
    }
}

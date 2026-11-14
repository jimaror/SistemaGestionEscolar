package com.unmrma.escolar.mapper;

import com.unmrma.escolar.dtos.asistencia.AsistenciaActualizarRequest;
import com.unmrma.escolar.dtos.asistencia.AsistenciaCrearRequest;
import com.unmrma.escolar.dtos.asistencia.AsistenciaRespuesta;
import com.unmrma.escolar.modelo.Asistencia;
import org.springframework.stereotype.Component;

@Component
public class AsistenciaMapper {

    public Asistencia aEntidad(AsistenciaCrearRequest solicitud) {
        Asistencia entidad = new Asistencia();
        aplicar(solicitud, entidad);
        return entidad;
    }

    public void aplicar(AsistenciaCrearRequest solicitud, Asistencia entidad) {
        entidad.setMatriculaId(solicitud.getMatriculaId());
        entidad.setAsignacionDocenteId(solicitud.getAsignacionDocenteId());
        entidad.setFecha(solicitud.getFecha());
        entidad.setEstado(solicitud.getEstado());
        entidad.setObservacion(solicitud.getObservacion());
    }

    public void aplicar(AsistenciaActualizarRequest solicitud, Asistencia entidad) {
        if (solicitud.getFecha() != null) {
            entidad.setFecha(solicitud.getFecha());
        }
        if (solicitud.getEstado() != null) {
            entidad.setEstado(solicitud.getEstado());
        }
        if (solicitud.getObservacion() != null) {
            entidad.setObservacion(solicitud.getObservacion());
        }
    }

    public AsistenciaRespuesta aRespuesta(Asistencia entidad) {
        AsistenciaRespuesta respuesta = new AsistenciaRespuesta();
        respuesta.setId(entidad.getId());
        respuesta.setMatriculaId(entidad.getMatriculaId());
        respuesta.setAsignacionDocenteId(entidad.getAsignacionDocenteId());
        respuesta.setFecha(entidad.getFecha());
        respuesta.setEstado(entidad.getEstado());
        respuesta.setObservacion(entidad.getObservacion());
        respuesta.setRegistradoPorId(entidad.getRegistradoPorId());
        respuesta.setFechaRegistro(entidad.getFechaRegistro());
        return respuesta;
    }
}

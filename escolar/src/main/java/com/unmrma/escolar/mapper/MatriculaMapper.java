package com.unmrma.escolar.mapper;

import com.unmrma.escolar.dtos.matricula.MatriculaActualizarRequest;
import com.unmrma.escolar.dtos.matricula.MatriculaCrearRequest;
import com.unmrma.escolar.dtos.matricula.MatriculaRespuesta;
import com.unmrma.escolar.modelo.Matricula;
import org.springframework.stereotype.Component;

@Component
public class MatriculaMapper {

    public Matricula aEntidad(MatriculaCrearRequest solicitud) {
        Matricula entidad = new Matricula();
        aplicar(solicitud, entidad);
        return entidad;
    }

    public void aplicar(MatriculaCrearRequest solicitud, Matricula entidad) {
        entidad.setAlumnoId(solicitud.getAlumnoId());
        entidad.setSeccionId(solicitud.getSeccionId());
        entidad.setAnioEscolarId(solicitud.getAnioEscolarId());
        if (solicitud.getFechaMatricula() != null) {
            entidad.setFechaMatricula(solicitud.getFechaMatricula());
        }
        if (solicitud.getEstado() != null) {
            entidad.setEstado(solicitud.getEstado());
        }
        if (solicitud.getObservaciones() != null) {
            entidad.setObservaciones(solicitud.getObservaciones());
        }
    }

    public void aplicar(MatriculaActualizarRequest solicitud, Matricula entidad) {
        if (solicitud.getObservaciones() != null) {
            entidad.setObservaciones(solicitud.getObservaciones());
        }
        if (solicitud.getEstado() != null) {
            entidad.setEstado(solicitud.getEstado());
        }
    }

    public MatriculaRespuesta aRespuesta(Matricula entidad) {
        MatriculaRespuesta respuesta = new MatriculaRespuesta();
        respuesta.setId(entidad.getId());
        respuesta.setAlumnoId(entidad.getAlumnoId());
        respuesta.setSeccionId(entidad.getSeccionId());
        respuesta.setAnioEscolarId(entidad.getAnioEscolarId());
        respuesta.setFechaMatricula(entidad.getFechaMatricula());
        respuesta.setEstado(entidad.getEstado());
        respuesta.setObservaciones(entidad.getObservaciones());
        return respuesta;
    }
}

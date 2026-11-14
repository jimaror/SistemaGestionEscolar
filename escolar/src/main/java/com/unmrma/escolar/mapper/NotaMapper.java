package com.unmrma.escolar.mapper;

import com.unmrma.escolar.dtos.nota.NotaActualizarRequest;
import com.unmrma.escolar.dtos.nota.NotaCrearRequest;
import com.unmrma.escolar.dtos.nota.NotaRespuesta;
import com.unmrma.escolar.modelo.Evaluacion;
import com.unmrma.escolar.modelo.Matricula;
import com.unmrma.escolar.modelo.Nota;
import org.springframework.stereotype.Component;

@Component
public class NotaMapper {

    public Nota aEntidad(NotaCrearRequest solicitud) {
        Nota entidad = new Nota();
        aplicar(solicitud, entidad);
        return entidad;
    }

    public void aplicar(NotaCrearRequest solicitud, Nota entidad) {
        if (solicitud.getMatriculaId() != null) {
            Matricula m = new Matricula();
            m.setId(solicitud.getMatriculaId());
            entidad.setMatricula(m);
        }
        if (solicitud.getEvaluacionId() != null) {
            Evaluacion e = new Evaluacion();
            e.setId(solicitud.getEvaluacionId());
            entidad.setEvaluacion(e);
        }
        entidad.setCalificacion(solicitud.getCalificacion());
        entidad.setPeriodo(solicitud.getPeriodo());
        entidad.setObservacion(solicitud.getObservacion());
    }

    public void aplicar(NotaActualizarRequest solicitud, Nota entidad) {
        if (solicitud.getCalificacion() != null) {
            entidad.setCalificacion(solicitud.getCalificacion());
        }
        if (solicitud.getPeriodo() != null) {
            entidad.setPeriodo(solicitud.getPeriodo());
        }
        if (solicitud.getObservacion() != null) {
            entidad.setObservacion(solicitud.getObservacion());
        }
    }

    public NotaRespuesta aRespuesta(Nota entidad) {
        NotaRespuesta respuesta = new NotaRespuesta();
        respuesta.setId(entidad.getId());
        respuesta.setCalificacion(entidad.getCalificacion());
        respuesta.setPeriodo(entidad.getPeriodo());
        respuesta.setMatriculaId(entidad.getMatricula() != null ? entidad.getMatricula().getId() : null);
        respuesta.setEvaluacionId(entidad.getEvaluacion() != null ? entidad.getEvaluacion().getId() : null);
        respuesta.setObservacion(entidad.getObservacion());
        respuesta.setRegistradoPorId(entidad.getRegistradoPor());
        return respuesta;
    }
}

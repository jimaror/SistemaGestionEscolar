package com.unmrma.escolar.mapper;

import com.unmrma.escolar.dtos.evaluacion.EvaluacionActualizarRequest;
import com.unmrma.escolar.dtos.evaluacion.EvaluacionCrearRequest;
import com.unmrma.escolar.dtos.evaluacion.EvaluacionRespuesta;
import com.unmrma.escolar.modelo.Evaluacion;
import org.springframework.stereotype.Component;

@Component
public class EvaluacionMapper {

    public Evaluacion aEntidad(EvaluacionCrearRequest solicitud) {
        Evaluacion entidad = new Evaluacion();
        aplicar(solicitud, entidad);
        return entidad;
    }

    public void aplicar(EvaluacionCrearRequest solicitud, Evaluacion entidad) {
        entidad.setAsignacionDocenteId(solicitud.getAsignacionDocenteId());
        entidad.setTitulo(solicitud.getTitulo());
        entidad.setDescripcion(solicitud.getDescripcion());
        entidad.setTipo(solicitud.getTipo());
        entidad.setPeriodo(solicitud.getPeriodo());
        entidad.setPuntajeMaximo(solicitud.getPuntajeMaximo());
        if (solicitud.getFechaPublicacion() != null) {
            entidad.setFechaPublicacion(solicitud.getFechaPublicacion());
        }
        if (solicitud.getFechaCierre() != null) {
            entidad.setFechaCierre(solicitud.getFechaCierre());
        }
        if (solicitud.getEstado() != null) {
            entidad.setEstado(solicitud.getEstado());
        }
    }

    public void aplicar(EvaluacionActualizarRequest solicitud, Evaluacion entidad) {
        if (solicitud.getTitulo() != null) {
            entidad.setTitulo(solicitud.getTitulo());
        }
        if (solicitud.getDescripcion() != null) {
            entidad.setDescripcion(solicitud.getDescripcion());
        }
        if (solicitud.getTipo() != null) {
            entidad.setTipo(solicitud.getTipo());
        }
        if (solicitud.getPeriodo() != null) {
            entidad.setPeriodo(solicitud.getPeriodo());
        }
        if (solicitud.getPuntajeMaximo() != null) {
            entidad.setPuntajeMaximo(solicitud.getPuntajeMaximo());
        }
        if (solicitud.getFechaPublicacion() != null) {
            entidad.setFechaPublicacion(solicitud.getFechaPublicacion());
        }
        if (solicitud.getFechaCierre() != null) {
            entidad.setFechaCierre(solicitud.getFechaCierre());
        }
        if (solicitud.getEstado() != null) {
            entidad.setEstado(solicitud.getEstado());
        }
    }

    public EvaluacionRespuesta aRespuesta(Evaluacion entidad) {
        EvaluacionRespuesta respuesta = new EvaluacionRespuesta();
        respuesta.setId(entidad.getId());
        respuesta.setAsignacionDocenteId(entidad.getAsignacionDocenteId());
        respuesta.setTitulo(entidad.getTitulo());
        respuesta.setDescripcion(entidad.getDescripcion());
        respuesta.setTipo(entidad.getTipo());
        respuesta.setPeriodo(entidad.getPeriodo());
        respuesta.setPuntajeMaximo(entidad.getPuntajeMaximo());
        respuesta.setFechaPublicacion(entidad.getFechaPublicacion());
        respuesta.setFechaCierre(entidad.getFechaCierre());
        respuesta.setEstado(entidad.getEstado());
        return respuesta;
    }
}

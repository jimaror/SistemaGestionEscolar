package com.unmrma.escolar.mapper;

import com.unmrma.escolar.dtos.reunion.ReunionActualizarRequest;
import com.unmrma.escolar.dtos.reunion.ReunionCrearRequest;
import com.unmrma.escolar.dtos.reunion.ReunionRespuesta;
import com.unmrma.escolar.modelo.Reunion;
import org.springframework.stereotype.Component;

@Component
public class ReunionMapper {

    public Reunion aEntidad(ReunionCrearRequest solicitud) {
        Reunion entidad = new Reunion();
        aplicar(solicitud, entidad);
        return entidad;
    }

    public void aplicar(ReunionCrearRequest solicitud, Reunion entidad) {
        entidad.setAsignacionDocenteId(solicitud.getAsignacionDocenteId());
        entidad.setTitulo(solicitud.getTitulo());
        entidad.setDescripcion(solicitud.getDescripcion());
        entidad.setEnlace(solicitud.getEnlace());
        entidad.setFechaHora(solicitud.getFechaHora());
        entidad.setDuracionMinutos(solicitud.getDuracionMinutos());
        if (solicitud.getEstado() != null) {
            entidad.setEstado(solicitud.getEstado());
        }
    }

    public void aplicar(ReunionActualizarRequest solicitud, Reunion entidad) {
        if (solicitud.getTitulo() != null) {
            entidad.setTitulo(solicitud.getTitulo());
        }
        if (solicitud.getDescripcion() != null) {
            entidad.setDescripcion(solicitud.getDescripcion());
        }
        if (solicitud.getEnlace() != null) {
            entidad.setEnlace(solicitud.getEnlace());
        }
        if (solicitud.getFechaHora() != null) {
            entidad.setFechaHora(solicitud.getFechaHora());
        }
        if (solicitud.getDuracionMinutos() != null) {
            entidad.setDuracionMinutos(solicitud.getDuracionMinutos());
        }
        if (solicitud.getEstado() != null) {
            entidad.setEstado(solicitud.getEstado());
        }
    }

    public ReunionRespuesta aRespuesta(Reunion entidad) {
        ReunionRespuesta respuesta = new ReunionRespuesta();
        respuesta.setId(entidad.getId());
        respuesta.setAsignacionDocenteId(entidad.getAsignacionDocenteId());
        respuesta.setTitulo(entidad.getTitulo());
        respuesta.setDescripcion(entidad.getDescripcion());
        respuesta.setEnlace(entidad.getEnlace());
        respuesta.setFechaHora(entidad.getFechaHora());
        respuesta.setDuracionMinutos(entidad.getDuracionMinutos());
        respuesta.setEstado(entidad.getEstado());
        respuesta.setCreadaPorId(entidad.getCreadaPorId());
        respuesta.setFechaCreacion(entidad.getFechaCreacion());
        return respuesta;
    }
}

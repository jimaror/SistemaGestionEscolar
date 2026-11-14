package com.unmrma.escolar.mapper;

import com.unmrma.escolar.dtos.asignaciondocente.AsignacionDocenteActualizarRequest;
import com.unmrma.escolar.dtos.asignaciondocente.AsignacionDocenteCrearRequest;
import com.unmrma.escolar.dtos.asignaciondocente.AsignacionDocenteRespuesta;
import com.unmrma.escolar.modelo.AsignacionDocente;
import org.springframework.stereotype.Component;

@Component
public class AsignacionDocenteMapper {

    public AsignacionDocente aEntidad(AsignacionDocenteCrearRequest solicitud) {
        AsignacionDocente entidad = new AsignacionDocente();
        aplicar(solicitud, entidad);
        return entidad;
    }

    public void aplicar(AsignacionDocenteCrearRequest solicitud, AsignacionDocente entidad) {
        entidad.setAsignaturaId(solicitud.getAsignaturaId());
        entidad.setSeccionId(solicitud.getSeccionId());
        entidad.setMaestroId(solicitud.getMaestroId());
        if (solicitud.getHorasSemanales() != null) {
            entidad.setHorasSemanales(solicitud.getHorasSemanales());
        }
    }

    public void aplicar(AsignacionDocenteActualizarRequest solicitud, AsignacionDocente entidad) {
        if (solicitud.getHorasSemanales() != null) {
            entidad.setHorasSemanales(solicitud.getHorasSemanales());
        }
        if (solicitud.getEstado() != null) {
            entidad.setEstado(solicitud.getEstado());
        }
    }

    public AsignacionDocenteRespuesta aRespuesta(AsignacionDocente entidad) {
        AsignacionDocenteRespuesta respuesta = new AsignacionDocenteRespuesta();
        respuesta.setId(entidad.getId());
        respuesta.setAsignaturaId(entidad.getAsignaturaId());
        respuesta.setSeccionId(entidad.getSeccionId());
        respuesta.setMaestroId(entidad.getMaestroId());
        respuesta.setHorasSemanales(entidad.getHorasSemanales());
        respuesta.setEstado(entidad.getEstado());
        return respuesta;
    }
}

package com.unmrma.escolar.mapper;

import com.unmrma.escolar.dtos.justificacionausencia.JustificacionAusenciaActualizarRequest;
import com.unmrma.escolar.dtos.justificacionausencia.JustificacionAusenciaCrearRequest;
import com.unmrma.escolar.dtos.justificacionausencia.JustificacionAusenciaRespuesta;
import com.unmrma.escolar.modelo.JustificacionAusencia;
import org.springframework.stereotype.Component;

@Component
public class JustificacionAusenciaMapper {

    public JustificacionAusencia aEntidad(JustificacionAusenciaCrearRequest solicitud) {
        JustificacionAusencia entidad = new JustificacionAusencia();
        aplicar(solicitud, entidad);
        return entidad;
    }

    public void aplicar(JustificacionAusenciaCrearRequest solicitud, JustificacionAusencia entidad) {
        entidad.setAsistenciaId(solicitud.getAsistenciaId());
        entidad.setMotivo(solicitud.getMotivo());
        entidad.setFechaDesde(solicitud.getFechaDesde());
        entidad.setFechaHasta(solicitud.getFechaHasta());
        entidad.setDocumentoAdjunto(solicitud.getDocumentoAdjunto());
    }

    public void aplicar(JustificacionAusenciaActualizarRequest solicitud, JustificacionAusencia entidad) {
        if (solicitud.getMotivo() != null) {
            entidad.setMotivo(solicitud.getMotivo());
        }
        if (solicitud.getFechaDesde() != null) {
            entidad.setFechaDesde(solicitud.getFechaDesde());
        }
        if (solicitud.getFechaHasta() != null) {
            entidad.setFechaHasta(solicitud.getFechaHasta());
        }
        if (solicitud.getDocumentoAdjunto() != null) {
            entidad.setDocumentoAdjunto(solicitud.getDocumentoAdjunto());
        }
    }

    public JustificacionAusenciaRespuesta aRespuesta(JustificacionAusencia entidad) {
        JustificacionAusenciaRespuesta respuesta = new JustificacionAusenciaRespuesta();
        respuesta.setId(entidad.getId());
        respuesta.setAsistenciaId(entidad.getAsistenciaId());
        respuesta.setMotivo(entidad.getMotivo());
        respuesta.setFechaDesde(entidad.getFechaDesde());
        respuesta.setFechaHasta(entidad.getFechaHasta());
        respuesta.setDocumentoAdjunto(entidad.getDocumentoAdjunto());
        respuesta.setEstado(entidad.getEstado());
        respuesta.setAprobadoPorId(entidad.getAprobadoPorId());
        respuesta.setFechaAprobacion(entidad.getFechaAprobacion());
        respuesta.setObservacionAprobacion(entidad.getObservacionAprobacion());
        return respuesta;
    }
}

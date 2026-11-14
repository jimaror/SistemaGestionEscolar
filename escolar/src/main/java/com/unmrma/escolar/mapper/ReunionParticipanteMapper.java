package com.unmrma.escolar.mapper;

import com.unmrma.escolar.dtos.reunionparticipante.ReunionParticipanteActualizarRequest;
import com.unmrma.escolar.dtos.reunionparticipante.ReunionParticipanteCrearRequest;
import com.unmrma.escolar.dtos.reunionparticipante.ReunionParticipanteRespuesta;
import com.unmrma.escolar.modelo.ReunionParticipante;
import org.springframework.stereotype.Component;

@Component
public class ReunionParticipanteMapper {

    public ReunionParticipante aEntidad(ReunionParticipanteCrearRequest solicitud) {
        ReunionParticipante entidad = new ReunionParticipante();
        aplicar(solicitud, entidad);
        return entidad;
    }

    public void aplicar(ReunionParticipanteCrearRequest solicitud, ReunionParticipante entidad) {
        entidad.setReunionId(solicitud.getReunionId());
        entidad.setUsuarioId(solicitud.getUsuarioId());
        entidad.setConfirmado(solicitud.getConfirmado());
        entidad.setAsistio(solicitud.getAsistio());
        entidad.setObservacion(solicitud.getObservacion());
    }

    public void aplicar(ReunionParticipanteActualizarRequest solicitud, ReunionParticipante entidad) {
        if (solicitud.getConfirmado() != null) {
            entidad.setConfirmado(solicitud.getConfirmado());
        }
        if (solicitud.getAsistio() != null) {
            entidad.setAsistio(solicitud.getAsistio());
        }
        if (solicitud.getObservacion() != null) {
            entidad.setObservacion(solicitud.getObservacion());
        }
    }

    public ReunionParticipanteRespuesta aRespuesta(ReunionParticipante entidad) {
        ReunionParticipanteRespuesta respuesta = new ReunionParticipanteRespuesta();
        respuesta.setId(entidad.getId());
        respuesta.setReunionId(entidad.getReunionId());
        respuesta.setUsuarioId(entidad.getUsuarioId());
        respuesta.setConfirmado(entidad.getConfirmado());
        respuesta.setAsistio(entidad.getAsistio());
        respuesta.setObservacion(entidad.getObservacion());
        return respuesta;
    }
}

package com.unmrma.escolar.mapper;

import com.unmrma.escolar.dtos.conversacionparticipante.ConversacionParticipanteActualizarRequest;
import com.unmrma.escolar.dtos.conversacionparticipante.ConversacionParticipanteCrearRequest;
import com.unmrma.escolar.dtos.conversacionparticipante.ConversacionParticipanteRespuesta;
import com.unmrma.escolar.modelo.ConversacionParticipante;
import org.springframework.stereotype.Component;

@Component
public class ConversacionParticipanteMapper {

    public ConversacionParticipante aEntidad(ConversacionParticipanteCrearRequest solicitud) {
        ConversacionParticipante entidad = new ConversacionParticipante();
        aplicar(solicitud, entidad);
        return entidad;
    }

    public void aplicar(ConversacionParticipanteCrearRequest solicitud, ConversacionParticipante entidad) {
        entidad.setConversacionId(solicitud.getConversacionId());
        entidad.setUsuarioId(solicitud.getUsuarioId());
        entidad.setRolEnConversacion(solicitud.getRolEnConversacion());
    }

    public void aplicar(ConversacionParticipanteActualizarRequest solicitud, ConversacionParticipante entidad) {
        if (solicitud.getRolEnConversacion() != null) {
            entidad.setRolEnConversacion(solicitud.getRolEnConversacion());
        }
        if (solicitud.getActivo() != null) {
            entidad.setActivo(solicitud.getActivo());
        }
    }

    public ConversacionParticipanteRespuesta aRespuesta(ConversacionParticipante entidad) {
        ConversacionParticipanteRespuesta respuesta = new ConversacionParticipanteRespuesta();
        respuesta.setId(entidad.getId());
        respuesta.setConversacionId(entidad.getConversacionId());
        respuesta.setUsuarioId(entidad.getUsuarioId());
        respuesta.setRolEnConversacion(entidad.getRolEnConversacion());
        respuesta.setUsuarioNombre(
                entidad.getUsuario() == null ? null : entidad.getUsuario().getNombres());
        respuesta.setUsuarioApellidos(
                entidad.getUsuario() == null ? null : entidad.getUsuario().getApellidos());
        respuesta.setUsuarioRol(
                entidad.getUsuario() == null ? null : entidad.getUsuario().getRol());
        respuesta.setFechaUltimaLectura(entidad.getFechaUltimaLectura());
        respuesta.setActivo(entidad.getActivo());
        return respuesta;
    }
}

package com.unmrma.escolar.mapper;

import com.unmrma.escolar.dtos.conversacion.ConversacionActualizarRequest;
import com.unmrma.escolar.dtos.conversacion.ConversacionCrearRequest;
import com.unmrma.escolar.dtos.conversacion.ConversacionRespuesta;
import com.unmrma.escolar.modelo.Conversacion;
import org.springframework.stereotype.Component;

@Component
public class ConversacionMapper {

    public Conversacion aEntidad(ConversacionCrearRequest solicitud) {
        Conversacion entidad = new Conversacion();
        aplicar(solicitud, entidad);
        return entidad;
    }

    public void aplicar(ConversacionCrearRequest solicitud, Conversacion entidad) {
        entidad.setTitulo(solicitud.getTitulo());
        entidad.setTipo(solicitud.getTipo());
        if (solicitud.getEstado() != null) {
            entidad.setEstado(solicitud.getEstado());
        }
    }

    public void aplicar(ConversacionActualizarRequest solicitud, Conversacion entidad) {
        if (solicitud.getTitulo() != null) {
            entidad.setTitulo(solicitud.getTitulo());
        }
        if (solicitud.getTipo() != null) {
            entidad.setTipo(solicitud.getTipo());
        }
        if (solicitud.getEstado() != null) {
            entidad.setEstado(solicitud.getEstado());
        }
    }

    public ConversacionRespuesta aRespuesta(Conversacion entidad) {
        ConversacionRespuesta respuesta = new ConversacionRespuesta();
        respuesta.setId(entidad.getId());
        respuesta.setTitulo(entidad.getTitulo());
        respuesta.setTipo(entidad.getTipo());
        respuesta.setCreadaPorId(entidad.getCreadaPorId());
        respuesta.setFechaCreacion(entidad.getFechaCreacion());
        respuesta.setEstado(entidad.getEstado());
        return respuesta;
    }
}

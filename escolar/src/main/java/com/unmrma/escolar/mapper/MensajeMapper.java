package com.unmrma.escolar.mapper;

import com.unmrma.escolar.dtos.mensaje.MensajeActualizarRequest;
import com.unmrma.escolar.dtos.mensaje.MensajeCrearRequest;
import com.unmrma.escolar.dtos.mensaje.MensajeRespuesta;
import com.unmrma.escolar.modelo.Mensaje;
import org.springframework.stereotype.Component;

@Component
public class MensajeMapper {

    public Mensaje aEntidad(MensajeCrearRequest solicitud) {
        Mensaje entidad = new Mensaje();
        aplicar(solicitud, entidad);
        return entidad;
    }

    public void aplicar(MensajeCrearRequest solicitud, Mensaje entidad) {
        entidad.setConversacionId(solicitud.getConversacionId());
        entidad.setContenido(solicitud.getContenido());
    }

    public void aplicar(MensajeActualizarRequest solicitud, Mensaje entidad) {
        if (solicitud.getContenido() != null) {
            entidad.setContenido(solicitud.getContenido());
        }
    }

    public MensajeRespuesta aRespuesta(Mensaje entidad) {
        MensajeRespuesta respuesta = new MensajeRespuesta();
        respuesta.setId(entidad.getId());
        respuesta.setConversacionId(entidad.getConversacionId());
        respuesta.setRemitenteId(entidad.getRemitenteId());
        respuesta.setContenido(entidad.getContenido());
        respuesta.setFechaEnvio(entidad.getFechaEnvio());
        respuesta.setLeido(entidad.getLeido());
        return respuesta;
    }
}

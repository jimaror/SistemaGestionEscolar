package com.unmrma.escolar.mapper;

import com.unmrma.escolar.dtos.grado.GradoActualizarRequest;
import com.unmrma.escolar.dtos.grado.GradoCrearRequest;
import com.unmrma.escolar.dtos.grado.GradoRespuesta;
import com.unmrma.escolar.modelo.Grado;
import org.springframework.stereotype.Component;

@Component
public class GradoMapper {

    public Grado aEntidad(GradoCrearRequest solicitud) {
        Grado entidad = new Grado();
        aplicar(solicitud, entidad);
        return entidad;
    }

    public void aplicar(GradoCrearRequest solicitud, Grado entidad) {
        entidad.setNombre(solicitud.getNombre());
        entidad.setNivel(solicitud.getNivel());
        entidad.setOrden(solicitud.getOrden());
    }

    public void aplicar(GradoActualizarRequest solicitud, Grado entidad) {
        if (solicitud.getNombre() != null) {
            entidad.setNombre(solicitud.getNombre());
        }
        if (solicitud.getNivel() != null) {
            entidad.setNivel(solicitud.getNivel());
        }
        if (solicitud.getOrden() != null) {
            entidad.setOrden(solicitud.getOrden());
        }
    }

    public GradoRespuesta aRespuesta(Grado entidad) {
        GradoRespuesta respuesta = new GradoRespuesta();
        respuesta.setId(entidad.getId());
        respuesta.setNombre(entidad.getNombre());
        respuesta.setNivel(entidad.getNivel());
        respuesta.setOrden(entidad.getOrden());
        return respuesta;
    }
}

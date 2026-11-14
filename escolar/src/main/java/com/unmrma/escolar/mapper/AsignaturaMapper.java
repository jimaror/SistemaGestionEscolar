package com.unmrma.escolar.mapper;

import com.unmrma.escolar.dtos.asignatura.AsignaturaActualizarRequest;
import com.unmrma.escolar.dtos.asignatura.AsignaturaCrearRequest;
import com.unmrma.escolar.dtos.asignatura.AsignaturaRespuesta;
import com.unmrma.escolar.modelo.Asignatura;
import org.springframework.stereotype.Component;

@Component
public class AsignaturaMapper {

    public Asignatura aEntidad(AsignaturaCrearRequest solicitud) {
        Asignatura entidad = new Asignatura();
        aplicar(solicitud, entidad);
        return entidad;
    }

    public void aplicar(AsignaturaCrearRequest solicitud, Asignatura entidad) {
        entidad.setNombre(solicitud.getNombre());
        entidad.setAbreviatura(solicitud.getAbreviatura());
        entidad.setCodigo(solicitud.getCodigo());
        if (solicitud.getActivo() != null) {
            entidad.setActivo(solicitud.getActivo());
        }
    }

    public void aplicar(AsignaturaActualizarRequest solicitud, Asignatura entidad) {
        if (solicitud.getNombre() != null) {
            entidad.setNombre(solicitud.getNombre());
        }
        if (solicitud.getAbreviatura() != null) {
            entidad.setAbreviatura(solicitud.getAbreviatura());
        }
        if (solicitud.getCodigo() != null) {
            entidad.setCodigo(solicitud.getCodigo());
        }
        if (solicitud.getActivo() != null) {
            entidad.setActivo(solicitud.getActivo());
        }
    }

    public AsignaturaRespuesta aRespuesta(Asignatura entidad) {
        AsignaturaRespuesta respuesta = new AsignaturaRespuesta();
        respuesta.setId(entidad.getId());
        respuesta.setNombre(entidad.getNombre());
        respuesta.setAbreviatura(entidad.getAbreviatura());
        respuesta.setCodigo(entidad.getCodigo());
        respuesta.setActivo(entidad.getActivo());
        return respuesta;
    }
}

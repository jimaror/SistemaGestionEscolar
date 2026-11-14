package com.unmrma.escolar.mapper;

import com.unmrma.escolar.dtos.material.MaterialActualizarRequest;
import com.unmrma.escolar.dtos.material.MaterialCrearRequest;
import com.unmrma.escolar.dtos.material.MaterialRespuesta;
import com.unmrma.escolar.modelo.Material;
import org.springframework.stereotype.Component;

@Component
public class MaterialMapper {

    public Material aEntidad(MaterialCrearRequest solicitud) {
        Material entidad = new Material();
        aplicar(solicitud, entidad);
        return entidad;
    }

    public void aplicar(MaterialCrearRequest solicitud, Material entidad) {
        entidad.setAsignacionDocenteId(solicitud.getAsignacionDocenteId());
        entidad.setTitulo(solicitud.getTitulo());
        entidad.setDescripcion(solicitud.getDescripcion());
        entidad.setTipo(solicitud.getTipo());
        entidad.setRutaArchivo(solicitud.getRutaArchivo());
        if (solicitud.getVisible() != null) {
            entidad.setVisible(solicitud.getVisible());
        }
    }

    public void aplicar(MaterialActualizarRequest solicitud, Material entidad) {
        if (solicitud.getTitulo() != null) {
            entidad.setTitulo(solicitud.getTitulo());
        }
        if (solicitud.getDescripcion() != null) {
            entidad.setDescripcion(solicitud.getDescripcion());
        }
        if (solicitud.getTipo() != null) {
            entidad.setTipo(solicitud.getTipo());
        }
        if (solicitud.getRutaArchivo() != null) {
            entidad.setRutaArchivo(solicitud.getRutaArchivo());
        }
        if (solicitud.getVisible() != null) {
            entidad.setVisible(solicitud.getVisible());
        }
    }

    public MaterialRespuesta aRespuesta(Material entidad) {
        MaterialRespuesta respuesta = new MaterialRespuesta();
        respuesta.setId(entidad.getId());
        respuesta.setAsignacionDocenteId(entidad.getAsignacionDocenteId());
        respuesta.setTitulo(entidad.getTitulo());
        respuesta.setDescripcion(entidad.getDescripcion());
        respuesta.setTipo(entidad.getTipo());
        respuesta.setRutaArchivo(entidad.getRutaArchivo());
        respuesta.setFechaPublicacion(entidad.getFechaPublicacion());
        respuesta.setVisible(entidad.getVisible());
        return respuesta;
    }
}

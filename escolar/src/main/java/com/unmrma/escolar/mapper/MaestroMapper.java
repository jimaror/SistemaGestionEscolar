package com.unmrma.escolar.mapper;

import com.unmrma.escolar.dtos.maestro.MaestroActualizarRequest;
import com.unmrma.escolar.dtos.maestro.MaestroCrearRequest;
import com.unmrma.escolar.dtos.maestro.MaestroRespuesta;
import com.unmrma.escolar.modelo.Maestro;
import com.unmrma.escolar.modelo.Usuario;
import com.unmrma.escolar.repositorio.UsuarioRepository;
import org.springframework.stereotype.Component;

@Component
public class MaestroMapper {

    private final UsuarioRepository usuarioRepository;

    public MaestroMapper(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Maestro aEntidad(MaestroCrearRequest solicitud) {
        Maestro entidad = new Maestro();
        aplicar(solicitud, entidad);
        return entidad;
    }

    public void aplicar(MaestroCrearRequest solicitud, Maestro entidad) {
        if (solicitud.getIdUsuario() != null) {
            Usuario usuario = usuarioRepository.findById(solicitud.getIdUsuario())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Usuario con ID " + solicitud.getIdUsuario() + " no encontrado"));
            entidad.setUsuario(usuario);
        }
        entidad.setNumeroInss(solicitud.getNumeroInss());
        entidad.setEspecialidad(solicitud.getEspecialidad());
        entidad.setTitulo(solicitud.getTitulo());
        entidad.setFechaIngreso(solicitud.getFechaIngreso());
        entidad.setCorreo(solicitud.getCorreo());
        entidad.setTelefono(solicitud.getTelefono());
    }

    public void aplicar(MaestroActualizarRequest solicitud, Maestro entidad) {
        if (solicitud.getNumeroInss() != null) {
            entidad.setNumeroInss(solicitud.getNumeroInss());
        }
        if (solicitud.getEspecialidad() != null) {
            entidad.setEspecialidad(solicitud.getEspecialidad());
        }
        if (solicitud.getTitulo() != null) {
            entidad.setTitulo(solicitud.getTitulo());
        }
        if (solicitud.getFechaIngreso() != null) {
            entidad.setFechaIngreso(solicitud.getFechaIngreso());
        }
        if (solicitud.getCorreo() != null) {
            entidad.setCorreo(solicitud.getCorreo());
        }
        if (solicitud.getTelefono() != null) {
            entidad.setTelefono(solicitud.getTelefono());
        }
    }

    public MaestroRespuesta aRespuesta(Maestro entidad) {
        MaestroRespuesta respuesta = new MaestroRespuesta();
        respuesta.setId(entidad.getId());
        respuesta.setIdUsuario(entidad.getUsuarioId());
        respuesta.setNombre(entidad.getNombre());
        respuesta.setApellido(entidad.getApellido());
        respuesta.setNumeroInss(entidad.getNumeroInss());
        respuesta.setEspecialidad(entidad.getEspecialidad());
        respuesta.setTitulo(entidad.getTitulo());
        respuesta.setFechaIngreso(entidad.getFechaIngreso());
        respuesta.setCorreo(entidad.getCorreo());
        respuesta.setTelefono(entidad.getTelefono());
        return respuesta;
    }
}

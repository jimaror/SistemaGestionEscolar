package com.unmrma.escolar.servicio;

import com.unmrma.escolar.dtos.mensaje.DestinatarioRespuesta;
import com.unmrma.escolar.dtos.mensaje.MensajeActualizarRequest;
import com.unmrma.escolar.dtos.mensaje.MensajeCrearRequest;
import com.unmrma.escolar.dtos.mensaje.MensajeRespuesta;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.mapper.MensajeMapper;
import com.unmrma.escolar.modelo.Mensaje;
import com.unmrma.escolar.repositorio.MensajeRepository;
import com.unmrma.escolar.repositorio.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class MensajeService {

    private final MensajeRepository repositorio;
    private final MensajeMapper mapper;
    private final UsuarioRepository usuarios;

    public MensajeService(MensajeRepository repositorio,
                          MensajeMapper mapper,
                          UsuarioRepository usuarios) {
        this.repositorio = repositorio;
        this.mapper = mapper;
        this.usuarios = usuarios;
    }

    /**
     * Destinatarios disponibles para iniciar una conversacion. Se excluye la
     * propia cuenta. El rol se toma de rolId (la relacion real) porque la
     * columna legacy "rol" puede venir vacia en usuarios creados desde la API.
     * Orden: Director, Maestro, Tutor, Alumno y luego por nombre.
     */
    public List<DestinatarioRespuesta> listarDestinatarios(Integer usuarioActualId) {
        return usuarios.findAll().stream()
                .filter(u -> usuarioActualId == null || !usuarioActualId.equals(u.getId()))
                .filter(u -> u.getRolId() != null && u.getRolId() >= 1 && u.getRolId() <= 4)
                .filter(u -> u.getEstado() == null
                        || "Activo".equalsIgnoreCase(u.getEstado())
                        || "1".equals(u.getEstado()))
                .map(u -> new DestinatarioRespuesta(
                        u.getId(),
                        u.getNombres(),
                        u.getApellidos(),
                        nombreRol(u.getRolId()),
                        u.getUsername()))
                .sorted(Comparator
                        .comparingInt((DestinatarioRespuesta d) -> prioridadRol(d.rol()))
                        .thenComparing(d -> d.nombres() == null ? "" : d.nombres())
                        .thenComparing(d -> d.apellidos() == null ? "" : d.apellidos()))
                .toList();
    }

    private String nombreRol(Byte rolId) {
        if (rolId == null) return "Usuario";
        return switch (rolId) {
            case 1 -> "Director";
            case 2 -> "Maestro";
            case 3 -> "Alumno";
            case 4 -> "Tutor";
            default -> "Usuario";
        };
    }

    private int prioridadRol(String rol) {
        if (rol == null) return 9;
        return switch (rol) {
            case "Director" -> 0;
            case "Maestro" -> 1;
            case "Tutor" -> 2;
            case "Alumno" -> 3;
            default -> 9;
        };
    }

    public List<MensajeRespuesta> listarTodos() {
        return repositorio.findAll()
                .stream()
                .map(mapper::aRespuesta)
                .toList();
    }

    public Optional<MensajeRespuesta> obtenerPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta);
    }

    public MensajeRespuesta buscarPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta)
                .orElseThrow(() -> new RecursoNoEncontradoException("Mensaje con ID " + id + " no encontrado"));
    }

    public MensajeRespuesta guardar(MensajeCrearRequest solicitud, Integer remitenteId) {
        Mensaje entidad = mapper.aEntidad(solicitud);
        entidad.setRemitenteId(remitenteId);
        MensajeRespuesta respuesta = mapper.aRespuesta(repositorio.save(entidad));
        // El destinatario es quien recibe el mensaje; se fija desde la solicitud
        // validada, ya que el remitente siempre es la cuenta autenticada.
        respuesta.setDestinatarioUsuarioId(solicitud.getDestinatarioUsuarioId());
        return respuesta;
    }

    public MensajeRespuesta actualizar(Integer id,
                                       MensajeActualizarRequest solicitud) {
        return repositorio.findById(id).map(entidad -> {
            mapper.aplicar(solicitud, entidad);
            return mapper.aRespuesta(repositorio.save(entidad));
        }).orElseThrow(() -> new RecursoNoEncontradoException("Mensaje con ID " + id + " no encontrado"));
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Mensaje con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}

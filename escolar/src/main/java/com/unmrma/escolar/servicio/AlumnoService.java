package com.unmrma.escolar.servicio;

import com.unmrma.escolar.dtos.alumno.AlumnoActualizarRequest;
import com.unmrma.escolar.dtos.alumno.AlumnoCrearRequest;
import com.unmrma.escolar.dtos.alumno.AlumnoRespuesta;
import com.unmrma.escolar.mapper.AlumnoMapper;
import com.unmrma.escolar.modelo.Alumno;
import com.unmrma.escolar.modelo.Usuario;
import com.unmrma.escolar.repositorio.AlumnoRepositorio;
import com.unmrma.escolar.repositorio.UsuarioRepository;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlumnoService {

    private final AlumnoRepositorio repositorio;
    private final UsuarioRepository usuarioRepositorio;
    private final AlumnoMapper mapper;

    public AlumnoService(
            AlumnoRepositorio repositorio,
            UsuarioRepository usuarioRepositorio,
            AlumnoMapper mapper) {
        this.repositorio = repositorio;
        this.usuarioRepositorio = usuarioRepositorio;
        this.mapper = mapper;
    }

    public List<AlumnoRespuesta> listarTodos() {
        return repositorio.findAll()
                .stream()
                .map(mapper::aRespuesta)
                .toList();
    }

    public AlumnoRespuesta crear(AlumnoCrearRequest solicitud) {
        Usuario usuario = buscarUsuario(solicitud.getIdUsuario());
        Alumno entidad = mapper.aEntidad(solicitud, usuario);
        return mapper.aRespuesta(repositorio.save(entidad));
    }

    public AlumnoRespuesta buscarPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta)
                .orElseThrow(() -> new RecursoNoEncontradoException("Alumno con ID " + id + " no encontrado"));
    }

    public AlumnoRespuesta actualizar(Integer id, AlumnoActualizarRequest solicitud) {
        return repositorio.findById(id).map(entidad -> {
            mapper.aplicar(solicitud, entidad);
            return mapper.aRespuesta(repositorio.save(entidad));
        }).orElseThrow(() -> new RecursoNoEncontradoException("Alumno con ID " + id + " no encontrado"));
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Alumno con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }

    private Usuario buscarUsuario(Integer idUsuario) {
        return usuarioRepositorio.findById(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Usuario con ID " + idUsuario + " no encontrado"));
    }
}
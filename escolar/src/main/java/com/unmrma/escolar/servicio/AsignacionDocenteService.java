package com.unmrma.escolar.servicio;

import com.unmrma.escolar.dtos.asignaciondocente.AsignacionDocenteActualizarRequest;
import com.unmrma.escolar.dtos.asignaciondocente.AsignacionDocenteCrearRequest;
import com.unmrma.escolar.dtos.asignaciondocente.AsignacionDocenteRespuesta;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.mapper.AsignacionDocenteMapper;
import com.unmrma.escolar.modelo.AsignacionDocente;
import com.unmrma.escolar.repositorio.AsignacionDocenteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AsignacionDocenteService {

    private final AsignacionDocenteRepository repositorio;
    private final AsignacionDocenteMapper mapper;

    public AsignacionDocenteService(AsignacionDocenteRepository repositorio,
                                    AsignacionDocenteMapper mapper) {
        this.repositorio = repositorio;
        this.mapper = mapper;
    }

    public List<AsignacionDocenteRespuesta> listarTodos() {
        return repositorio.findAll()
                .stream()
                .map(mapper::aRespuesta)
                .toList();
    }

    public Optional<AsignacionDocenteRespuesta> obtenerPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta);
    }

    public AsignacionDocenteRespuesta buscarPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Asignacion docente con ID " + id + " no encontrado"));
    }

    public AsignacionDocenteRespuesta guardar(AsignacionDocenteCrearRequest solicitud) {
        AsignacionDocente entidad = mapper.aEntidad(solicitud);
        return mapper.aRespuesta(repositorio.save(entidad));
    }

    public AsignacionDocenteRespuesta actualizar(Integer id,
                                                 AsignacionDocenteActualizarRequest solicitud) {
        return repositorio.findById(id).map(entidad -> {
            mapper.aplicar(solicitud, entidad);
            return mapper.aRespuesta(repositorio.save(entidad));
        }).orElseThrow(() -> new RecursoNoEncontradoException(
                "Asignacion docente con ID " + id + " no encontrado"));
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException(
                    "Asignacion docente con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}

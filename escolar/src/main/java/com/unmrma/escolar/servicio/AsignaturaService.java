package com.unmrma.escolar.servicio;

import com.unmrma.escolar.dtos.asignatura.AsignaturaActualizarRequest;
import com.unmrma.escolar.dtos.asignatura.AsignaturaCrearRequest;
import com.unmrma.escolar.dtos.asignatura.AsignaturaRespuesta;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.mapper.AsignaturaMapper;
import com.unmrma.escolar.modelo.Asignatura;
import com.unmrma.escolar.repositorio.AsignaturaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AsignaturaService {

    private final AsignaturaRepository repositorio;
    private final AsignaturaMapper mapper;

    public AsignaturaService(AsignaturaRepository repositorio,
                             AsignaturaMapper mapper) {
        this.repositorio = repositorio;
        this.mapper = mapper;
    }

    public List<AsignaturaRespuesta> listarTodas() {
        return repositorio.findAll()
                .stream()
                .map(mapper::aRespuesta)
                .toList();
    }

    public List<AsignaturaRespuesta> listarTodos() {
        return listarTodas();
    }

    public Optional<AsignaturaRespuesta> obtenerPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta);
    }

    public AsignaturaRespuesta buscarPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Asignatura con ID " + id + " no encontrada"));
    }

    public AsignaturaRespuesta guardar(AsignaturaCrearRequest solicitud) {
        Asignatura entidad = mapper.aEntidad(solicitud);
        return mapper.aRespuesta(repositorio.save(entidad));
    }

    public AsignaturaRespuesta actualizar(Integer id,
                                          AsignaturaActualizarRequest solicitud) {
        return repositorio.findById(id).map(entidad -> {
            mapper.aplicar(solicitud, entidad);
            return mapper.aRespuesta(repositorio.save(entidad));
        }).orElseThrow(() -> new RecursoNoEncontradoException(
                "Asignatura con ID " + id + " no encontrada"));
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException(
                    "Asignatura con ID " + id + " no encontrada");
        }
        repositorio.deleteById(id);
    }
}

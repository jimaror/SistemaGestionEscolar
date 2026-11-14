package com.unmrma.escolar.servicio;

import com.unmrma.escolar.dtos.reunion.ReunionActualizarRequest;
import com.unmrma.escolar.dtos.reunion.ReunionCrearRequest;
import com.unmrma.escolar.dtos.reunion.ReunionRespuesta;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.mapper.ReunionMapper;
import com.unmrma.escolar.modelo.Reunion;
import com.unmrma.escolar.repositorio.ReunionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReunionService {

    private final ReunionRepository repositorio;
    private final ReunionMapper mapper;

    public ReunionService(ReunionRepository repositorio,
                          ReunionMapper mapper) {
        this.repositorio = repositorio;
        this.mapper = mapper;
    }

    public List<ReunionRespuesta> listarTodos() {
        return repositorio.findAll()
                .stream()
                .map(mapper::aRespuesta)
                .toList();
    }

    public Optional<ReunionRespuesta> obtenerPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta);
    }

    public ReunionRespuesta buscarPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Reunion con ID " + id + " no encontrado"));
    }

    public ReunionRespuesta guardar(ReunionCrearRequest solicitud, Integer creadaPorId) {
        Reunion entidad = mapper.aEntidad(solicitud);
        entidad.setCreadaPorId(creadaPorId);
        return mapper.aRespuesta(repositorio.save(entidad));
    }

    public ReunionRespuesta actualizar(Integer id, ReunionActualizarRequest solicitud) {
        return repositorio.findById(id).map(entidad -> {
            mapper.aplicar(solicitud, entidad);
            return mapper.aRespuesta(repositorio.save(entidad));
        }).orElseThrow(() -> new RecursoNoEncontradoException(
                "Reunion con ID " + id + " no encontrado"));
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException(
                    "Reunion con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}

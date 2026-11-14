package com.unmrma.escolar.servicio;

import com.unmrma.escolar.dtos.evaluacion.EvaluacionActualizarRequest;
import com.unmrma.escolar.dtos.evaluacion.EvaluacionCrearRequest;
import com.unmrma.escolar.dtos.evaluacion.EvaluacionRespuesta;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.mapper.EvaluacionMapper;
import com.unmrma.escolar.modelo.Evaluacion;
import com.unmrma.escolar.repositorio.EvaluacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EvaluacionService {

    private final EvaluacionRepository repositorio;
    private final EvaluacionMapper mapper;

    public EvaluacionService(EvaluacionRepository repositorio,
                             EvaluacionMapper mapper) {
        this.repositorio = repositorio;
        this.mapper = mapper;
    }

    public List<EvaluacionRespuesta> listarTodos() {
        return repositorio.findAll()
                .stream()
                .map(mapper::aRespuesta)
                .toList();
    }

    public Optional<EvaluacionRespuesta> obtenerPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta);
    }

    public EvaluacionRespuesta buscarPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Evaluacion con ID " + id + " no encontrada"));
    }

    public EvaluacionRespuesta guardar(EvaluacionCrearRequest solicitud) {
        Evaluacion entidad = mapper.aEntidad(solicitud);
        return mapper.aRespuesta(repositorio.save(entidad));
    }

    public EvaluacionRespuesta actualizar(Integer id,
                                          EvaluacionActualizarRequest solicitud) {
        return repositorio.findById(id).map(entidad -> {
            mapper.aplicar(solicitud, entidad);
            return mapper.aRespuesta(repositorio.save(entidad));
        }).orElseThrow(() -> new RecursoNoEncontradoException(
                "Evaluacion con ID " + id + " no encontrada"));
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException(
                    "Evaluacion con ID " + id + " no encontrada");
        }
        repositorio.deleteById(id);
    }
}

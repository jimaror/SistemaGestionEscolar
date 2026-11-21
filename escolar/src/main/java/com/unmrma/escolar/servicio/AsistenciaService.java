package com.unmrma.escolar.servicio;

import com.unmrma.escolar.dtos.asistencia.AsistenciaActualizarRequest;
import com.unmrma.escolar.dtos.asistencia.AsistenciaCrearRequest;
import com.unmrma.escolar.dtos.asistencia.AsistenciaRespuesta;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.mapper.AsistenciaMapper;
import com.unmrma.escolar.modelo.Asistencia;
import com.unmrma.escolar.repositorio.AsistenciaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AsistenciaService {

    private final AsistenciaRepository repositorio;
    private final AsistenciaMapper mapper;

    public AsistenciaService(AsistenciaRepository repositorio,
                             AsistenciaMapper mapper) {
        this.repositorio = repositorio;
        this.mapper = mapper;
    }

    public List<AsistenciaRespuesta> listarTodos() {
        return repositorio.findAll()
                .stream()
                .map(mapper::aRespuesta)
                .toList();
    }

    public Optional<AsistenciaRespuesta> obtenerPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta);
    }

    public AsistenciaRespuesta buscarPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Asistencia con ID " + id + " no encontrado"));
    }

    public AsistenciaRespuesta guardar(AsistenciaCrearRequest solicitud, Integer registradoPorId) {
        Asistencia entidad = mapper.aEntidad(solicitud);
        entidad.setRegistradoPorId(registradoPorId);
        return mapper.aRespuesta(repositorio.save(entidad));
    }

    public AsistenciaRespuesta actualizar(Integer id,
                                          AsistenciaActualizarRequest solicitud) {
        return repositorio.findById(id).map(entidad -> {
            mapper.aplicar(solicitud, entidad);
            return mapper.aRespuesta(repositorio.save(entidad));
        }).orElseThrow(() -> new RecursoNoEncontradoException(
                "Asistencia con ID " + id + " no encontrado"));
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException(
                    "Asistencia con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}

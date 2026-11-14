package com.unmrma.escolar.servicio;

import com.unmrma.escolar.dtos.matricula.MatriculaActualizarRequest;
import com.unmrma.escolar.dtos.matricula.MatriculaCrearRequest;
import com.unmrma.escolar.dtos.matricula.MatriculaRespuesta;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.mapper.MatriculaMapper;
import com.unmrma.escolar.modelo.Matricula;
import com.unmrma.escolar.repositorio.MatriculaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MatriculaService {

    private final MatriculaRepository repositorio;
    private final MatriculaMapper mapper;

    public MatriculaService(MatriculaRepository repositorio,
                            MatriculaMapper mapper) {
        this.repositorio = repositorio;
        this.mapper = mapper;
    }

    public List<MatriculaRespuesta> listarTodas() {
        return repositorio.findAll()
                .stream()
                .map(mapper::aRespuesta)
                .toList();
    }

    public List<MatriculaRespuesta> listarPorAlumno(Integer alumnoId) {
        return repositorio.findByAlumno_Id(alumnoId)
                .stream()
                .map(mapper::aRespuesta)
                .toList();
    }

    public Optional<MatriculaRespuesta> obtenerPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta);
    }

    public MatriculaRespuesta buscarPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta)
                .orElseThrow(() -> new RecursoNoEncontradoException("Matrícula con ID " + id + " no encontrada"));
    }

    public MatriculaRespuesta guardar(MatriculaCrearRequest solicitud) {
        Matricula entidad = mapper.aEntidad(solicitud);
        return mapper.aRespuesta(repositorio.save(entidad));
    }

    public MatriculaRespuesta actualizar(Integer id, MatriculaActualizarRequest solicitud) {
        return repositorio.findById(id).map(entidad -> {
            mapper.aplicar(solicitud, entidad);
            return mapper.aRespuesta(repositorio.save(entidad));
        }).orElseThrow(() -> new RecursoNoEncontradoException("Matrícula con ID " + id + " no encontrada"));
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Matrícula con ID " + id + " no encontrada");
        }
        repositorio.deleteById(id);
    }
}

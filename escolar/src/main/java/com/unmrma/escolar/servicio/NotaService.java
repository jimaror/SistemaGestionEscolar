package com.unmrma.escolar.servicio;

import com.unmrma.escolar.dtos.nota.NotaActualizarRequest;
import com.unmrma.escolar.dtos.nota.NotaCrearRequest;
import com.unmrma.escolar.dtos.nota.NotaRespuesta;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.mapper.NotaMapper;
import com.unmrma.escolar.modelo.Nota;
import com.unmrma.escolar.repositorio.NotaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotaService {

    private final NotaRepository repositorio;
    private final NotaMapper mapper;

    public NotaService(NotaRepository repositorio,
                       NotaMapper mapper) {
        this.repositorio = repositorio;
        this.mapper = mapper;
    }

    public List<NotaRespuesta> listarTodas() {
        return repositorio.findAll()
                .stream()
                .map(mapper::aRespuesta)
                .toList();
    }

    public Optional<NotaRespuesta> obtenerPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta);
    }

    public NotaRespuesta buscarPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta)
                .orElseThrow(() -> new RecursoNoEncontradoException("Nota con ID " + id + " no encontrada"));
    }

    public NotaRespuesta guardar(NotaCrearRequest solicitud, Integer registradoPorId) {
        Nota entidad = mapper.aEntidad(solicitud);
        entidad.setRegistradoPor(registradoPorId);
        return mapper.aRespuesta(repositorio.save(entidad));
    }

    public NotaRespuesta actualizar(Integer id, NotaActualizarRequest solicitud) {
        return repositorio.findById(id).map(entidad -> {
            mapper.aplicar(solicitud, entidad);
            return mapper.aRespuesta(repositorio.save(entidad));
        }).orElseThrow(() -> new RecursoNoEncontradoException("Nota con ID " + id + " no encontrada"));
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Nota con ID " + id + " no encontrada");
        }
        repositorio.deleteById(id);
    }
}
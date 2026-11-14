package com.unmrma.escolar.servicio;

import com.unmrma.escolar.dtos.maestro.MaestroActualizarRequest;
import com.unmrma.escolar.dtos.maestro.MaestroCrearRequest;
import com.unmrma.escolar.dtos.maestro.MaestroRespuesta;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.mapper.MaestroMapper;
import com.unmrma.escolar.modelo.Maestro;
import com.unmrma.escolar.repositorio.MaestroRepositorio;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MaestroService {

    private final MaestroRepositorio repositorio;
    private final MaestroMapper mapper;

    public MaestroService(MaestroRepositorio repositorio, MaestroMapper mapper) {
        this.repositorio = repositorio;
        this.mapper = mapper;
    }

    public List<MaestroRespuesta> listarTodos() {
        return repositorio.findAll()
                .stream()
                .map(mapper::aRespuesta)
                .toList();
    }

    public Optional<MaestroRespuesta> obtenerPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta);
    }

    public MaestroRespuesta buscarPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta)
                .orElseThrow(() -> new RecursoNoEncontradoException("Maestro con ID " + id + " no encontrado"));
    }

    public MaestroRespuesta guardar(MaestroCrearRequest solicitud) {
        Maestro entidad = mapper.aEntidad(solicitud);
        return mapper.aRespuesta(repositorio.save(entidad));
    }

    public MaestroRespuesta actualizar(Integer id, MaestroActualizarRequest solicitud) {
        return repositorio.findById(id).map(entidad -> {
            mapper.aplicar(solicitud, entidad);
            return mapper.aRespuesta(repositorio.save(entidad));
        }).orElseThrow(() -> new RecursoNoEncontradoException("Maestro con ID " + id + " no encontrado"));
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Maestro con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}

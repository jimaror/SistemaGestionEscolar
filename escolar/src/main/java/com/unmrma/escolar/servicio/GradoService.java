package com.unmrma.escolar.servicio;

import com.unmrma.escolar.dtos.grado.GradoActualizarRequest;
import com.unmrma.escolar.dtos.grado.GradoCrearRequest;
import com.unmrma.escolar.dtos.grado.GradoRespuesta;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.mapper.GradoMapper;
import com.unmrma.escolar.modelo.Grado;
import com.unmrma.escolar.repositorio.GradoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GradoService {

    private final GradoRepository repositorio;
    private final GradoMapper mapper;

    public GradoService(GradoRepository repositorio, GradoMapper mapper) {
        this.repositorio = repositorio;
        this.mapper = mapper;
    }

    public List<GradoRespuesta> listarTodos() {
        return repositorio.findAll()
                .stream()
                .map(mapper::aRespuesta)
                .toList();
    }

    public Optional<GradoRespuesta> obtenerPorId(Byte id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta);
    }

    public GradoRespuesta buscarPorId(Byte id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Grado con ID " + id + " no encontrado"));
    }

    public GradoRespuesta guardar(GradoCrearRequest solicitud) {
        Grado entidad = mapper.aEntidad(solicitud);
        return mapper.aRespuesta(repositorio.save(entidad));
    }

    public GradoRespuesta actualizar(Byte id, GradoActualizarRequest solicitud) {
        return repositorio.findById(id).map(entidad -> {
            mapper.aplicar(solicitud, entidad);
            return mapper.aRespuesta(repositorio.save(entidad));
        }).orElseThrow(() -> new RecursoNoEncontradoException(
                "Grado con ID " + id + " no encontrado"));
    }

    public void eliminar(Byte id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException(
                    "Grado con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}

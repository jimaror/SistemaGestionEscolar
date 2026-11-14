package com.unmrma.escolar.servicio;

import com.unmrma.escolar.dtos.material.MaterialActualizarRequest;
import com.unmrma.escolar.dtos.material.MaterialCrearRequest;
import com.unmrma.escolar.dtos.material.MaterialRespuesta;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.mapper.MaterialMapper;
import com.unmrma.escolar.modelo.Material;
import com.unmrma.escolar.repositorio.MaterialRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MaterialService {

    private final MaterialRepository repositorio;
    private final MaterialMapper mapper;

    public MaterialService(MaterialRepository repositorio,
                           MaterialMapper mapper) {
        this.repositorio = repositorio;
        this.mapper = mapper;
    }

    public List<MaterialRespuesta> listarTodos() {
        return repositorio.findAll()
                .stream()
                .map(mapper::aRespuesta)
                .toList();
    }

    public Optional<MaterialRespuesta> obtenerPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta);
    }

    public MaterialRespuesta buscarPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta)
                .orElseThrow(() -> new RecursoNoEncontradoException("Material con ID " + id + " no encontrado"));
    }

    public MaterialRespuesta guardar(MaterialCrearRequest solicitud) {
        Material entidad = mapper.aEntidad(solicitud);
        return mapper.aRespuesta(repositorio.save(entidad));
    }

    public MaterialRespuesta actualizar(Integer id,
                                        MaterialActualizarRequest solicitud) {
        return repositorio.findById(id).map(entidad -> {
            mapper.aplicar(solicitud, entidad);
            return mapper.aRespuesta(repositorio.save(entidad));
        }).orElseThrow(() -> new RecursoNoEncontradoException("Material con ID " + id + " no encontrado"));
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Material con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}

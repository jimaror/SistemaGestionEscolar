package com.unmrma.escolar.servicio;

import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.modelo.EntregaTarea;
import com.unmrma.escolar.repositorio.EntregaTareaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EntregaTareaService {

    private final EntregaTareaRepository repositorio;

    public EntregaTareaService(EntregaTareaRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<EntregaTarea> listarTodos() {
        return repositorio.findAll();
    }

    public Optional<EntregaTarea> obtenerPorId(Integer id) {
        return repositorio.findById(id);
    }

    public EntregaTarea buscarPorId(Integer id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Entrega de tarea con ID " + id + " no encontrado"));
    }

    public EntregaTarea guardar(EntregaTarea entidad) {
        return repositorio.save(entidad);
    }

    public EntregaTarea actualizar(Integer id, EntregaTarea entidad) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Entrega de tarea con ID " + id + " no encontrado");
        }
        entidad.setId(id);
        return repositorio.save(entidad);
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Entrega de tarea con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}
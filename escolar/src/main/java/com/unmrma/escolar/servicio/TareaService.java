package com.unmrma.escolar.servicio;

import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.modelo.Tarea;
import com.unmrma.escolar.repositorio.TareaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TareaService {

    private final TareaRepository repositorio;

    public TareaService(TareaRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Tarea> listarTodos() {
        return repositorio.findAll();
    }

    public Optional<Tarea> obtenerPorId(Integer id) {
        return repositorio.findById(id);
    }

    public Tarea buscarPorId(Integer id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Tarea con ID " + id + " no encontrado"));
    }

    public Tarea guardar(Tarea entidad) {
        return repositorio.save(entidad);
    }

    public Tarea actualizar(Integer id, Tarea entidad) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Tarea con ID " + id + " no encontrado");
        }
        entidad.setId(id);
        return repositorio.save(entidad);
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Tarea con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}
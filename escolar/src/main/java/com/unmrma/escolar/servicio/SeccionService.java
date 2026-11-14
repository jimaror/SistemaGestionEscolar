package com.unmrma.escolar.servicio;

import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.modelo.Seccion;
import com.unmrma.escolar.repositorio.SeccionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SeccionService {

    private final SeccionRepository repositorio;

    public SeccionService(SeccionRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Seccion> listarTodos() {
        return repositorio.findAll();
    }

    public Optional<Seccion> obtenerPorId(Integer id) {
        return repositorio.findById(id);
    }

    public Seccion buscarPorId(Integer id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Sección con ID " + id + " no encontrado"));
    }

    public Seccion guardar(Seccion entidad) {
        return repositorio.save(entidad);
    }

    public Seccion actualizar(Integer id, Seccion entidad) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Sección con ID " + id + " no encontrado");
        }
        entidad.setId(id);
        return repositorio.save(entidad);
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Sección con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}
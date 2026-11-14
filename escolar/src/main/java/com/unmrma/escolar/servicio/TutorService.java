package com.unmrma.escolar.servicio;

import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.modelo.Tutor;
import com.unmrma.escolar.repositorio.TutorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TutorService {

    private final TutorRepository repositorio;

    public TutorService(TutorRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Tutor> listarTodos() {
        return repositorio.findAll();
    }

    public Optional<Tutor> obtenerPorId(Integer id) {
        return repositorio.findById(id);
    }

    public Tutor buscarPorId(Integer id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Tutor con ID " + id + " no encontrado"));
    }

    public Tutor guardar(Tutor entidad) {
        return repositorio.save(entidad);
    }

    public Tutor actualizar(Integer id, Tutor entidad) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Tutor con ID " + id + " no encontrado");
        }
        entidad.setId(id);
        return repositorio.save(entidad);
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Tutor con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}
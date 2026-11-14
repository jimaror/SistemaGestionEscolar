package com.unmrma.escolar.servicio;

import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.modelo.AlumnoTutor;
import com.unmrma.escolar.repositorio.AlumnoTutorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AlumnoTutorService {

    private final AlumnoTutorRepository repositorio;

    public AlumnoTutorService(AlumnoTutorRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<AlumnoTutor> listarTodos() {
        return repositorio.findAll();
    }

    public Optional<AlumnoTutor> obtenerPorId(Integer id) {
        return repositorio.findById(id);
    }

    public AlumnoTutor buscarPorId(Integer id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Relación alumno-tutor con ID " + id + " no encontrado"));
    }

    public AlumnoTutor guardar(AlumnoTutor entidad) {
        return repositorio.save(entidad);
    }

    public AlumnoTutor actualizar(Integer id, AlumnoTutor entidad) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Relación alumno-tutor con ID " + id + " no encontrado");
        }
        entidad.setId(id);
        return repositorio.save(entidad);
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Relación alumno-tutor con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}
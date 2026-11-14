package com.unmrma.escolar.servicio;

import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.modelo.AnioEscolar;
import com.unmrma.escolar.repositorio.AnioEscolarRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AnioEscolarService {

    private final AnioEscolarRepository repositorio;

    public AnioEscolarService(AnioEscolarRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<AnioEscolar> listarTodos() {
        return repositorio.findAll();
    }

    public Optional<AnioEscolar> obtenerPorId(Integer id) {
        return repositorio.findById(id);
    }

    public AnioEscolar buscarPorId(Integer id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Año escolar con ID " + id + " no encontrado"));
    }

    public AnioEscolar guardar(AnioEscolar entidad) {
        return repositorio.save(entidad);
    }

    public AnioEscolar actualizar(Integer id, AnioEscolar entidad) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Año escolar con ID " + id + " no encontrado");
        }
        entidad.setId(id);
        return repositorio.save(entidad);
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Año escolar con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}
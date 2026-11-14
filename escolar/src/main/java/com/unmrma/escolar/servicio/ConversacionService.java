package com.unmrma.escolar.servicio;

import com.unmrma.escolar.dtos.conversacion.ConversacionActualizarRequest;
import com.unmrma.escolar.dtos.conversacion.ConversacionCrearRequest;
import com.unmrma.escolar.dtos.conversacion.ConversacionRespuesta;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.mapper.ConversacionMapper;
import com.unmrma.escolar.modelo.Conversacion;
import com.unmrma.escolar.repositorio.ConversacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ConversacionService {

    private final ConversacionRepository repositorio;
    private final ConversacionMapper mapper;

    public ConversacionService(ConversacionRepository repositorio,
                               ConversacionMapper mapper) {
        this.repositorio = repositorio;
        this.mapper = mapper;
    }

    public List<ConversacionRespuesta> listarTodos() {
        return repositorio.findAll()
                .stream()
                .map(mapper::aRespuesta)
                .toList();
    }

    public Optional<ConversacionRespuesta> obtenerPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta);
    }

    public ConversacionRespuesta buscarPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Conversacion con ID " + id + " no encontrado"));
    }

    public ConversacionRespuesta guardar(ConversacionCrearRequest solicitud,
                                         Integer creadaPorId) {
        Conversacion entidad = mapper.aEntidad(solicitud);
        entidad.setCreadaPorId(creadaPorId);
        return mapper.aRespuesta(repositorio.save(entidad));
    }

    public ConversacionRespuesta actualizar(Integer id,
                                            ConversacionActualizarRequest solicitud) {
        return repositorio.findById(id).map(entidad -> {
            mapper.aplicar(solicitud, entidad);
            return mapper.aRespuesta(repositorio.save(entidad));
        }).orElseThrow(() -> new RecursoNoEncontradoException(
                "Conversacion con ID " + id + " no encontrado"));
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException(
                    "Conversacion con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}

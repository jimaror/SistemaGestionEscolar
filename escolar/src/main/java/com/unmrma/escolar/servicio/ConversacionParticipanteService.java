package com.unmrma.escolar.servicio;

import com.unmrma.escolar.dtos.conversacionparticipante.ConversacionParticipanteActualizarRequest;
import com.unmrma.escolar.dtos.conversacionparticipante.ConversacionParticipanteCrearRequest;
import com.unmrma.escolar.dtos.conversacionparticipante.ConversacionParticipanteRespuesta;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.mapper.ConversacionParticipanteMapper;
import com.unmrma.escolar.modelo.ConversacionParticipante;
import com.unmrma.escolar.repositorio.ConversacionParticipanteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ConversacionParticipanteService {

    private final ConversacionParticipanteRepository repositorio;
    private final ConversacionParticipanteMapper mapper;

    public ConversacionParticipanteService(ConversacionParticipanteRepository repositorio,
                                           ConversacionParticipanteMapper mapper) {
        this.repositorio = repositorio;
        this.mapper = mapper;
    }

    public List<ConversacionParticipanteRespuesta> listarTodos() {
        return repositorio.findAll()
                .stream()
                .map(mapper::aRespuesta)
                .toList();
    }

    public Optional<ConversacionParticipanteRespuesta> obtenerPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta);
    }

    public ConversacionParticipanteRespuesta buscarPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Participante de conversacion con ID " + id + " no encontrado"));
    }

    public ConversacionParticipanteRespuesta guardar(ConversacionParticipanteCrearRequest solicitud) {
        ConversacionParticipante entidad = mapper.aEntidad(solicitud);
        return mapper.aRespuesta(repositorio.save(entidad));
    }

    public ConversacionParticipanteRespuesta actualizar(Integer id,
                                                        ConversacionParticipanteActualizarRequest solicitud) {
        return repositorio.findById(id).map(entidad -> {
            mapper.aplicar(solicitud, entidad);
            return mapper.aRespuesta(repositorio.save(entidad));
        }).orElseThrow(() -> new RecursoNoEncontradoException(
                "Participante de conversacion con ID " + id + " no encontrado"));
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException(
                    "Participante de conversacion con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}

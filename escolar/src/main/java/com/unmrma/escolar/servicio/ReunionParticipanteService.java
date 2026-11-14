package com.unmrma.escolar.servicio;

import com.unmrma.escolar.dtos.reunionparticipante.ReunionParticipanteActualizarRequest;
import com.unmrma.escolar.dtos.reunionparticipante.ReunionParticipanteCrearRequest;
import com.unmrma.escolar.dtos.reunionparticipante.ReunionParticipanteRespuesta;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.mapper.ReunionParticipanteMapper;
import com.unmrma.escolar.modelo.ReunionParticipante;
import com.unmrma.escolar.repositorio.ReunionParticipanteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReunionParticipanteService {

    private final ReunionParticipanteRepository repositorio;
    private final ReunionParticipanteMapper mapper;

    public ReunionParticipanteService(ReunionParticipanteRepository repositorio,
                                      ReunionParticipanteMapper mapper) {
        this.repositorio = repositorio;
        this.mapper = mapper;
    }

    public List<ReunionParticipanteRespuesta> listarTodos() {
        return repositorio.findAll()
                .stream()
                .map(mapper::aRespuesta)
                .toList();
    }

    public Optional<ReunionParticipanteRespuesta> obtenerPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta);
    }

    public ReunionParticipanteRespuesta buscarPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Participante de reunion con ID " + id + " no encontrado"));
    }

    public ReunionParticipanteRespuesta guardar(ReunionParticipanteCrearRequest solicitud) {
        ReunionParticipante entidad = mapper.aEntidad(solicitud);
        return mapper.aRespuesta(repositorio.save(entidad));
    }

    public ReunionParticipanteRespuesta actualizar(Integer id,
                                                   ReunionParticipanteActualizarRequest solicitud) {
        return repositorio.findById(id).map(entidad -> {
            mapper.aplicar(solicitud, entidad);
            return mapper.aRespuesta(repositorio.save(entidad));
        }).orElseThrow(() -> new RecursoNoEncontradoException(
                "Participante de reunion con ID " + id + " no encontrado"));
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException(
                    "Participante de reunion con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}

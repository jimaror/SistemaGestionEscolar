package com.unmrma.escolar.servicio;

import com.unmrma.escolar.dtos.mensaje.MensajeActualizarRequest;
import com.unmrma.escolar.dtos.mensaje.MensajeCrearRequest;
import com.unmrma.escolar.dtos.mensaje.MensajeRespuesta;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.mapper.MensajeMapper;
import com.unmrma.escolar.modelo.Mensaje;
import com.unmrma.escolar.repositorio.MensajeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MensajeService {

    private final MensajeRepository repositorio;
    private final MensajeMapper mapper;

    public MensajeService(MensajeRepository repositorio,
                          MensajeMapper mapper) {
        this.repositorio = repositorio;
        this.mapper = mapper;
    }

    public List<MensajeRespuesta> listarTodos() {
        return repositorio.findAll()
                .stream()
                .map(mapper::aRespuesta)
                .toList();
    }

    public Optional<MensajeRespuesta> obtenerPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta);
    }

    public MensajeRespuesta buscarPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta)
                .orElseThrow(() -> new RecursoNoEncontradoException("Mensaje con ID " + id + " no encontrado"));
    }

    public MensajeRespuesta guardar(MensajeCrearRequest solicitud, Integer remitenteId) {
        Mensaje entidad = mapper.aEntidad(solicitud);
        entidad.setRemitenteId(remitenteId);
        return mapper.aRespuesta(repositorio.save(entidad));
    }

    public MensajeRespuesta actualizar(Integer id,
                                       MensajeActualizarRequest solicitud) {
        return repositorio.findById(id).map(entidad -> {
            mapper.aplicar(solicitud, entidad);
            return mapper.aRespuesta(repositorio.save(entidad));
        }).orElseThrow(() -> new RecursoNoEncontradoException("Mensaje con ID " + id + " no encontrado"));
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Mensaje con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}

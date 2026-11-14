package com.unmrma.escolar.servicio;

import com.unmrma.escolar.dtos.justificacionausencia.JustificacionAusenciaActualizarRequest;
import com.unmrma.escolar.dtos.justificacionausencia.JustificacionAusenciaCrearRequest;
import com.unmrma.escolar.dtos.justificacionausencia.JustificacionAusenciaRespuesta;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import com.unmrma.escolar.mapper.JustificacionAusenciaMapper;
import com.unmrma.escolar.modelo.JustificacionAusencia;
import com.unmrma.escolar.repositorio.JustificacionAusenciaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JustificacionAusenciaService {

    private final JustificacionAusenciaRepository repositorio;
    private final JustificacionAusenciaMapper mapper;

    public JustificacionAusenciaService(JustificacionAusenciaRepository repositorio,
                                        JustificacionAusenciaMapper mapper) {
        this.repositorio = repositorio;
        this.mapper = mapper;
    }

    public List<JustificacionAusenciaRespuesta> listarTodos() {
        return repositorio.findAll()
                .stream()
                .map(mapper::aRespuesta)
                .toList();
    }

    public Optional<JustificacionAusenciaRespuesta> obtenerPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta);
    }

    public JustificacionAusenciaRespuesta buscarPorId(Integer id) {
        return repositorio.findById(id)
                .map(mapper::aRespuesta)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Justificacion de ausencia con ID " + id + " no encontrado"));
    }

    public JustificacionAusenciaRespuesta guardar(JustificacionAusenciaCrearRequest solicitud) {
        JustificacionAusencia entidad = mapper.aEntidad(solicitud);
        return mapper.aRespuesta(repositorio.save(entidad));
    }

    public JustificacionAusenciaRespuesta actualizar(Integer id,
                                                     JustificacionAusenciaActualizarRequest solicitud) {
        return repositorio.findById(id).map(entidad -> {
            mapper.aplicar(solicitud, entidad);
            return mapper.aRespuesta(repositorio.save(entidad));
        }).orElseThrow(() -> new RecursoNoEncontradoException(
                "Justificacion de ausencia con ID " + id + " no encontrado"));
    }

    /**
     * Actualiza una justificacion completa (usado por el director). Permite
     * cambiar estado, fechaAprobacion, aprobadoPorId y observacionAprobacion.
     */
    public JustificacionAusenciaRespuesta actualizarDirector(Integer id,
                                                             JustificacionAusencia entidad) {
        return repositorio.findById(id).map(existente -> {
            existente.setAsistenciaId(entidad.getAsistenciaId());
            existente.setMotivo(entidad.getMotivo());
            existente.setFechaDesde(entidad.getFechaDesde());
            existente.setFechaHasta(entidad.getFechaHasta());
            existente.setDocumentoAdjunto(entidad.getDocumentoAdjunto());
            existente.setEstado(entidad.getEstado());
            existente.setAprobadoPorId(entidad.getAprobadoPorId());
            existente.setFechaAprobacion(entidad.getFechaAprobacion());
            existente.setObservacionAprobacion(entidad.getObservacionAprobacion());
            return mapper.aRespuesta(repositorio.save(existente));
        }).orElseThrow(() -> new RecursoNoEncontradoException(
                "Justificacion de ausencia con ID " + id + " no encontrado"));
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException(
                    "Justificacion de ausencia con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}

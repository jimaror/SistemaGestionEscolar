package com.unmrma.escolar.controlador;

import com.unmrma.escolar.dtos.reunionparticipante.ReunionParticipanteActualizarRequest;
import com.unmrma.escolar.dtos.reunionparticipante.ReunionParticipanteCrearRequest;
import com.unmrma.escolar.dtos.reunionparticipante.ReunionParticipanteRespuesta;
import com.unmrma.escolar.seguridad.ServicioAutorizacion;
import com.unmrma.escolar.servicio.ReunionParticipanteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reunion-participantes")
public class ReunionParticipanteController {

    private final ReunionParticipanteService servicio;
    private final ServicioAutorizacion acceso;

    public ReunionParticipanteController(ReunionParticipanteService servicio,
                                         ServicioAutorizacion acceso) {
        this.servicio = servicio;
        this.acceso = acceso;
    }

    /**
     * Director ve todos los participantes. Maestro ve los de sus reuniones.
     * Alumno y tutor solo ven su propia inscripcion.
     */
    @GetMapping
    public List<ReunionParticipanteRespuesta> listarTodos() {
        List<ReunionParticipanteRespuesta> participantes = servicio.listarTodos();
        if (acceso.esDirector()) {
            return participantes;
        }
        return participantes.stream()
                .filter(p -> acceso.puedeVerReunionParticipanteId(p.getReunionId(), p.getUsuarioId()))
                .toList();
    }

    /** Un usuario sin permiso sobre el participante recibe 403. */
    @GetMapping("/{id}")
    public ResponseEntity<ReunionParticipanteRespuesta> obtenerPorId(@PathVariable Integer id) {
        ReunionParticipanteRespuesta participante = servicio.buscarPorId(id);
        acceso.exigirVerReunionParticipanteId(participante.getReunionId(), participante.getUsuarioId());
        return ResponseEntity.ok(participante);
    }

    /**
     * Director o creador de la reunion pueden agregar participantes. Maestro
     * solo en reuniones de sus propias asignaciones.
     */
    @PostMapping
    public ResponseEntity<ReunionParticipanteRespuesta> guardar(@Valid @RequestBody ReunionParticipanteCrearRequest solicitud) {
        acceso.exigirCrearReunionParticipanteId(solicitud.getReunionId());
        return new ResponseEntity<>(servicio.guardar(solicitud), HttpStatus.CREATED);
    }

    /**
     * Editar participante: director o creador de la reunion. No se puede
     * cambiar la reunion ni el usuario.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ReunionParticipanteRespuesta> actualizar(@PathVariable Integer id,
                                                                   @Valid @RequestBody ReunionParticipanteActualizarRequest solicitud) {
        ReunionParticipanteRespuesta existente = servicio.buscarPorId(id);
        acceso.exigirEditarReunionParticipanteId(existente.getReunionId(), existente.getUsuarioId());
        return ResponseEntity.ok(servicio.actualizar(id, solicitud));
    }

    /**
     * Eliminar participante: director, creador de la reunion, o el propio
     * usuario (salida voluntaria).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        ReunionParticipanteRespuesta participante = servicio.buscarPorId(id);
        acceso.exigirEliminarReunionParticipanteId(participante.getReunionId(), participante.getUsuarioId());
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

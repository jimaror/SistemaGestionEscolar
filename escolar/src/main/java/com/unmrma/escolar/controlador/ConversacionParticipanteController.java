package com.unmrma.escolar.controlador;

import com.unmrma.escolar.dtos.conversacionparticipante.ConversacionParticipanteActualizarRequest;
import com.unmrma.escolar.dtos.conversacionparticipante.ConversacionParticipanteCrearRequest;
import com.unmrma.escolar.dtos.conversacionparticipante.ConversacionParticipanteRespuesta;
import com.unmrma.escolar.seguridad.ServicioAutorizacion;
import com.unmrma.escolar.servicio.ConversacionParticipanteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversacion-participantes")
public class ConversacionParticipanteController {

    private final ConversacionParticipanteService servicio;
    private final ServicioAutorizacion acceso;

    public ConversacionParticipanteController(ConversacionParticipanteService servicio,
                                              ServicioAutorizacion acceso) {
        this.servicio = servicio;
        this.acceso = acceso;
    }

    /**
     * Cada usuario ve los participantes de las conversaciones en las que
     * participa. El director ve todas.
     */
    @GetMapping
    public List<ConversacionParticipanteRespuesta> listarTodos() {
        List<ConversacionParticipanteRespuesta> participantes = servicio.listarTodos();
        if (acceso.puedeVerTodasLasConversaciones()) {
            return participantes;
        }
        return participantes.stream()
                .filter(p -> acceso.puedeVerParticipanteId(p.getConversacionId()))
                .toList();
    }

    /** Si la conversacion no es visible para el usuario, recibe 403. */
    @GetMapping("/{id}")
    public ResponseEntity<ConversacionParticipanteRespuesta> obtenerPorId(@PathVariable Integer id) {
        ConversacionParticipanteRespuesta participante = servicio.buscarPorId(id);
        acceso.exigirVerParticipanteId(participante.getConversacionId());
        return ResponseEntity.ok(participante);
    }

    /**
     * Solo el creador de la conversacion o el director pueden anadir
     * participantes.
     */
    @PostMapping
    public ResponseEntity<ConversacionParticipanteRespuesta> guardar(
            @Valid @RequestBody ConversacionParticipanteCrearRequest solicitud) {
        acceso.exigirGestionarParticipantes(solicitud.getConversacionId());
        return new ResponseEntity<>(servicio.guardar(solicitud), HttpStatus.CREATED);
    }

    /**
     * Se valida la conversacion original y la nueva, para impedir que un
     * creador mueva un participante a una conversacion que no le pertenece.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ConversacionParticipanteRespuesta> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody ConversacionParticipanteActualizarRequest solicitud) {
        ConversacionParticipanteRespuesta existente = servicio.buscarPorId(id);
        acceso.exigirGestionarParticipantes(existente.getConversacionId());
        return ResponseEntity.ok(servicio.actualizar(id, solicitud));
    }

    /**
     * Puede eliminar la participacion el director, el creador de la
     * conversacion o el propio participante cuando decide salirse.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        ConversacionParticipanteRespuesta participante = servicio.buscarPorId(id);
        acceso.exigirEliminarParticipanteId(participante.getConversacionId(), participante.getUsuarioId());
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

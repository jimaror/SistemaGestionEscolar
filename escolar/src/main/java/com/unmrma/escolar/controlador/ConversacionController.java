package com.unmrma.escolar.controlador;

import com.unmrma.escolar.dtos.conversacion.ConversacionActualizarRequest;
import com.unmrma.escolar.dtos.conversacion.ConversacionCrearRequest;
import com.unmrma.escolar.dtos.conversacion.ConversacionRespuesta;
import com.unmrma.escolar.seguridad.ServicioAutorizacion;
import com.unmrma.escolar.servicio.ConversacionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/conversaciones")
public class ConversacionController {

    private final ConversacionService servicio;
    private final ServicioAutorizacion acceso;

    public ConversacionController(ConversacionService servicio, ServicioAutorizacion acceso) {
        this.servicio = servicio;
        this.acceso = acceso;
    }

    /**
     * El director ve todas las conversaciones. Cualquier otro usuario solo ve
     * aquellas que creó o en las que figura como participante.
     */
    @GetMapping
    public List<ConversacionRespuesta> listarTodos() {
        List<ConversacionRespuesta> conversaciones = servicio.listarTodos();
        if (acceso.puedeVerTodasLasConversaciones()) {
            return conversaciones;
        }
        Set<Integer> visibles = acceso.idsConversacionesVisibles();
        return conversaciones.stream()
                .filter(conversacion -> visibles.contains(conversacion.getId()))
                .toList();
    }

    /** Si no es creador ni participante, recibe 403. */
    @GetMapping("/{id}")
    public ResponseEntity<ConversacionRespuesta> obtenerPorId(@PathVariable Integer id) {
        ConversacionRespuesta conversacion = servicio.buscarPorId(id);
        acceso.exigirVerConversacion(id);
        return ResponseEntity.ok(conversacion);
    }

    /**
     * El creador se toma siempre del usuario autenticado; no se acepta del
     * cuerpo para evitar suplantación.
     */
    @PostMapping
    public ResponseEntity<ConversacionRespuesta> guardar(
            @Valid @RequestBody ConversacionCrearRequest solicitud) {
        return new ResponseEntity<>(servicio.guardar(solicitud, acceso.usuarioId()),
                HttpStatus.CREATED);
    }

    /**
     * Solo el creador o el director pueden editar. Se conserva el creador y la
     * fecha de creación originales.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ConversacionRespuesta> actualizar(@PathVariable Integer id,
                                                            @Valid @RequestBody ConversacionActualizarRequest solicitud) {
        acceso.exigirEditarConversacion(id);
        return ResponseEntity.ok(servicio.actualizar(id, solicitud));
    }

    /** Eliminar conversaciones queda reservado al director. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

package com.unmrma.escolar.controlador;

import com.unmrma.escolar.dtos.mensaje.MensajeActualizarRequest;
import com.unmrma.escolar.dtos.mensaje.MensajeCrearRequest;
import com.unmrma.escolar.dtos.mensaje.MensajeRespuesta;
import com.unmrma.escolar.seguridad.ServicioAutorizacion;
import com.unmrma.escolar.servicio.MensajeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mensajes")
public class MensajeController {

    private final MensajeService servicio;
    private final ServicioAutorizacion acceso;

    public MensajeController(MensajeService servicio, ServicioAutorizacion acceso) {
        this.servicio = servicio;
        this.acceso = acceso;
    }

    /**
     * El director ve todos los mensajes. Cualquier otro usuario solo ve los
     * mensajes de las conversaciones en las que participa.
     */
    @GetMapping
    public List<MensajeRespuesta> listarTodos() {
        List<MensajeRespuesta> mensajes = servicio.listarTodos();
        if (acceso.esDirector()) {
            return mensajes;
        }
        return mensajes.stream()
                .filter(m -> acceso.puedeVerMensajeId(m.getConversacionId()))
                .toList();
    }

    /** Un usuario que no sea participante de la conversacion recibe 403. */
    @GetMapping("/{id}")
    public ResponseEntity<MensajeRespuesta> obtenerPorId(@PathVariable Integer id) {
        MensajeRespuesta mensaje = servicio.buscarPorId(id);
        acceso.exigirVerMensajeId(mensaje.getConversacionId());
        return ResponseEntity.ok(mensaje);
    }

    /**
     * Solo el director o un participante de la conversacion puede escribir en
     * ella. El remitente se fuerza al usuario autenticado: nadie puede
     * suplantar a otro.
     */
    @PostMapping
    public ResponseEntity<MensajeRespuesta> guardar(@Valid @RequestBody MensajeCrearRequest solicitud) {
        acceso.exigirEscribirMensaje(solicitud.getConversacionId());
        return new ResponseEntity<>(servicio.guardar(solicitud, acceso.usuarioId()), HttpStatus.CREATED);
    }

    /**
     * Solo el remitente propio puede editar su mensaje, sin cambiar la
     * conversacion ni el remitente. El director puede editar cualquiera.
     */
    @PutMapping("/{id}")
    public ResponseEntity<MensajeRespuesta> actualizar(@PathVariable Integer id,
                                                       @Valid @RequestBody MensajeActualizarRequest solicitud) {
        MensajeRespuesta existente = servicio.buscarPorId(id);
        acceso.exigirEditarMensajeId(existente.getConversacionId(), existente.getRemitenteId());
        return ResponseEntity.ok(servicio.actualizar(id, solicitud));
    }

    /**
     * Solo el remitente propio puede eliminar su mensaje. El director puede
     * eliminar cualquiera.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        MensajeRespuesta mensaje = servicio.buscarPorId(id);
        acceso.exigirEliminarMensajeId(mensaje.getConversacionId(), mensaje.getRemitenteId());
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

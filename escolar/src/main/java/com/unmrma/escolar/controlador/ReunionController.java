package com.unmrma.escolar.controlador;

import com.unmrma.escolar.dtos.reunion.ReunionActualizarRequest;
import com.unmrma.escolar.dtos.reunion.ReunionCrearRequest;
import com.unmrma.escolar.dtos.reunion.ReunionRespuesta;
import com.unmrma.escolar.seguridad.ServicioAutorizacion;
import com.unmrma.escolar.servicio.ReunionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reuniones")
public class ReunionController {

    private final ReunionService servicio;
    private final ServicioAutorizacion acceso;

    public ReunionController(ReunionService servicio, ServicioAutorizacion acceso) {
        this.servicio = servicio;
        this.acceso = acceso;
    }

    /**
     * Director ve todas las reuniones. Maestro ve las de sus asignaciones.
     * Alumno y tutor solo ven las de las reuniones en las que participan.
     */
    @GetMapping
    public List<ReunionRespuesta> listarTodos() {
        List<ReunionRespuesta> reuniones = servicio.listarTodos();
        if (acceso.esDirector()) {
            return reuniones;
        }
        return reuniones.stream()
                .filter(r -> acceso.puedeVerReunionId(r.getId()))
                .toList();
    }

    /** Un usuario sin permiso sobre la reunión recibe 403. */
    @GetMapping("/{id}")
    public ResponseEntity<ReunionRespuesta> obtenerPorId(@PathVariable Integer id) {
        ReunionRespuesta reunion = servicio.buscarPorId(id);
        acceso.exigirVerReunionId(id);
        return ResponseEntity.ok(reunion);
    }

    /**
     * Director y maestro pueden crear reuniones. El maestro solo en sus
     * propias asignaciones docentes. La creadaPor se fuerza al usuario
     * autenticado.
     */
    @PostMapping
    public ResponseEntity<ReunionRespuesta> guardar(@Valid @RequestBody ReunionCrearRequest solicitud) {
        acceso.exigirCrearReunionId(solicitud.getAsignacionDocenteId());
        return new ResponseEntity<>(servicio.guardar(solicitud, acceso.usuarioId()), HttpStatus.CREATED);
    }

    /**
     * Director puede editar cualquier reunión. Maestro solo las que creó o las
     * de sus asignaciones. No se puede cambiar la asignación docente ni el
     * creador.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ReunionRespuesta> actualizar(@PathVariable Integer id,
                                                       @Valid @RequestBody ReunionActualizarRequest solicitud) {
        acceso.exigirEditarReunionId(id);
        return ResponseEntity.ok(servicio.actualizar(id, solicitud));
    }

    /**
     * Eliminar reuniones queda reservado al director y al creador de la
     * reunión.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        ReunionRespuesta reunion = servicio.buscarPorId(id);
        acceso.exigirEliminarReunionId(id, reunion.getCreadaPorId());
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

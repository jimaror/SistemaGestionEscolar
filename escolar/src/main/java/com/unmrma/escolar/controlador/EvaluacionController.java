package com.unmrma.escolar.controlador;

import com.unmrma.escolar.dtos.evaluacion.EvaluacionActualizarRequest;
import com.unmrma.escolar.dtos.evaluacion.EvaluacionCrearRequest;
import com.unmrma.escolar.dtos.evaluacion.EvaluacionRespuesta;
import com.unmrma.escolar.seguridad.ServicioAutorizacion;
import com.unmrma.escolar.servicio.EvaluacionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluaciones")
public class EvaluacionController {

    private final EvaluacionService servicio;
    private final ServicioAutorizacion acceso;

    public EvaluacionController(EvaluacionService servicio, ServicioAutorizacion acceso) {
        this.servicio = servicio;
        this.acceso = acceso;
    }

    /**
     * Las evaluaciones no contienen datos personales: cualquier usuario
     * autenticado puede consultar el calendario de pruebas.
     */
    @GetMapping
    public List<EvaluacionRespuesta> listarTodos() {
        return servicio.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvaluacionRespuesta> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(servicio.buscarPorId(id));
    }

    /**
     * El director puede crear evaluaciones en cualquier asignación. El maestro
     * solo en las suyas. Alumno y tutor no pueden crear evaluaciones.
     */
    @PostMapping
    public ResponseEntity<EvaluacionRespuesta> guardar(@Valid @RequestBody EvaluacionCrearRequest solicitud) {
        acceso.exigirGestionEvaluacion(solicitud.getAsignacionDocenteId());
        return new ResponseEntity<>(servicio.guardar(solicitud), HttpStatus.CREATED);
    }

    /**
     * Se valida la asignación original y la nueva para impedir que un maestro
     * mueva una evaluación a una asignación ajena. No se puede cambiar la
     * asignación docente en una actualización.
     */
    @PutMapping("/{id}")
    public ResponseEntity<EvaluacionRespuesta> actualizar(@PathVariable Integer id,
                                                          @Valid @RequestBody EvaluacionActualizarRequest solicitud) {
        EvaluacionRespuesta existente = servicio.buscarPorId(id);
        acceso.exigirGestionEvaluacion(existente.getAsignacionDocenteId());
        return ResponseEntity.ok(servicio.actualizar(id, solicitud));
    }

    /** Eliminar evaluaciones queda reservado al director. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

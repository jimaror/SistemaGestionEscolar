package com.unmrma.escolar.controlador;

import com.unmrma.escolar.modelo.Tarea;
import com.unmrma.escolar.seguridad.ServicioAutorizacion;
import com.unmrma.escolar.servicio.TareaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tareas")
public class TareaController {

    private final TareaService servicio;
    private final ServicioAutorizacion acceso;

    public TareaController(TareaService servicio, ServicioAutorizacion acceso) {
        this.servicio = servicio;
        this.acceso = acceso;
    }

    /**
     * Las tareas no contienen datos personales: cualquier usuario
     * autenticado puede consultar las tareas publicadas del colegio.
     */
    @GetMapping
    public List<Tarea> listarTodos() {
        return servicio.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tarea> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(servicio.buscarPorId(id));
    }

    /**
     * El director puede crear tareas en cualquier asignación. El maestro
     * solo en las suyas. Alumno y tutor no pueden crear tareas.
     */
    @PostMapping
    public ResponseEntity<Tarea> guardar(@Valid @RequestBody Tarea entidad) {
        acceso.exigirGestionarTarea(entidad.getAsignacionDocenteId());
        return new ResponseEntity<>(servicio.guardar(entidad), HttpStatus.CREATED);
    }

    /**
     * Se valida la asignación original y la nueva para impedir que un maestro
     * mueva una tarea a una asignación ajena.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Tarea> actualizar(@PathVariable Integer id,
                                            @Valid @RequestBody Tarea entidad) {
        Tarea existente = servicio.buscarPorId(id);
        acceso.exigirGestionarTarea(existente.getAsignacionDocenteId());
        acceso.exigirGestionarTarea(entidad.getAsignacionDocenteId());
        return ResponseEntity.ok(servicio.actualizar(id, entidad));
    }

    /** Eliminar tareas queda reservado al director. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

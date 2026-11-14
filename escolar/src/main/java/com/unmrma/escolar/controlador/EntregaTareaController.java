package com.unmrma.escolar.controlador;

import com.unmrma.escolar.modelo.EntregaTarea;
import com.unmrma.escolar.seguridad.ServicioAutorizacion;
import com.unmrma.escolar.servicio.EntregaTareaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entregas-tareas")
public class EntregaTareaController {

    private final EntregaTareaService servicio;
    private final ServicioAutorizacion acceso;

    public EntregaTareaController(EntregaTareaService servicio, ServicioAutorizacion acceso) {
        this.servicio = servicio;
        this.acceso = acceso;
    }

    /**
     * Director y maestro ven todas las entregas. Un alumno solo las suyas y un
     * tutor solo las de sus hijos.
     */
    @GetMapping
    public List<EntregaTarea> listarTodos() {
        List<EntregaTarea> entregas = servicio.listarTodos();
        if (acceso.esDirector() || acceso.esMaestro()) {
            return entregas;
        }
        return entregas.stream()
                .filter(acceso::puedeVerEntrega)
                .toList();
    }

    /** Un alumno o tutor que pida una entrega ajena recibe 403. */
    @GetMapping("/{id}")
    public ResponseEntity<EntregaTarea> obtenerPorId(@PathVariable Integer id) {
        EntregaTarea entrega = servicio.buscarPorId(id);
        acceso.exigirVerEntrega(entrega);
        return ResponseEntity.ok(entrega);
    }

    /**
     * Solo el alumno dueño entrega la tarea. El alumno no puede elegir a otro
     * alumno: su ID se fuerza desde la cuenta autenticada.
     */
    @PostMapping
    public ResponseEntity<EntregaTarea> guardar(@Valid @RequestBody EntregaTarea entidad) {
        if (acceso.esAlumno()) {
            entidad.setAlumnoId(acceso.exigirAlumnoIdPropio());
        }
        acceso.exigirCrearEntrega(entidad);
        return new ResponseEntity<>(servicio.guardar(entidad), HttpStatus.CREATED);
    }

    /**
     * El alumno edita únicamente el contenido y el archivo de su entrega.
     * El maestro califica las entregas de sus asignaciones, sin alterar lo que
     * entregó el alumno.
     */
    @PutMapping("/{id}")
    public ResponseEntity<EntregaTarea> actualizar(@PathVariable Integer id,
                                                   @Valid @RequestBody EntregaTarea entidad) {
        EntregaTarea existente = servicio.buscarPorId(id);
        acceso.exigirEditarEntrega(existente, entidad);

        if (acceso.esAlumno()) {
            entidad.setAlumnoId(existente.getAlumnoId());
            entidad.setTareaId(existente.getTareaId());
            entidad.setFechaEntrega(existente.getFechaEntrega());
            entidad.setEstado(existente.getEstado());
            entidad.setObservacionProfesor(existente.getObservacionProfesor());
        } else if (acceso.esMaestro()) {
            entidad.setAlumnoId(existente.getAlumnoId());
            entidad.setTareaId(existente.getTareaId());
            entidad.setContenido(existente.getContenido());
            entidad.setArchivoEntrega(existente.getArchivoEntrega());
            entidad.setFechaEntrega(existente.getFechaEntrega());
        }

        return ResponseEntity.ok(servicio.actualizar(id, entidad));
    }

    /** Eliminar entregas queda reservado al director. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
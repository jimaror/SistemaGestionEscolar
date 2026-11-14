package com.unmrma.escolar.controlador;

import com.unmrma.escolar.modelo.Tutor;
import com.unmrma.escolar.seguridad.ServicioAutorizacion;
import com.unmrma.escolar.servicio.TutorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tutores")
public class TutorController {

    private final TutorService servicio;
    private final ServicioAutorizacion acceso;

    public TutorController(TutorService servicio, ServicioAutorizacion acceso) {
        this.servicio = servicio;
        this.acceso = acceso;
    }

    /**
     * Director y maestro ven el listado completo. Un tutor solo se ve a sí
     * mismo y un alumno no ve expedientes de tutores.
     */
    @GetMapping
    public List<Tutor> listarTodos() {
        List<Tutor> tutores = servicio.listarTodos();
        if (acceso.puedeVerTodosLosTutores()) {
            return tutores;
        }
        if (acceso.esTutor()) {
            return tutores.stream()
                    .filter(t -> acceso.tutorIdPropio().map(t.getId()::equals).orElse(false))
                    .toList();
        }
        return List.of();
    }

    /** Un alumno o tutor que pida un tutor ajeno recibe 403. */
    @GetMapping("/{id}")
    public ResponseEntity<Tutor> obtenerPorId(@PathVariable Integer id) {
        acceso.exigirVerTutor(id);
        return ResponseEntity.ok(servicio.buscarPorId(id));
    }

    /** La creación de expedientes de tutor es tarea exclusiva del director. */
    @PostMapping
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Tutor> guardar(@Valid @RequestBody Tutor tutor) {
        return new ResponseEntity<>(servicio.guardar(tutor), HttpStatus.CREATED);
    }

    /** La modificación del expediente de tutor es tarea exclusiva del director. */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Tutor> actualizar(@PathVariable Integer id,
                                            @Valid @RequestBody Tutor tutor) {
        return ResponseEntity.ok(servicio.actualizar(id, tutor));
    }

    /** La eliminación del expediente de tutor es tarea exclusiva del director. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

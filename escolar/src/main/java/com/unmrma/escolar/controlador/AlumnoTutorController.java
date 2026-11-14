package com.unmrma.escolar.controlador;

import com.unmrma.escolar.modelo.AlumnoTutor;
import com.unmrma.escolar.seguridad.ServicioAutorizacion;
import com.unmrma.escolar.servicio.AlumnoTutorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alumno-tutores")
public class AlumnoTutorController {

    private final AlumnoTutorService servicio;
    private final ServicioAutorizacion acceso;

    public AlumnoTutorController(AlumnoTutorService servicio, ServicioAutorizacion acceso) {
        this.servicio = servicio;
        this.acceso = acceso;
    }

    /**
     * Director y maestro ven todas las relaciones. Un alumno solo las suyas y
     * un tutor solo las de sus hijos.
     */
    @GetMapping
    public List<AlumnoTutor> listarTodos() {
        List<AlumnoTutor> relaciones = servicio.listarTodos();
        if (acceso.puedeVerTodosLosAlumnoTutores()) {
            return relaciones;
        }
        return relaciones.stream()
                .filter(acceso::puedeVerAlumnoTutor)
                .toList();
    }

    /** Un alumno o tutor que pida una relación ajena recibe 403. */
    @GetMapping("/{id}")
    public ResponseEntity<AlumnoTutor> obtenerPorId(@PathVariable Integer id) {
        AlumnoTutor relacion = servicio.buscarPorId(id);
        acceso.exigirVerAlumnoTutor(relacion);
        return ResponseEntity.ok(relacion);
    }

    /** Vincular alumno y tutor es tarea exclusiva del director. */
    @PostMapping
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<AlumnoTutor> guardar(@Valid @RequestBody AlumnoTutor entidad) {
        return new ResponseEntity<>(servicio.guardar(entidad), HttpStatus.CREATED);
    }

    /** Modificar el vínculo es tarea exclusiva del director. */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<AlumnoTutor> actualizar(@PathVariable Integer id,
                                                  @Valid @RequestBody AlumnoTutor entidad) {
        return ResponseEntity.ok(servicio.actualizar(id, entidad));
    }

    /** Desvincular alumno y tutor es tarea exclusiva del director. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
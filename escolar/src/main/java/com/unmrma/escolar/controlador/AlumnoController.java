package com.unmrma.escolar.controlador;

import com.unmrma.escolar.dtos.alumno.AlumnoActualizarRequest;
import com.unmrma.escolar.dtos.alumno.AlumnoCrearRequest;
import com.unmrma.escolar.dtos.alumno.AlumnoRespuesta;
import com.unmrma.escolar.seguridad.ServicioAutorizacion;
import com.unmrma.escolar.servicio.AlumnoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/alumnos")
public class AlumnoController {

    private final AlumnoService alumnoService;
    private final ServicioAutorizacion acceso;

    public AlumnoController(AlumnoService alumnoService, ServicioAutorizacion acceso) {
        this.alumnoService = alumnoService;
        this.acceso = acceso;
    }

    /**
     * Director y maestro ven el listado completo. Un alumno solo se ve a sí
     * mismo y un tutor solo a sus hijos.
     */
    @GetMapping
    public List<AlumnoRespuesta> listarTodos() {
        List<AlumnoRespuesta> alumnos = alumnoService.listarTodos();
        if (acceso.puedeVerTodosLosAlumnos()) {
            return alumnos;
        }
        Set<Integer> visibles = acceso.idsAlumnosVisibles();
        return alumnos.stream()
                .filter(alumno -> visibles.contains(alumno.getId()))
                .toList();
    }

    /** Un alumno o tutor que pida un ID ajeno recibe 403. */
    @GetMapping("/{id}")
    public ResponseEntity<AlumnoRespuesta> obtenerPorId(@PathVariable Integer id) {
        acceso.exigirVerAlumno(id);
        return ResponseEntity.ok(alumnoService.buscarPorId(id));
    }

    /** La creación de expedientes es tarea exclusiva del director. */
    @PostMapping
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<AlumnoRespuesta> crear(@Valid @RequestBody AlumnoCrearRequest solicitud) {
        return new ResponseEntity<>(alumnoService.crear(solicitud), HttpStatus.CREATED);
    }

    /** La modificación del expediente es tarea exclusiva del director. */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<AlumnoRespuesta> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody AlumnoActualizarRequest solicitud) {
        return ResponseEntity.ok(alumnoService.actualizar(id, solicitud));
    }

    /** La eliminación del expediente es tarea exclusiva del director. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        alumnoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
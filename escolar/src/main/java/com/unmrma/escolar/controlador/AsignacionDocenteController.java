package com.unmrma.escolar.controlador;

import com.unmrma.escolar.dtos.asignaciondocente.AsignacionDocenteActualizarRequest;
import com.unmrma.escolar.dtos.asignaciondocente.AsignacionDocenteCrearRequest;
import com.unmrma.escolar.dtos.asignaciondocente.AsignacionDocenteRespuesta;
import com.unmrma.escolar.servicio.AsignacionDocenteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/asignaciones-docentes")
public class AsignacionDocenteController {

    private final AsignacionDocenteService servicio;

    public AsignacionDocenteController(AsignacionDocenteService servicio) {
        this.servicio = servicio;
    }

    /**
     * Catalogo de consulta: cualquier usuario autenticado puede ver que maestro
     * imparte que asignatura en que seccion.
     */
    @GetMapping
    public List<AsignacionDocenteRespuesta> listarTodos() {
        return servicio.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AsignacionDocenteRespuesta> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(servicio.buscarPorId(id));
    }

    /**
     * Asignar docentes es configuracion institucional: solo el director.
     */
    @PostMapping
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<AsignacionDocenteRespuesta> guardar(
            @Valid @RequestBody AsignacionDocenteCrearRequest solicitud) {
        return new ResponseEntity<>(servicio.guardar(solicitud), HttpStatus.CREATED);
    }

    /**
     * Modificar una asignacion docente es configuracion institucional:
     * solo el director. No se puede cambiar asignatura, seccion ni maestro
     * (solo horas semanales y estado).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<AsignacionDocenteRespuesta> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody AsignacionDocenteActualizarRequest solicitud) {
        return ResponseEntity.ok(servicio.actualizar(id, solicitud));
    }

    /** Eliminar asignaciones docentes queda reservado al director. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

package com.unmrma.escolar.controlador;

import com.unmrma.escolar.modelo.Seccion;
import com.unmrma.escolar.servicio.SeccionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/secciones")
public class SeccionController {

    private final SeccionService servicio;

    public SeccionController(SeccionService servicio) {
        this.servicio = servicio;
    }

    /** Catálogo de consulta: cualquier usuario autenticado puede leerlo. */
    @GetMapping
    public List<Seccion> listarTodos() {
        return servicio.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Seccion> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(servicio.buscarPorId(id));
    }

    /** Crear secciones es configuración institucional: solo el director. */
    @PostMapping
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Seccion> guardar(@Valid @RequestBody Seccion entidad) {
        return new ResponseEntity<>(servicio.guardar(entidad), HttpStatus.CREATED);
    }

    /** Modificar secciones es configuración institucional: solo el director. */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Seccion> actualizar(@PathVariable Integer id,
                                              @Valid @RequestBody Seccion entidad) {
        return ResponseEntity.ok(servicio.actualizar(id, entidad));
    }

    /** Eliminar secciones es configuración institucional: solo el director. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
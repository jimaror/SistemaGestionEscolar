package com.unmrma.escolar.controlador;

import com.unmrma.escolar.modelo.AnioEscolar;
import com.unmrma.escolar.servicio.AnioEscolarService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/anios-escolares")
public class AnioEscolarController {

    private final AnioEscolarService servicio;

    public AnioEscolarController(AnioEscolarService servicio) {
        this.servicio = servicio;
    }

    /** Catálogo de consulta: cualquier usuario autenticado puede leerlo. */
    @GetMapping
    public List<AnioEscolar> listarTodos() {
        return servicio.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnioEscolar> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(servicio.buscarPorId(id));
    }

    /** El calendario escolar lo administra únicamente el director. */
    @PostMapping
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<AnioEscolar> guardar(@Valid @RequestBody AnioEscolar entidad) {
        return new ResponseEntity<>(servicio.guardar(entidad), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<AnioEscolar> actualizar(@PathVariable Integer id,
                                                  @Valid @RequestBody AnioEscolar entidad) {
        return ResponseEntity.ok(servicio.actualizar(id, entidad));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
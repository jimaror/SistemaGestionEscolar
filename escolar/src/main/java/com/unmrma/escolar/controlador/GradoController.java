package com.unmrma.escolar.controlador;

import com.unmrma.escolar.dtos.grado.GradoActualizarRequest;
import com.unmrma.escolar.dtos.grado.GradoCrearRequest;
import com.unmrma.escolar.dtos.grado.GradoRespuesta;
import com.unmrma.escolar.servicio.GradoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grados")
public class GradoController {

    private final GradoService gradoService;

    public GradoController(GradoService gradoService) {
        this.gradoService = gradoService;
    }

    /** Catálogo de consulta: cualquier usuario autenticado puede leerlo. */
    @GetMapping
    public List<GradoRespuesta> listarTodos() {
        return gradoService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GradoRespuesta> obtenerPorId(@PathVariable Byte id) {
        return ResponseEntity.ok(gradoService.buscarPorId(id));
    }

    /** Crear grados es configuración institucional: solo el director. */
    @PostMapping
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<GradoRespuesta> guardar(@Valid @RequestBody GradoCrearRequest solicitud) {
        return new ResponseEntity<>(gradoService.guardar(solicitud), HttpStatus.CREATED);
    }

    /** Modificar grados es configuración institucional: solo el director. */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<GradoRespuesta> actualizar(@PathVariable Byte id,
                                                     @Valid @RequestBody GradoActualizarRequest solicitud) {
        return ResponseEntity.ok(gradoService.actualizar(id, solicitud));
    }

    /** Eliminar grados es configuración institucional: solo el director. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Byte id) {
        gradoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

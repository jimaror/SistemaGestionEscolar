package com.unmrma.escolar.controlador;

import com.unmrma.escolar.dtos.asignatura.AsignaturaActualizarRequest;
import com.unmrma.escolar.dtos.asignatura.AsignaturaCrearRequest;
import com.unmrma.escolar.dtos.asignatura.AsignaturaRespuesta;
import com.unmrma.escolar.servicio.AsignaturaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/asignaturas")
public class AsignaturaController {

    private final AsignaturaService asignaturaService;

    public AsignaturaController(AsignaturaService asignaturaService) {
        this.asignaturaService = asignaturaService;
    }

    /** Catalogo de consulta: cualquier usuario autenticado puede leerlo. */
    @GetMapping
    public List<AsignaturaRespuesta> listarTodas() {
        return asignaturaService.listarTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AsignaturaRespuesta> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(asignaturaService.buscarPorId(id));
    }

    /** Crear asignaturas es configuracion institucional: solo el director. */
    @PostMapping
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<AsignaturaRespuesta> guardar(@Valid @RequestBody AsignaturaCrearRequest solicitud) {
        return new ResponseEntity<>(asignaturaService.guardar(solicitud), HttpStatus.CREATED);
    }

    /** Modificar asignaturas es configuracion institucional: solo el director. */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<AsignaturaRespuesta> actualizar(@PathVariable Integer id,
                                                          @Valid @RequestBody AsignaturaActualizarRequest solicitud) {
        return ResponseEntity.ok(asignaturaService.actualizar(id, solicitud));
    }

    /** Eliminar asignaturas es configuracion institucional: solo el director. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        asignaturaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

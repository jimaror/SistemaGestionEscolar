package com.unmrma.escolar.controlador;

import com.unmrma.escolar.dtos.maestro.MaestroCrearRequest;
import com.unmrma.escolar.dtos.maestro.MaestroRespuesta;
import com.unmrma.escolar.seguridad.ServicioAutorizacion;
import com.unmrma.escolar.servicio.MaestroService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maestros")
public class MaestroController {

    private final MaestroService maestroService;
    private final ServicioAutorizacion acceso;

    public MaestroController(MaestroService maestroService, ServicioAutorizacion acceso) {
        this.maestroService = maestroService;
        this.acceso = acceso;
    }

    /**
     * Director y maestro ven el listado completo. Alumno y tutor no ven
     * expedientes de personal ajenos.
     */
    @GetMapping
    public List<MaestroRespuesta> listarTodos() {
        List<MaestroRespuesta> maestros = maestroService.listarTodos();
        if (acceso.puedeVerTodosLosMaestros()) {
            return maestros;
        }
        return List.of();
    }

    /** Un alumno o tutor que pida un maestro ajeno recibe 403. */
    @GetMapping("/{id}")
    public ResponseEntity<MaestroRespuesta> obtenerPorId(@PathVariable Integer id) {
        acceso.exigirVerMaestro(id);
        return ResponseEntity.ok(maestroService.buscarPorId(id));
    }

    /** La creación de expedientes de maestro es tarea exclusiva del director. */
    @PostMapping
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<MaestroRespuesta> guardar(@Valid @RequestBody MaestroCrearRequest solicitud) {
        return new ResponseEntity<>(maestroService.guardar(solicitud), HttpStatus.CREATED);
    }

    /** La eliminación de expedientes de maestro es tarea exclusiva del director. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        maestroService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

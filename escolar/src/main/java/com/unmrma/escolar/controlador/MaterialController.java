package com.unmrma.escolar.controlador;

import com.unmrma.escolar.dtos.material.MaterialActualizarRequest;
import com.unmrma.escolar.dtos.material.MaterialCrearRequest;
import com.unmrma.escolar.dtos.material.MaterialRespuesta;
import com.unmrma.escolar.seguridad.ServicioAutorizacion;
import com.unmrma.escolar.servicio.MaterialService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materiales")
public class MaterialController {

    private final MaterialService servicio;
    private final ServicioAutorizacion acceso;

    public MaterialController(MaterialService servicio, ServicioAutorizacion acceso) {
        this.servicio = servicio;
        this.acceso = acceso;
    }

    /**
     * Los materiales no contienen datos personales: cualquier usuario
     * autenticado puede consultar el material publicado del colegio.
     */
    @GetMapping
    public List<MaterialRespuesta> listarTodos() {
        return servicio.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialRespuesta> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(servicio.buscarPorId(id));
    }

    /**
     * El director puede publicar materiales en cualquier asignación. El
     * maestro solo en las suyas. Alumno y tutor no pueden crear materiales.
     */
    @PostMapping
    public ResponseEntity<MaterialRespuesta> guardar(@Valid @RequestBody MaterialCrearRequest solicitud) {
        acceso.exigirGestionMaterial(solicitud.getAsignacionDocenteId());
        return new ResponseEntity<>(servicio.guardar(solicitud), HttpStatus.CREATED);
    }

    /**
     * Se valida la asignación original y la nueva para impedir que un maestro
     * mueva un material a una asignación ajena. No se puede cambiar la
     * asignación docente en una actualización.
     */
    @PutMapping("/{id}")
    public ResponseEntity<MaterialRespuesta> actualizar(@PathVariable Integer id,
                                                        @Valid @RequestBody MaterialActualizarRequest solicitud) {
        MaterialRespuesta existente = servicio.buscarPorId(id);
        acceso.exigirGestionMaterial(existente.getAsignacionDocenteId());
        return ResponseEntity.ok(servicio.actualizar(id, solicitud));
    }

    /** Eliminar materiales queda reservado al director. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

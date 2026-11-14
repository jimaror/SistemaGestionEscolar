package com.unmrma.escolar.controlador;

import com.unmrma.escolar.dtos.nota.NotaActualizarRequest;
import com.unmrma.escolar.dtos.nota.NotaCrearRequest;
import com.unmrma.escolar.dtos.nota.NotaRespuesta;
import com.unmrma.escolar.seguridad.ServicioAutorizacion;
import com.unmrma.escolar.servicio.NotaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notas")
public class NotaController {

    private final NotaService notaService;
    private final ServicioAutorizacion acceso;

    public NotaController(NotaService notaService, ServicioAutorizacion acceso) {
        this.notaService = notaService;
        this.acceso = acceso;
    }

    @GetMapping
    public List<NotaRespuesta> listarTodas() {
        List<NotaRespuesta> notas = notaService.listarTodas();
        if (acceso.esDirector() || acceso.esMaestro()) {
            return notas;
        }
        return notas.stream()
                .filter(n -> acceso.puedeVerNotaId(n.getMatriculaId()))
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotaRespuesta> obtenerPorId(@PathVariable Integer id) {
        NotaRespuesta nota = notaService.buscarPorId(id);
        acceso.exigirVerNotaId(nota.getMatriculaId());
        return ResponseEntity.ok(nota);
    }

    @PostMapping
    public ResponseEntity<NotaRespuesta> guardar(@Valid @RequestBody NotaCrearRequest solicitud) {
        acceso.exigirCrearNotaId(solicitud.getMatriculaId(), solicitud.getEvaluacionId());
        return new ResponseEntity<>(notaService.guardar(solicitud, acceso.usuarioId()), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotaRespuesta> actualizar(@PathVariable Integer id,
                                                    @Valid @RequestBody NotaActualizarRequest solicitud) {
        NotaRespuesta existente = notaService.buscarPorId(id);
        acceso.exigirEditarNotaId(existente.getMatriculaId(), existente.getEvaluacionId());
        return ResponseEntity.ok(notaService.actualizar(id, solicitud));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        acceso.exigirEliminarNota(id);
        notaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
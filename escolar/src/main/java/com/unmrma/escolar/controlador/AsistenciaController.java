package com.unmrma.escolar.controlador;

import com.unmrma.escolar.dtos.asistencia.AsistenciaActualizarRequest;
import com.unmrma.escolar.dtos.asistencia.AsistenciaCrearRequest;
import com.unmrma.escolar.dtos.asistencia.AsistenciaRespuesta;
import com.unmrma.escolar.seguridad.ServicioAutorizacion;
import com.unmrma.escolar.servicio.AsistenciaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/asistencias")
public class AsistenciaController {

    private final AsistenciaService servicio;
    private final ServicioAutorizacion acceso;

    public AsistenciaController(AsistenciaService servicio, ServicioAutorizacion acceso) {
        this.servicio = servicio;
        this.acceso = acceso;
    }

    /**
     * Director y maestro ven el listado completo. Un alumno solo ve sus
     * asistencias y un tutor solo las de sus hijos.
     */
    @GetMapping
    public List<AsistenciaRespuesta> listarTodos() {
        List<AsistenciaRespuesta> asistencias = servicio.listarTodos();
        if (acceso.esDirector() || acceso.esMaestro()) {
            return asistencias;
        }
        return asistencias.stream()
                .filter(a -> acceso.puedeVerAsistenciaId(a.getMatriculaId()))
                .toList();
    }

    /** Un alumno o tutor que pida una asistencia ajena recibe 403. */
    @GetMapping("/{id}")
    public ResponseEntity<AsistenciaRespuesta> obtenerPorId(@PathVariable Integer id) {
        AsistenciaRespuesta asistencia = servicio.buscarPorId(id);
        acceso.exigirVerAsistenciaId(asistencia.getMatriculaId());
        return ResponseEntity.ok(asistencia);
    }

    /**
     * El director registra en cualquier asignación; el maestro solo en las
     * suyas. Alumno y tutor no pueden registrar asistencias.
     * El campo registradoPor se fuerza desde la cuenta autenticada.
     */
    @PostMapping
    public ResponseEntity<AsistenciaRespuesta> guardar(
            @Valid @RequestBody AsistenciaCrearRequest solicitud) {
        acceso.exigirGestionAsistencia(solicitud.getAsignacionDocenteId());
        return new ResponseEntity<>(
                servicio.guardar(solicitud, acceso.usuarioId()), HttpStatus.CREATED);
    }

    /**
     * Se valida la asignación tanto del registro actual como de los datos
     * nuevos. No se puede cambiar la matrícula ni el registrador.
     */
    @PutMapping("/{id}")
    public ResponseEntity<AsistenciaRespuesta> actualizar(@PathVariable Integer id,
                                                          @Valid @RequestBody AsistenciaActualizarRequest solicitud) {
        AsistenciaRespuesta existente = servicio.buscarPorId(id);
        acceso.exigirGestionAsistencia(existente.getAsignacionDocenteId());
        return ResponseEntity.ok(servicio.actualizar(id, solicitud));
    }

    /** Eliminar asistencias queda reservado al director. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

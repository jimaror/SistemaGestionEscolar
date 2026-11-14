package com.unmrma.escolar.controlador;

import com.unmrma.escolar.dtos.matricula.MatriculaActualizarRequest;
import com.unmrma.escolar.dtos.matricula.MatriculaCrearRequest;
import com.unmrma.escolar.dtos.matricula.MatriculaRespuesta;
import com.unmrma.escolar.seguridad.ServicioAutorizacion;
import com.unmrma.escolar.servicio.MatriculaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matriculas")
public class MatriculaController {

    private final MatriculaService matriculaService;
    private final ServicioAutorizacion acceso;

    public MatriculaController(MatriculaService matriculaService, ServicioAutorizacion acceso) {
        this.matriculaService = matriculaService;
        this.acceso = acceso;
    }

    /**
     * Director y maestro ven todas las matrículas. Un alumno solo las suyas y
     * un tutor solo las de sus hijos.
     */
    @GetMapping
    public List<MatriculaRespuesta> listarTodas() {
        List<MatriculaRespuesta> matriculas = matriculaService.listarTodas();
        if (acceso.esDirector() || acceso.esMaestro()) {
            return matriculas;
        }
        return matriculas.stream()
                .filter(m -> acceso.puedeVerMatriculaId(m.getAlumnoId()))
                .toList();
    }

    /** Un alumno o tutor que pida una matrícula ajena recibe 403. */
    @GetMapping("/{id}")
    public ResponseEntity<MatriculaRespuesta> obtenerPorId(@PathVariable Integer id) {
        MatriculaRespuesta matricula = matriculaService.buscarPorId(id);
        acceso.exigirVerMatriculaId(matricula.getAlumnoId());
        return ResponseEntity.ok(matricula);
    }

    /**
     * Solo se pueden consultar las matrículas de un alumno que el usuario
     * autenticado tenga permiso para ver.
     */
    @GetMapping("/alumno/{alumnoId}")
    public List<MatriculaRespuesta> listarPorAlumno(@PathVariable Integer alumnoId) {
        acceso.exigirVerAlumno(alumnoId);
        return matriculaService.listarPorAlumno(alumnoId);
    }

    /**
     * El director puede matricular a cualquier alumno. Un alumno solo puede
     * matricularse a sí mismo: se fuerza el alumnoId desde la cuenta
     * autenticada, aunque el cliente envíe otro.
     */
    @PostMapping
    public ResponseEntity<MatriculaRespuesta> guardar(@Valid @RequestBody MatriculaCrearRequest solicitud) {
        if (acceso.esAlumno()) {
            solicitud.setAlumnoId(acceso.exigirAlumnoIdPropio());
        }
        acceso.exigirCrearMatriculaId(solicitud.getAlumnoId());
        return new ResponseEntity<>(matriculaService.guardar(solicitud), HttpStatus.CREATED);
    }

    /**
     * Solo el director edita matrículas. Se conserva el alumno original para
     * impedir mover una matrícula de un alumno a otro.
     */
    @PutMapping("/{id}")
    public ResponseEntity<MatriculaRespuesta> actualizar(@PathVariable Integer id,
                                                         @Valid @RequestBody MatriculaActualizarRequest solicitud) {
        acceso.exigirEditarMatriculaId(id);
        return ResponseEntity.ok(matriculaService.actualizar(id, solicitud));
    }

    /** Eliminar matrículas queda reservado al director. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        acceso.exigirEliminarMatricula(id);
        matriculaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

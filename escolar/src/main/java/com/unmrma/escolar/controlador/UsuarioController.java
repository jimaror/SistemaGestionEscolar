package com.unmrma.escolar.controlador;

import com.unmrma.escolar.modelo.Usuario;
import com.unmrma.escolar.seguridad.ServicioAutorizacion;
import com.unmrma.escolar.servicio.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final ServicioAutorizacion acceso;

    public UsuarioController(UsuarioService usuarioService, ServicioAutorizacion acceso) {
        this.usuarioService = usuarioService;
        this.acceso = acceso;
    }

    /**
     * Listar todos los usuarios queda reservado al director: contiene datos
     * de acceso de todo el personal y alumnos del colegio.
     */
    @GetMapping
    @PreAuthorize("hasRole('Director')")
    public List<Usuario> listarTodos() {
        return usuarioService.listarTodos();
    }

    /** El director ve cualquier usuario; cada usuario ve su propia cuenta. */
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerPorId(@PathVariable Integer id) {
        acceso.exigirVerUsuario(id);
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    /** Crear usuarios es tarea exclusiva del director. */
    @PostMapping
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Usuario> guardar(@Valid @RequestBody Usuario usuario) {
        return new ResponseEntity<>(usuarioService.guardar(usuario), HttpStatus.CREATED);
    }

    /**
     * El director puede editar cualquier usuario. Cada usuario puede editar
     * su propia cuenta, pero no puede cambiar su rol ni su estado.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizar(@PathVariable Integer id,
                                              @Valid @RequestBody Usuario entidad) {
        acceso.exigirEditarUsuario(id);

        if (!acceso.esDirector()) {
            entidad.setRolId(null);
            entidad.setEstado(null);
        }

        return ResponseEntity.ok(usuarioService.actualizar(id, entidad));
    }

    /** Eliminar usuarios queda reservado al director. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Director')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        acceso.exigirEliminarUsuario(id);
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

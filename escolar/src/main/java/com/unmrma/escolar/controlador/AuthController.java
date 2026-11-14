package com.unmrma.escolar.controlador;

import com.unmrma.escolar.dtos.auth.LoginRequest;
import com.unmrma.escolar.dtos.auth.LoginResponse;
import com.unmrma.escolar.dtos.auth.UsuarioActualResponse;
import com.unmrma.escolar.modelo.Usuario;
import com.unmrma.escolar.seguridad.JwtServicio;
import com.unmrma.escolar.seguridad.UsuarioPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtServicio jwtServicio;

    public AuthController(AuthenticationManager authenticationManager, JwtServicio jwtServicio) {
        this.authenticationManager = authenticationManager;
        this.jwtServicio = jwtServicio;
    }

    /**
     * Las credenciales inválidas y las cuentas inactivas las traduce
     * ManejadorGlobalExcepciones a 401 y 403 respectivamente.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest solicitud) {
        Authentication autenticacion = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        solicitud.getUsername(), solicitud.getPassword()));

        UsuarioPrincipal principal = (UsuarioPrincipal) autenticacion.getPrincipal();
        Usuario usuario = principal.getUsuario();
        String token = jwtServicio.generarToken(usuario, principal.getRol());

        LoginResponse respuesta = new LoginResponse(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getEmail(),
                principal.getRol(),
                "Inicio de sesión exitoso",
                token,
                "Bearer",
                jwtServicio.getExpiracionSegundos());

        return ResponseEntity.ok(respuesta);
    }

    /** Devuelve los datos del usuario dueño del token enviado. */
    @GetMapping("/yo")
    public ResponseEntity<UsuarioActualResponse> yo(Authentication autenticacion) {
        UsuarioPrincipal principal = (UsuarioPrincipal) autenticacion.getPrincipal();
        Usuario usuario = principal.getUsuario();

        UsuarioActualResponse respuesta = new UsuarioActualResponse(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getEmail(),
                principal.getRol(),
                usuario.getNombres(),
                usuario.getApellidos(),
                usuario.getEstado());

        return ResponseEntity.ok(respuesta);
    }
}

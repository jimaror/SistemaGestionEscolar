package com.unmrma.escolar.seguridad;

import com.unmrma.escolar.modelo.Rol;
import com.unmrma.escolar.modelo.Usuario;
import com.unmrma.escolar.repositorio.RolRepository;
import com.unmrma.escolar.repositorio.UsuarioRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioDetallesServicio implements UserDetailsService {

    private final UsuarioRepository usuarios;
    private final RolRepository roles;

    public UsuarioDetallesServicio(UsuarioRepository usuarios, RolRepository roles) {
        this.usuarios = usuarios;
        this.roles = roles;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarios.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        String nombreRol = roles.findById(usuario.getRolId())
                .map(Rol::getNombre)
                .orElse("Alumno");

        return new UsuarioPrincipal(usuario, nombreRol);
    }
}

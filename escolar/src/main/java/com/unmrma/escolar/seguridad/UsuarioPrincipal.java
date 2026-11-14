package com.unmrma.escolar.seguridad;

import com.unmrma.escolar.modelo.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Adapta la entidad Usuario al modelo de Spring Security.
 * El rol se toma de la tabla "roles" (id_rol -> nombre).
 */
public class UsuarioPrincipal implements UserDetails {

    private final Usuario usuario;
    private final String rol;

    public UsuarioPrincipal(Usuario usuario, String rol) {
        this.usuario = usuario;
        this.rol = rol;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public String getRol() {
        return rol;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol));
    }

    @Override
    public String getPassword() {
        return usuario.getPassword();
    }

    @Override
    public String getUsername() {
        return usuario.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * En la base el estado activo se guarda como "1" (varchar). También se aceptan
     * variantes legibles como "Activo" por si más adelante se cambia el formato.
     */
    @Override
    public boolean isEnabled() {
        String estado = usuario.getEstado();
        if (estado == null || estado.isBlank()) {
            return true;
        }
        String valor = estado.trim();
        return "1".equals(valor)
                || "true".equalsIgnoreCase(valor)
                || "activo".equalsIgnoreCase(valor);
    }
}

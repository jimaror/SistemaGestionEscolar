package com.unmrma.escolar.servicio;

import com.unmrma.escolar.modelo.Usuario;
import com.unmrma.escolar.repositorio.UsuarioRepository;
import com.unmrma.escolar.excepcion.RecursoNoEncontradoException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository repositorio;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repositorio, PasswordEncoder passwordEncoder) {
        this.repositorio = repositorio;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> listarTodos() {
        return repositorio.findAll();
    }

    public Usuario buscarPorId(Integer id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario con ID " + id + " no encontrado"));
    }

    public Optional<Usuario> obtenerPorId(Integer id) {
        return repositorio.findById(id);
    }

    public Optional<Usuario> obtenerPorUsername(String username) {
        return repositorio.findByUsername(username);
    }

    /**
     * Guarda el usuario. Si trae contraseña, la almacena con BCrypt.
     */
    public Usuario guardar(Usuario usuario) {
        String clave = usuario.getPassword();
        if (clave != null && !clave.isBlank()) {
            usuario.setPassword(passwordEncoder.encode(clave));
        }
        return repositorio.save(usuario);
    }

    public Usuario actualizar(Integer id, Usuario datos) {
        return repositorio.findById(id).map(entidad -> {
            if (datos.getUsername() != null) entidad.setUsername(datos.getUsername());
            if (datos.getEmail() != null) entidad.setEmail(datos.getEmail());
            if (datos.getPassword() != null && !datos.getPassword().isBlank()) {
                entidad.setPassword(passwordEncoder.encode(datos.getPassword()));
            }
            if (datos.getNombres() != null) entidad.setNombres(datos.getNombres());
            if (datos.getApellidos() != null) entidad.setApellidos(datos.getApellidos());
            if (datos.getSexo() != null) entidad.setSexo(datos.getSexo());
            if (datos.getFechaNacimiento() != null) entidad.setFechaNacimiento(datos.getFechaNacimiento());
            if (datos.getCedula() != null) entidad.setCedula(datos.getCedula());
            if (datos.getCodigoUnico() != null) entidad.setCodigoUnico(datos.getCodigoUnico());
            if (datos.getTelefono() != null) entidad.setTelefono(datos.getTelefono());
            if (datos.getDireccion() != null) entidad.setDireccion(datos.getDireccion());
            if (datos.getBarrio() != null) entidad.setBarrio(datos.getBarrio());
            if (datos.getZona() != null) entidad.setZona(datos.getZona());
            if (datos.getReferencias() != null) entidad.setReferencias(datos.getReferencias());
            if (datos.getTelefonoAlterno() != null) entidad.setTelefonoAlterno(datos.getTelefonoAlterno());
            if (datos.getFotoPerfil() != null) entidad.setFotoPerfil(datos.getFotoPerfil());
            if (datos.getRolId() != null) entidad.setRolId(datos.getRolId());
            if (datos.getEstado() != null) entidad.setEstado(datos.getEstado());
            return repositorio.save(entidad);
        }).orElseThrow(() -> new RecursoNoEncontradoException("Usuario con ID " + id + " no encontrado"));
    }

    public void eliminar(Integer id) {
        if (!repositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("Usuario con ID " + id + " no encontrado");
        }
        repositorio.deleteById(id);
    }
}

package com.unmrma.escolar.seguridad;

import com.unmrma.escolar.modelo.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtServicio {

    private final SecretKey clave;
    private final long expiracionMs;

    public JwtServicio(@Value("${app.jwt.secret}") String secreto,
                       @Value("${app.jwt.expiracion-minutos:480}") long expiracionMinutos) {
        byte[] bytes = secreto == null ? new byte[0] : secreto.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("app.jwt.secret debe tener al menos 32 caracteres");
        }
        this.clave = Keys.hmacShaKeyFor(bytes);
        this.expiracionMs = expiracionMinutos * 60_000L;
    }

    public String generarToken(Usuario usuario, String rol) {
        Date ahora = new Date();
        String nombre = ((usuario.getNombres() == null ? "" : usuario.getNombres()) + " "
                + (usuario.getApellidos() == null ? "" : usuario.getApellidos())).trim();

        return Jwts.builder()
                .subject(usuario.getUsername())
                .claim("uid", usuario.getId())
                .claim("rol", rol)
                .claim("nombre", nombre)
                .issuedAt(ahora)
                .expiration(new Date(ahora.getTime() + expiracionMs))
                .signWith(clave)
                .compact();
    }

    public String extraerUsername(String token) {
        return parsear(token).getSubject();
    }

    public String extraerRol(String token) {
        return parsear(token).get("rol", String.class);
    }

    public long getExpiracionSegundos() {
        return expiracionMs / 1000;
    }

    public boolean esValido(String token, UserDetails usuario) {
        try {
            Claims claims = parsear(token);
            return claims.getSubject() != null
                    && claims.getSubject().equals(usuario.getUsername())
                    && claims.getExpiration() != null
                    && claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parsear(String token) {
        return Jwts.parser()
                .verifyWith(clave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

package com.unmrma.escolar.seguridad;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.regex.Pattern;

/**
 * Encoder compatible con las contraseñas heredadas en texto plano.
 *
 * - Si el valor guardado ya es un hash BCrypt ($2a$, $2b$ o $2y$), compara con BCrypt.
 * - Si no, compara en texto plano.
 *
 * Las contraseñas NUEVAS siempre se guardan con BCrypt (encode).
 * Esto permite migrar los usuarios existentes sin romper su login.
 */
public class AlmacenPasswordEncoder implements PasswordEncoder {

    private static final Pattern BCRYPT = Pattern.compile("^\\$2[aby]\\$\\d{2}\\$.{53}$");

    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

    @Override
    public String encode(CharSequence rawPassword) {
        return bcrypt.encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }
        if (BCRYPT.matcher(encodedPassword).matches()) {
            return bcrypt.matches(rawPassword, encodedPassword);
        }
        return encodedPassword.equals(rawPassword.toString());
    }
}

package com.unmrma.escolar.dtos.auth;

public class LoginResponse {

    private final Integer id;
    private final String username;
    private final String email;
    private final String rol;
    private final String mensaje;
    private final String token;
    private final String tipo;
    private final long expiraEn;

    public LoginResponse(Integer id, String username, String email, String rol, String mensaje) {
        this(id, username, email, rol, mensaje, null, null, 0);
    }

    public LoginResponse(Integer id, String username, String email, String rol, String mensaje,
                         String token, String tipo, long expiraEn) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.rol = rol;
        this.mensaje = mensaje;
        this.token = token;
        this.tipo = tipo;
        this.expiraEn = expiraEn;
    }

    public Integer getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getRol() {
        return rol;
    }

    public String getMensaje() {
        return mensaje;
    }

    public String getToken() {
        return token;
    }

    public String getTipo() {
        return tipo;
    }

    /** Segundos de validez del token. */
    public long getExpiraEn() {
        return expiraEn;
    }
}

package com.unmrma.escolar.configuracion;

import com.unmrma.escolar.seguridad.AlmacenPasswordEncoder;
import com.unmrma.escolar.seguridad.JwtFiltro;
import com.unmrma.escolar.seguridad.RestAccessDeniedHandler;
import com.unmrma.escolar.seguridad.RestAuthenticationEntryPoint;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SeguridadConfig {

    private final JwtFiltro jwtFiltro;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;

    public SeguridadConfig(JwtFiltro jwtFiltro,
                           RestAuthenticationEntryPoint authenticationEntryPoint,
                           RestAccessDeniedHandler accessDeniedHandler) {
        this.jwtFiltro = jwtFiltro;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(sesion -> sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                    .authenticationEntryPoint(authenticationEntryPoint)
                    .accessDeniedHandler(accessDeniedHandler))
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers("/api/auth/login", "/api/salud", "/error").permitAll()
                    // Solo el director administra usuarios
                    .requestMatchers("/api/usuarios/**").hasRole("Director")
                    // Lectura: cualquier usuario autenticado
                    .requestMatchers(HttpMethod.GET, "/api/**").authenticated()
                    // Participación de alumnos y tutores: mensajería, justificaciones
                    // y entregas. El controlador valida además la pertenencia.
                    .requestMatchers(HttpMethod.POST,
                            "/api/conversaciones/**",
                            "/api/conversacion-participantes/**",
                            "/api/mensajes/**",
                            "/api/justificaciones-ausencia/**",
                            "/api/entregas-tareas/**")
                    .hasAnyRole("Director", "Maestro", "Alumno", "Tutor")
                    .requestMatchers(HttpMethod.PUT,
                            "/api/conversaciones/**",
                            "/api/conversacion-participantes/**",
                            "/api/mensajes/**",
                            "/api/justificaciones-ausencia/**",
                            "/api/entregas-tareas/**")
                    .hasAnyRole("Director", "Maestro", "Alumno", "Tutor")
                    .requestMatchers(HttpMethod.PATCH,
                            "/api/conversaciones/**",
                            "/api/conversacion-participantes/**",
                            "/api/mensajes/**",
                            "/api/justificaciones-ausencia/**",
                            "/api/entregas-tareas/**")
                    .hasAnyRole("Director", "Maestro", "Alumno", "Tutor")
                    // Escritura académica: director y maestros
                    .requestMatchers(HttpMethod.POST, "/api/**").hasAnyRole("Director", "Maestro")
                    .requestMatchers(HttpMethod.PUT, "/api/**").hasAnyRole("Director", "Maestro")
                    .requestMatchers(HttpMethod.PATCH, "/api/**").hasAnyRole("Director", "Maestro")
                    // Un participante puede salir por su cuenta de una conversación
                    .requestMatchers(HttpMethod.DELETE, "/api/conversacion-participantes/**")
                    .hasAnyRole("Director", "Maestro", "Alumno", "Tutor")
                    // Borrar: solo director
                    .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("Director")
                    .anyRequest().authenticated())
            .addFilterBefore(jwtFiltro, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS centralizado. Los orígenes se configuran con la propiedad
     * app.cors.origenes (separados por coma). Por defecto se permiten los
     * puertos habituales de desarrollo del frontend.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.origenes:http://localhost:5173,http://localhost:3000,http://localhost:4200}")
            String origenes) {

        CorsConfiguration configuracion = new CorsConfiguration();
        configuracion.setAllowedOrigins(Arrays.stream(origenes.split(","))
                .map(String::trim)
                .filter(origen -> !origen.isEmpty())
                .toList());
        configuracion.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuracion.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuracion.setExposedHeaders(List.of("Location"));
        configuracion.setAllowCredentials(false);
        configuracion.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource fuente = new UrlBasedCorsConfigurationSource();
        fuente.registerCorsConfiguration("/**", configuracion);
        return fuente;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new AlmacenPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuracion)
            throws Exception {
        return configuracion.getAuthenticationManager();
    }
}
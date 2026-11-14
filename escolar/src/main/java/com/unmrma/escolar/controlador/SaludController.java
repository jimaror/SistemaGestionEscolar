package com.unmrma.escolar.controlador;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Endpoint de salud del backend.
 *
 * Lo usan las plataformas de hosting (Render, Railway, Fly.io) para saber si
 * el servicio esta vivo y reiniciarlo si es necesario. Tambien sirve para
 * verificar rapido que la base de datos responde.
 */
@RestController
public class SaludController {

    /**
     * GET /api/salud
     * Devuelve 200 con el estado del servicio si todo esta bien.
     */
    @GetMapping("/api/salud")
    public Map<String, Object> salud() {
        return Map.of(
                "estado", "ok",
                "servicio", "colegio-otto-de-la-rocha",
                "version", "1.0.0");
    }
}

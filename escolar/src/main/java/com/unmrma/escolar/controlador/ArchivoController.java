package com.unmrma.escolar.controlador;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/archivos")
public class ArchivoController {

    /**
     * Carpeta donde se guardan los archivos subidos.
     * Configurable con la propiedad app.archivos.ruta (variable de entorno
     * ARCHIVOS_RUTA en la nube). Relativa al directorio de trabajo.
     */
    @Value("${app.archivos.ruta:./archivos}")
    private String carpetaArchivos;

    private Path ruta(String nombreArchivo) {
        return Paths.get(carpetaArchivos).resolve(nombreArchivo).normalize();
    }

    /**
     * Subir un archivo y obtener su URL para usar en materiales.
     * POST /api/archivos/subir
     */
    @PostMapping("/subir")
    public ResponseEntity<String> subirArchivo(@RequestParam("archivo") MultipartFile archivo) {
        if (archivo.isEmpty()) {
            return ResponseEntity.badRequest().body("El archivo está vacío");
        }
        try {
            String nombreOriginal = archivo.getOriginalFilename();
            String extension = "";
            if (nombreOriginal != null && nombreOriginal.contains(".")) {
                extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
            }
            String nombreArchivo = UUID.randomUUID().toString() + extension;
            Path destino = ruta(nombreArchivo);
            Files.createDirectories(destino.getParent());
            Files.copy(archivo.getInputStream(), destino);
            String url = "/api/archivos/" + nombreArchivo;
            return ResponseEntity.ok(url);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error al subir el archivo: " + e.getMessage());
        }
    }

    /**
     * Servir un archivo por su nombre.
     * GET /api/archivos/{nombreArchivo}
     */
    @GetMapping("/{nombreArchivo:.+}")
    public ResponseEntity<Resource> servirArchivo(@PathVariable String nombreArchivo) {
        try {
            Path archivo = ruta(nombreArchivo);
            if (!Files.exists(archivo)) {
                return ResponseEntity.notFound().build();
            }
            Resource recurso = new FileSystemResource(archivo);
            String contentType = Files.probeContentType(archivo);
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + nombreArchivo + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(recurso);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }
}
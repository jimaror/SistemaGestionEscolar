package com.unmrma.escolar;

import com.unmrma.escolar.repositorio.NotaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class EscolarApplicationTests {

    @Autowired
    private NotaRepository notaRepository;

    @Test
    void contextLoads() {
    }

    @Test
    void notaRepositoryExiste() {
        assertTrue(notaRepository != null);
    }
}
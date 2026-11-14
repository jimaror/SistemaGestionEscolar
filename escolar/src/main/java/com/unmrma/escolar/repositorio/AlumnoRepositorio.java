package com.unmrma.escolar.repositorio;

import com.unmrma.escolar.modelo.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AlumnoRepositorio extends JpaRepository<Alumno, Integer> {

    /** Alumno vinculado a la cuenta autenticada. */
    Optional<Alumno> findByUsuario_Id(Integer idUsuario);
}

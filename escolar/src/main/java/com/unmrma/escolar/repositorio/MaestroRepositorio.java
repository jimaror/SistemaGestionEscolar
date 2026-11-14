package com.unmrma.escolar.repositorio;

import com.unmrma.escolar.modelo.Maestro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MaestroRepositorio extends JpaRepository<Maestro, Integer> {

    /** Maestro vinculado a la cuenta autenticada. */
    Optional<Maestro> findByUsuario_Id(Integer idUsuario);
}

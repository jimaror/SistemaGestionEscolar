package com.unmrma.escolar.repositorio;

import com.unmrma.escolar.modelo.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TutorRepository extends JpaRepository<Tutor, Integer> {

    /** Tutor vinculado a la cuenta autenticada. */
    Optional<Tutor> findByUsuario_Id(Integer idUsuario);
}

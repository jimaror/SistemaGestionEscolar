package com.unmrma.escolar.repositorio;

import com.unmrma.escolar.modelo.AnioEscolar;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnioEscolarRepository extends JpaRepository<AnioEscolar, Integer> {
}
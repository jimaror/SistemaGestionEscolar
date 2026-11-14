package com.unmrma.escolar.repositorio;

import com.unmrma.escolar.modelo.Nota;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotaRepository extends JpaRepository<Nota, Integer> {
}
package com.unmrma.escolar.repositorio;

import com.unmrma.escolar.modelo.Evaluacion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EvaluacionRepository extends JpaRepository<Evaluacion, Integer> {
}
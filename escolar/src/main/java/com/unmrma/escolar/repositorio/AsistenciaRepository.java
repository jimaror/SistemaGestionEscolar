package com.unmrma.escolar.repositorio;

import com.unmrma.escolar.modelo.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AsistenciaRepository extends JpaRepository<Asistencia, Integer> {
}
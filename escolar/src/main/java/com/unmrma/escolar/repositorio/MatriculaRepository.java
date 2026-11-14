package com.unmrma.escolar.repositorio;

import com.unmrma.escolar.modelo.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatriculaRepository extends JpaRepository<Matricula, Integer> {
    List<Matricula> findByAlumno_Id(Integer alumnoId);
}
package com.unmrma.escolar.repositorio;

import com.unmrma.escolar.modelo.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TareaRepository extends JpaRepository<Tarea, Integer> {
}
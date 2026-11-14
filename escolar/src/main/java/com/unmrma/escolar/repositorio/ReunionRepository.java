package com.unmrma.escolar.repositorio;

import com.unmrma.escolar.modelo.Reunion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReunionRepository extends JpaRepository<Reunion, Integer> {
}
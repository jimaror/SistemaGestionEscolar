package com.unmrma.escolar.repositorio;

import com.unmrma.escolar.modelo.Material;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialRepository extends JpaRepository<Material, Integer> {
}
package com.unmrma.escolar.repositorio;

import com.unmrma.escolar.modelo.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MensajeRepository extends JpaRepository<Mensaje, Integer> {
}
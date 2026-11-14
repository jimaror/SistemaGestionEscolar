package com.unmrma.escolar.repositorio;

import com.unmrma.escolar.modelo.Conversacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversacionRepository extends JpaRepository<Conversacion, Integer> {

    List<Conversacion> findByCreadaPor_Id(Integer usuarioId);

    boolean existsByIdAndCreadaPor_Id(Integer id, Integer usuarioId);
}

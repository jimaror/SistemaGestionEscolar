package com.unmrma.escolar.repositorio;

import com.unmrma.escolar.modelo.AsignacionDocente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AsignacionDocenteRepository extends JpaRepository<AsignacionDocente, Integer> {

    List<AsignacionDocente> findByMaestro_Id(Integer maestroId);

    boolean existsByMaestro_IdAndSeccion_Id(Integer maestroId, Integer seccionId);

    boolean existsByMaestro_IdAndId(Integer maestroId, Integer asignacionId);
}

package com.unmrma.escolar.repositorio;

import com.unmrma.escolar.modelo.ReunionParticipante;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReunionParticipanteRepository extends JpaRepository<ReunionParticipante, Integer> {

    boolean existsByReunionIdAndUsuario_Id(Integer reunionId, Integer usuarioId);
}
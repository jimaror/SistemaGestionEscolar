package com.unmrma.escolar.repositorio;

import com.unmrma.escolar.modelo.ConversacionParticipante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversacionParticipanteRepository extends JpaRepository<ConversacionParticipante, Integer> {

    List<ConversacionParticipante> findByUsuario_Id(Integer usuarioId);

    boolean existsByConversacion_IdAndUsuario_Id(Integer conversacionId, Integer usuarioId);
}

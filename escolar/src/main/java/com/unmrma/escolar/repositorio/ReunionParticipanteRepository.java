package com.unmrma.escolar.repositorio;

import com.unmrma.escolar.modelo.ReunionParticipante;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReunionParticipanteRepository extends JpaRepository<ReunionParticipante, Integer> {

    // Los guiones bajos son necesarios: sin ellos Spring Data intenta leer una
    // propiedad "reunionId" (que no existe) en lugar de reunion.id, y lanza 500.
    boolean existsByReunion_IdAndUsuario_Id(Integer reunionId, Integer usuarioId);
}
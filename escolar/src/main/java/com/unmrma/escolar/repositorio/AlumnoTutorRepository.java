package com.unmrma.escolar.repositorio;

import com.unmrma.escolar.modelo.AlumnoTutor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlumnoTutorRepository extends JpaRepository<AlumnoTutor, Integer> {

    List<AlumnoTutor> findByTutor_Id(Integer tutorId);

    List<AlumnoTutor> findByAlumno_Id(Integer alumnoId);

    boolean existsByTutor_IdAndAlumno_Id(Integer tutorId, Integer alumnoId);
}

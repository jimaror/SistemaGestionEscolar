package com.unmrma.escolar.seguridad;

import com.unmrma.escolar.excepcion.AccesoDenegadoException;
import com.unmrma.escolar.modelo.Alumno;
import com.unmrma.escolar.modelo.AlumnoTutor;
import com.unmrma.escolar.modelo.Asistencia;
import com.unmrma.escolar.modelo.Conversacion;
import com.unmrma.escolar.modelo.ConversacionParticipante;
import com.unmrma.escolar.modelo.EntregaTarea;
import com.unmrma.escolar.modelo.Evaluacion;
import com.unmrma.escolar.modelo.JustificacionAusencia;
import com.unmrma.escolar.modelo.Matricula;
import com.unmrma.escolar.modelo.Mensaje;
import com.unmrma.escolar.modelo.Nota;
import com.unmrma.escolar.modelo.Reunion;
import com.unmrma.escolar.modelo.ReunionParticipante;
import com.unmrma.escolar.modelo.Tutor;
import com.unmrma.escolar.repositorio.AlumnoRepositorio;
import com.unmrma.escolar.repositorio.AlumnoTutorRepository;
import com.unmrma.escolar.repositorio.AsignacionDocenteRepository;
import com.unmrma.escolar.repositorio.AsistenciaRepository;
import com.unmrma.escolar.repositorio.ConversacionParticipanteRepository;
import com.unmrma.escolar.repositorio.EvaluacionRepository;
import com.unmrma.escolar.repositorio.ReunionParticipanteRepository;
import com.unmrma.escolar.repositorio.ReunionRepository;
import com.unmrma.escolar.repositorio.ConversacionRepository;
import com.unmrma.escolar.repositorio.MaestroRepositorio;
import com.unmrma.escolar.repositorio.MatriculaRepository;
import com.unmrma.escolar.repositorio.TareaRepository;
import com.unmrma.escolar.repositorio.TutorRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

/**
 * Punto único de autorización por pertenencia.
 *
 * <p>El rol decide el alcance general (director y maestro leen todo, alumno y
 * tutor solo lo propio). Además se comprueba la relación real en la base:
 * alumno-usuario, tutor-alumno, maestro-sección y participación en
 * conversaciones.</p>
 *
 * <p>Los métodos {@code puede...} devuelven un booleano; los {@code exigir...}
 * lanzan {@link AccesoDenegadoException}, que el manejador global traduce a un
 * HTTP 403 con cuerpo JSON.</p>
 */
@Component("acceso")
public class ServicioAutorizacion {

    private final AlumnoRepositorio alumnos;
    private final TutorRepository tutores;
    private final AlumnoTutorRepository alumnoTutores;
    private final MaestroRepositorio maestros;
    private final AsignacionDocenteRepository asignaciones;
    private final ConversacionRepository conversaciones;
    private final ConversacionParticipanteRepository participantes;
    private final TareaRepository tareas;
    private final AsistenciaRepository asistencias;
    private final MatriculaRepository matriculas;
    private final EvaluacionRepository evaluaciones;
    private final ReunionParticipanteRepository reunionParticipantes;
    private final ReunionRepository reuniones;

    public ServicioAutorizacion(AlumnoRepositorio alumnos,
                                TutorRepository tutores,
                                AlumnoTutorRepository alumnoTutores,
                                MaestroRepositorio maestros,
                                AsignacionDocenteRepository asignaciones,
                                ConversacionRepository conversaciones,
                                ConversacionParticipanteRepository participantes,
                                TareaRepository tareas,
                                AsistenciaRepository asistencias,
                                MatriculaRepository matriculas,
                                EvaluacionRepository evaluaciones,
                                ReunionParticipanteRepository reunionParticipantes,
                                ReunionRepository reuniones) {
        this.alumnos = alumnos;
        this.tutores = tutores;
        this.alumnoTutores = alumnoTutores;
        this.maestros = maestros;
        this.asignaciones = asignaciones;
        this.conversaciones = conversaciones;
        this.participantes = participantes;
        this.tareas = tareas;
        this.asistencias = asistencias;
        this.matriculas = matriculas;
        this.evaluaciones = evaluaciones;
        this.reunionParticipantes = reunionParticipantes;
        this.reuniones = reuniones;
    }

    // ------------------------------------------------------------------
    // Identidad y rol
    // ------------------------------------------------------------------

    public UsuarioPrincipal principal() {
        Authentication autenticacion = SecurityContextHolder.getContext().getAuthentication();
        if (autenticacion == null || !(autenticacion.getPrincipal() instanceof UsuarioPrincipal principal)) {
            throw new AccesoDenegadoException("No hay un usuario autenticado");
        }
        return principal;
    }

    public Integer usuarioId() {
        return principal().getUsuario().getId();
    }

    public String rol() {
        return principal().getRol();
    }

    public boolean esDirector() {
        return "Director".equalsIgnoreCase(rol());
    }

    public boolean esMaestro() {
        return "Maestro".equalsIgnoreCase(rol());
    }

    public boolean esAlumno() {
        return "Alumno".equalsIgnoreCase(rol());
    }

    public boolean esTutor() {
        return "Tutor".equalsIgnoreCase(rol());
    }

    public void exigirDirector() {
        if (!esDirector()) {
            throw new AccesoDenegadoException("Solo el director puede realizar esta operación");
        }
    }

    // ------------------------------------------------------------------
    // Identificadores propios
    // ------------------------------------------------------------------

    /** ID del alumno vinculado al usuario autenticado, si su rol es Alumno. */
    public Optional<Integer> alumnoIdPropio() {
        return alumnos.findByUsuario_Id(usuarioId()).map(Alumno::getId);
    }

    /** ID del tutor vinculado al usuario autenticado, si su rol es Tutor. */
    public Optional<Integer> tutorIdPropio() {
        return tutores.findByUsuario_Id(usuarioId()).map(Tutor::getId);
    }

    /** ID del maestro vinculado al usuario autenticado, si su rol es Maestro. */
    public Optional<Integer> maestroIdPropio() {
        return maestros.findByUsuario_Id(usuarioId()).map(m -> m.getId());
    }

    // ------------------------------------------------------------------
    // Alumnos
    // ------------------------------------------------------------------

    /** Director y maestro tienen lectura general; alumno y tutor solo lo suyo. */
    public boolean puedeVerTodosLosAlumnos() {
        return esDirector() || esMaestro();
    }

    public boolean puedeVerAlumno(Integer alumnoId) {
        if (alumnoId == null) {
            return false;
        }
        if (esDirector() || esMaestro()) {
            return true;
        }
        if (esAlumno()) {
            return alumnoIdPropio().map(alumnoId::equals).orElse(false);
        }
        if (esTutor()) {
            return esTutorDeAlumno(alumnoId);
        }
        return false;
    }

    public void exigirVerAlumno(Integer alumnoId) {
        if (!puedeVerAlumno(alumnoId)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para consultar la información de este alumno");
        }
    }

    /** Alumnos que puede listar el usuario. Solo se usa si no ve todos. */
    public Set<Integer> idsAlumnosVisibles() {
        if (puedeVerTodosLosAlumnos()) {
            return Set.of();
        }
        if (esAlumno()) {
            return alumnoIdPropio().map(Set::of).orElse(Set.of());
        }
        if (esTutor()) {
            return tutorIdPropio()
                    .map(tutorId -> alumnoTutores.findByTutor_Id(tutorId).stream()
                            .map(AlumnoTutor::getAlumnoId)
                            .filter(id -> id != null)
                            .collect(java.util.stream.Collectors.toSet()))
                    .orElse(Set.of());
        }
        return Set.of();
    }

    public boolean esTutorDeAlumno(Integer alumnoId) {
        if (alumnoId == null) {
            return false;
        }
        return tutorIdPropio()
                .map(tutorId -> alumnoTutores.existsByTutor_IdAndAlumno_Id(tutorId, alumnoId))
                .orElse(false);
    }

    // ------------------------------------------------------------------
    // Relaciones alumno-tutor
    // ------------------------------------------------------------------

    /** Director y maestro ven todas las relaciones familiares. */
    public boolean puedeVerTodosLosAlumnoTutores() {
        return esDirector() || esMaestro();
    }

    public boolean puedeVerAlumnoTutor(AlumnoTutor relacion) {
        if (relacion == null) {
            return false;
        }
        if (esDirector() || esMaestro()) {
            return true;
        }
        if (esAlumno()) {
            return alumnoIdPropio().map(relacion.getAlumnoId()::equals).orElse(false);
        }
        if (esTutor()) {
            return tutorIdPropio().map(relacion.getTutorId()::equals).orElse(false);
        }
        return false;
    }

    public void exigirVerAlumnoTutor(AlumnoTutor relacion) {
        if (!puedeVerAlumnoTutor(relacion)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para consultar esta relación alumno-tutor");
        }
    }

    // ------------------------------------------------------------------
    // Tutores
    // ------------------------------------------------------------------

    public boolean puedeVerTodosLosTutores() {
        return esDirector() || esMaestro();
    }

    public boolean puedeVerTutor(Integer tutorId) {
        if (tutorId == null) {
            return false;
        }
        if (puedeVerTodosLosTutores()) {
            return true;
        }
        return tutorIdPropio().map(tutorId::equals).orElse(false);
    }

    public void exigirVerTutor(Integer tutorId) {
        if (!puedeVerTutor(tutorId)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para consultar este tutor");
        }
    }

    // ------------------------------------------------------------------
    // Usuarios
    // ------------------------------------------------------------------

    public boolean puedeVerTodosLosUsuarios() {
        return esDirector();
    }

    public boolean puedeVerUsuario(Integer usuarioId) {
        if (usuarioId == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        return usuarioId.equals(this.usuarioId());
    }

    public void exigirVerUsuario(Integer usuarioId) {
        if (!puedeVerUsuario(usuarioId)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para consultar este usuario");
        }
    }

    /**
     * El director puede editar cualquier usuario. Cada usuario solo puede
     * editar su propia cuenta (sin cambiar rol ni estado).
     */
    public boolean puedeEditarUsuario(Integer usuarioId) {
        if (usuarioId == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        return usuarioId.equals(this.usuarioId());
    }

    public void exigirEditarUsuario(Integer usuarioId) {
        if (!puedeEditarUsuario(usuarioId)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para editar este usuario");
        }
    }

    /** Solo el director elimina usuarios. */
    public boolean puedeEliminarUsuario(Integer usuarioId) {
        return esDirector();
    }

    public void exigirEliminarUsuario(Integer usuarioId) {
        if (!puedeEliminarUsuario(usuarioId)) {
            throw new AccesoDenegadoException(
                    "Solo el director puede eliminar usuarios");
        }
    }

    // ------------------------------------------------------------------
    // Maestros
    // ------------------------------------------------------------------

    public boolean puedeVerTodosLosMaestros() {
        return esDirector() || esMaestro();
    }

    public boolean puedeVerMaestro(Integer maestroId) {
        if (maestroId == null) {
            return false;
        }
        if (puedeVerTodosLosMaestros()) {
            return true;
        }
        return maestroIdPropio().map(maestroId::equals).orElse(false);
    }

    public void exigirVerMaestro(Integer maestroId) {
        if (!puedeVerMaestro(maestroId)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para consultar este maestro");
        }
    }

    // ------------------------------------------------------------------
    // Maestro: asignaciones
    // ------------------------------------------------------------------

    /** El maestro autenticado tiene alguna asignación en la sección indicada. */
    public boolean maestroTieneSeccion(Integer seccionId) {
        if (seccionId == null) {
            return false;
        }
        return maestroIdPropio()
                .map(maestroId -> asignaciones.existsByMaestro_IdAndSeccion_Id(maestroId, seccionId))
                .orElse(false);
    }

    /** La asignación docente pertenece al maestro autenticado. */
    public boolean maestroTieneAsignacion(Integer asignacionId) {
        if (asignacionId == null) {
            return false;
        }
        return maestroIdPropio()
                .map(maestroId -> asignaciones.existsByMaestro_IdAndId(maestroId, asignacionId))
                .orElse(false);
    }

    // ------------------------------------------------------------------
    // Matrículas, notas y asistencias
    // ------------------------------------------------------------------

    public boolean puedeVerMatricula(Matricula matricula) {
        if (matricula == null) {
            return false;
        }
        if (esDirector() || esMaestro()) {
            return true;
        }
        return matricula.getAlumno() != null && puedeVerAlumno(matricula.getAlumno().getId());
    }

    public void exigirVerMatricula(Matricula matricula) {
        if (!puedeVerMatricula(matricula)) {
            throw new AccesoDenegadoException("No tienes permiso para consultar esta matrícula");
        }
    }

    /**
     * El director matricula a cualquier alumno. Un alumno solo puede matricularse
     * a sí mismo (su propio expediente). Maestro y tutor no crean matrículas.
     */
    public boolean puedeCrearMatricula(Matricula matricula) {
        if (esDirector()) {
            return true;
        }
        if (!esAlumno() || matricula == null) {
            return false;
        }
        return alumnoIdPropio().map(matricula.getAlumnoId()::equals).orElse(false);
    }

    public void exigirCrearMatricula(Matricula matricula) {
        if (!puedeCrearMatricula(matricula)) {
            throw new AccesoDenegadoException(
                    "Solo puedes matricularte a ti mismo");
        }
    }

    /** Solo el director modifica matrículas existentes. */
    public boolean puedeEditarMatricula(Matricula existente, Matricula datos) {
        if (existente == null || datos == null) {
            return false;
        }
        return esDirector();
    }

    public void exigirEditarMatricula(Matricula existente, Matricula datos) {
        if (!puedeEditarMatricula(existente, datos)) {
            throw new AccesoDenegadoException(
                    "Solo el director puede modificar matrículas");
        }
    }

    /** Solo el director elimina matrículas. */
    public boolean puedeEliminarMatricula(Integer matriculaId) {
        return esDirector();
    }

    public void exigirEliminarMatricula(Integer matriculaId) {
        if (!puedeEliminarMatricula(matriculaId)) {
            throw new AccesoDenegadoException(
                    "Solo el director puede eliminar matrículas");
        }
    }

    /**
     * Verifica si el usuario puede ver la matrícula con el ID de alumno
     * indicado. Director y maestro ven cualquier matrícula; alumno y tutor
     * solo la suya o la de sus hijos.
     */
    public boolean puedeVerMatriculaId(Integer alumnoId) {
        if (alumnoId == null) {
            return false;
        }
        if (esDirector() || esMaestro()) {
            return true;
        }
        return puedeVerAlumno(alumnoId);
    }

    public void exigirVerMatriculaId(Integer alumnoId) {
        if (!puedeVerMatriculaId(alumnoId)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para consultar esta matrícula");
        }
    }

    /**
     * Verifica si el usuario puede crear una matrícula para el alumno
     * indicado. Director puede matricular a cualquier alumno; alumno solo
     * a sí mismo; maestro y tutor no pueden crear matrículas.
     */
    public boolean puedeCrearMatriculaId(Integer alumnoId) {
        if (alumnoId == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        if (!esAlumno()) {
            return false;
        }
        return alumnoIdPropio().map(alumnoId::equals).orElse(false);
    }

    public void exigirCrearMatriculaId(Integer alumnoId) {
        if (!puedeCrearMatriculaId(alumnoId)) {
            throw new AccesoDenegadoException(
                    "Solo puedes matricularte a ti mismo");
        }
    }

    /** Solo el director modifica matrículas existentes. */
    public boolean puedeEditarMatriculaId(Integer matriculaId) {
        return esDirector();
    }

    public void exigirEditarMatriculaId(Integer matriculaId) {
        if (!puedeEditarMatriculaId(matriculaId)) {
            throw new AccesoDenegadoException(
                    "Solo el director puede modificar matrículas");
        }
    }

    public boolean puedeVerNota(Nota nota) {
        if (nota == null) {
            return false;
        }
        if (esDirector() || esMaestro()) {
            return true;
        }
        return nota.getMatricula() != null && puedeVerMatricula(nota.getMatricula());
    }

    public void exigirVerNota(Nota nota) {
        if (!puedeVerNota(nota)) {
            throw new AccesoDenegadoException("No tienes permiso para consultar esta nota");
        }
    }

    // ------------------------------------------------------------------
    // Notas
    // ------------------------------------------------------------------

    private Integer evaluacionIdDeNota(Nota nota) {
        return nota != null && nota.getEvaluacion() != null ? nota.getEvaluacion().getId() : null;
    }

    private Integer matriculaIdDeNota(Nota nota) {
        return nota != null && nota.getMatricula() != null ? nota.getMatricula().getId() : null;
    }

    private Optional<Evaluacion> evaluacionDeNota(Integer evaluacionId) {
        if (evaluacionId == null) {
            return Optional.empty();
        }
        return evaluaciones.findById(evaluacionId);
    }

    /** Verifica si el maestro autenticado tiene al menos una asignación con la asignatura indicada. */
    public boolean maestroTieneAsignatura(Integer asignaturaId) {
        if (asignaturaId == null) {
            return false;
        }
        return maestroIdPropio()
                .map(maestroId -> asignaciones.findByMaestro_Id(maestroId).stream()
                        .anyMatch(asignacion -> asignacion.getAsignaturaId() != null
                                && asignacion.getAsignaturaId().equals(asignaturaId)))
                .orElse(false);
    }

    /**
     * El director gestiona cualquier nota; el maestro solo las de sus propias
     * asignaciones docentes. Alumno y tutor solo leen sus propias notas.
     */
    public boolean puedeGestionarNota(Nota nota) {
        if (esDirector()) {
            return true;
        }
        if (!esMaestro() || nota == null) {
            return false;
        }
        return evaluacionDeNota(evaluacionIdDeNota(nota))
                .map(evaluacion -> maestroTieneAsignacion(evaluacion.getAsignacionDocenteId()))
                .orElse(false);
    }

    public void exigirGestionarNota(Nota nota) {
        if (!puedeGestionarNota(nota)) {
            throw new AccesoDenegadoException(
                    "Solo puedes gestionar notas de tus propias asignaciones");
        }
    }

    /** Crear notas es potestad del director y del maestro en sus asignaciones. */
    public boolean puedeCrearNota(Nota nota) {
        if (esDirector()) {
            return true;
        }
        if (!esMaestro() || nota == null) {
            return false;
        }
        return evaluacionDeNota(evaluacionIdDeNota(nota))
                .map(evaluacion -> maestroTieneAsignacion(evaluacion.getAsignacionDocenteId()))
                .orElse(false);
    }

    public void exigirCrearNota(Nota nota) {
        if (!puedeCrearNota(nota)) {
            throw new AccesoDenegadoException(
                    "Solo puedes registrar notas de tus propias asignaciones");
        }
    }

    /**
     * Editar notas: el director puede editar cualquiera. El maestro solo las de
     * sus asignaciones, y no puede mover la nota a una matrícula o evaluación
     * ajena.
     */
    public boolean puedeEditarNota(Nota existente, Nota datos) {
        if (existente == null || datos == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        if (!esMaestro()) {
            return false;
        }
        boolean originalPropia = evaluacionDeNota(evaluacionIdDeNota(existente))
                .map(evaluacion -> maestroTieneAsignacion(evaluacion.getAsignacionDocenteId()))
                .orElse(false);
        Integer datosEvalId = evaluacionIdDeNota(datos);
        boolean nuevaPropia = datosEvalId == null
                || evaluacionDeNota(datosEvalId)
                    .map(evaluacion -> maestroTieneAsignacion(evaluacion.getAsignacionDocenteId()))
                    .orElse(false);
        Integer datosMatId = matriculaIdDeNota(datos);
        Integer existenteMatId = matriculaIdDeNota(existente);
        boolean mismaMatricula = datosMatId == null || datosMatId.equals(existenteMatId);
        return originalPropia && nuevaPropia && mismaMatricula;
    }

    public void exigirEditarNota(Nota existente, Nota datos) {
        if (!puedeEditarNota(existente, datos)) {
            throw new AccesoDenegadoException(
                    "No puedes modificar esta nota");
        }
    }

    /** Eliminar notas queda reservado al director. */
    public boolean puedeEliminarNota(Integer notaId) {
        return esDirector();
    }

    public void exigirEliminarNota(Integer notaId) {
        if (!puedeEliminarNota(notaId)) {
            throw new AccesoDenegadoException(
                    "Solo el director puede eliminar notas");
        }
    }

    /**
     * Verifica si el usuario puede ver la nota con el ID de matrícula indicado.
     * Director y maestro ven cualquier nota; alumno y tutor solo las de su
     * alumno propio o sus hijos.
     */
    public boolean puedeVerNotaId(Integer matriculaId) {
        return puedeVerMatriculaId(matriculaId);
    }

    public void exigirVerNotaId(Integer matriculaId) {
        if (!puedeVerNotaId(matriculaId)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para consultar esta nota");
        }
    }

    /**
     * Verifica si el usuario puede crear una nota para la matrícula y
     * evaluación indicadas. Director puede crear en cualquiera; maestro solo
     * en las de sus propias asignaciones docentes.
     */
    public boolean puedeCrearNotaId(Integer matriculaId, Integer evaluacionId) {
        if (esDirector()) {
            return true;
        }
        if (!esMaestro() || evaluacionId == null) {
            return false;
        }
        return evaluacionDeNota(evaluacionId)
                .map(evaluacion -> maestroTieneAsignacion(evaluacion.getAsignacionDocenteId()))
                .orElse(false);
    }

    public void exigirCrearNotaId(Integer matriculaId, Integer evaluacionId) {
        if (!puedeCrearNotaId(matriculaId, evaluacionId)) {
            throw new AccesoDenegadoException(
                    "Solo puedes registrar notas de tus propias asignaciones");
        }
    }

    /**
     * Verifica si el usuario puede editar una nota con la matrícula y
     * evaluación indicadas. Director puede editar cualquiera; maestro solo
     * las de sus propias asignaciones docentes.
     */
    public boolean puedeEditarNotaId(Integer matriculaId, Integer evaluacionId) {
        if (esDirector()) {
            return true;
        }
        if (!esMaestro() || evaluacionId == null) {
            return false;
        }
        return evaluacionDeNota(evaluacionId)
                .map(evaluacion -> maestroTieneAsignacion(evaluacion.getAsignacionDocenteId()))
                .orElse(false);
    }

    public void exigirEditarNotaId(Integer matriculaId, Integer evaluacionId) {
        if (!puedeEditarNotaId(matriculaId, evaluacionId)) {
            throw new AccesoDenegadoException(
                    "No puedes modificar esta nota");
        }
    }

    public boolean puedeVerAsistencia(Asistencia asistencia) {
        if (asistencia == null) {
            return false;
        }
        if (esDirector() || esMaestro()) {
            return true;
        }
        return puedeVerMatricula(asistencia.getMatricula());
    }

    public void exigirVerAsistencia(Asistencia asistencia) {
        if (!puedeVerAsistencia(asistencia)) {
            throw new AccesoDenegadoException("No tienes permiso para consultar esta asistencia");
        }
    }

    /**
     * Verifica si el usuario puede ver la asistencia con el ID de matrícula
     * indicado. Director y maestro ven cualquier matrícula; alumno y tutor
     * solo la suya o la de sus hijos.
     */
    public boolean puedeVerAsistenciaId(Integer matriculaId) {
        if (matriculaId == null) {
            return false;
        }
        if (esDirector() || esMaestro()) {
            return true;
        }
        // Cargar la matricula para verificar el alumno
        return matriculas.findById(matriculaId)
                .map(this::puedeVerMatricula)
                .orElse(false);
    }

    public void exigirVerAsistenciaId(Integer matriculaId) {
        if (!puedeVerAsistenciaId(matriculaId)) {
            throw new AccesoDenegadoException("No tienes permiso para consultar esta asistencia");
        }
    }

    /**
     * Un maestro solo puede registrar o modificar asistencias de sus propias
     * asignaciones docentes. El director puede hacerlo en cualquier asignación.
     */
    public boolean puedeGestionarAsistencia(Asistencia asistencia) {
        if (asistencia == null) {
            return false;
        }
        return puedeGestionarAsistencia(asistencia.getAsignacionDocenteId());
    }

    /**
     * Verifica si el usuario puede gestionar asistencias de la asignación
     * indicada por ID.
     */
    public boolean puedeGestionarAsistencia(Integer asignacionDocenteId) {
        if (esDirector()) {
            return true;
        }
        return esMaestro() && maestroTieneAsignacion(asignacionDocenteId);
    }

    public void exigirGestionAsistencia(Asistencia asistencia) {
        exigirGestionAsistencia(asistencia.getAsignacionDocenteId());
    }

    public void exigirGestionAsistencia(Integer asignacionDocenteId) {
        if (!puedeGestionarAsistencia(asignacionDocenteId)) {
            throw new AccesoDenegadoException(
                    "Solo puedes registrar asistencias de tus propias asignaciones");
        }
    }

    // ------------------------------------------------------------------
    // Justificaciones de ausencia
    // ------------------------------------------------------------------

    /**
     * Carga la asistencia real desde la base. No se usa la relación de la
     * entidad porque en las peticiones POST/PUT llega como referencia mínima
     * (solo el ID) y su matrícula vendría nula.
     */
    private Optional<Asistencia> asistenciaDeJustificacion(Integer asistenciaId) {
        if (asistenciaId == null) {
            return Optional.empty();
        }
        return asistencias.findById(asistenciaId);
    }

    public boolean puedeVerJustificacion(JustificacionAusencia justificacion) {
        if (justificacion == null) {
            return false;
        }
        if (esDirector() || esMaestro()) {
            return true;
        }
        return asistenciaDeJustificacion(justificacion.getAsistenciaId())
                .map(this::puedeVerAsistencia)
                .orElse(false);
    }

    public void exigirVerJustificacion(JustificacionAusencia justificacion) {
        if (!puedeVerJustificacion(justificacion)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para consultar esta justificación");
        }
    }

    /**
     * Verifica si el usuario puede ver la justificación con el ID de asistencia
     * indicado. Director y maestro ven cualquier asistencia; alumno y tutor
     * solo la suya o la de sus hijos.
     */
    public boolean puedeVerJustificacionId(Integer asistenciaId) {
        if (asistenciaId == null) {
            return false;
        }
        if (esDirector() || esMaestro()) {
            return true;
        }
        return asistencias.findById(asistenciaId)
                .map(this::puedeVerAsistencia)
                .orElse(false);
    }

    public void exigirVerJustificacionId(Integer asistenciaId) {
        if (!puedeVerJustificacionId(asistenciaId)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para consultar esta justificación");
        }
    }

    /**
     * El director registra justificaciones para cualquier alumno. El alumno y
     * el tutor solo pueden justificar ausencias propias o de sus hijos. El
     * maestro consulta, pero no crea justificaciones.
     */
    public boolean puedeCrearJustificacion(JustificacionAusencia justificacion) {
        if (esDirector()) {
            return true;
        }
        if ((!esAlumno() && !esTutor()) || justificacion == null) {
            return false;
        }
        return asistenciaDeJustificacion(justificacion.getAsistenciaId())
                .map(this::puedeVerAsistencia)
                .orElse(false);
    }

    public void exigirCrearJustificacion(JustificacionAusencia justificacion) {
        if (!puedeCrearJustificacion(justificacion)) {
            throw new AccesoDenegadoException(
                    "Solo puedes justificar ausencias propias o de tus hijos");
        }
    }

    /**
     * Verifica si el usuario puede editar la justificación con el ID de
     * asistencia indicado y el estado actual dado. Director puede editar
     * cualquiera; alumno y tutor solo las propias mientras estén pendientes.
     */
    public boolean puedeEditarJustificacionId(Integer asistenciaId, String estadoActual) {
        if (asistenciaId == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        if (!esAlumno() && !esTutor()) {
            return false;
        }
        boolean duena = asistencias.findById(asistenciaId)
                .map(this::puedeVerAsistencia)
                .orElse(false);
        boolean pendiente = estadoActual == null
                || "Pendiente".equalsIgnoreCase(estadoActual);
        return duena && pendiente;
    }

    public void exigirEditarJustificacionId(Integer asistenciaId, String estadoActual) {
        if (!puedeEditarJustificacionId(asistenciaId, estadoActual)) {
            throw new AccesoDenegadoException(
                    "No puedes modificar esta justificación: solo se editan las propias pendientes");
        }
    }

    /**
     * Mientras la justificación está pendiente, el alumno o tutor dueño puede
     * corregir el motivo, las fechas y el documento, sin cambiar de asistencia
     * ni aprobarse a sí mismo. Ya resuelta, solo el director puede editarla.
     */
    public boolean puedeEditarJustificacion(JustificacionAusencia existente,
                                            JustificacionAusencia datos) {
        if (existente == null || datos == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        if (!esAlumno() && !esTutor()) {
            return false;
        }
        boolean duena = asistenciaDeJustificacion(existente.getAsistenciaId())
                .map(this::puedeVerAsistencia)
                .orElse(false);
        boolean mismaAsistencia = datos.getAsistenciaId() == null
                || datos.getAsistenciaId().equals(existente.getAsistenciaId());
        boolean pendiente = existente.getEstado() == null
                || "Pendiente".equalsIgnoreCase(existente.getEstado());
        return duena && mismaAsistencia && pendiente;
    }

    public void exigirEditarJustificacion(JustificacionAusencia existente,
                                          JustificacionAusencia datos) {
        if (!puedeEditarJustificacion(existente, datos)) {
            throw new AccesoDenegadoException(
                    "No puedes modificar esta justificación: solo se editan las propias pendientes");
        }
    }

    // ------------------------------------------------------------------
    // Materiales
    // ------------------------------------------------------------------

    /**
     * El director gestiona cualquier material; el maestro solo los de sus
     * asignaciones docentes. Alumno y tutor solo leen.
     */
    public boolean puedeGestionarMaterial(Integer asignacionDocenteId) {
        if (esDirector()) {
            return true;
        }
        return esMaestro() && maestroTieneAsignacion(asignacionDocenteId);
    }

    public void exigirGestionMaterial(Integer asignacionDocenteId) {
        if (!puedeGestionarMaterial(asignacionDocenteId)) {
            throw new AccesoDenegadoException(
                    "Solo puedes gestionar materiales de tus propias asignaciones");
        }
    }

    // ------------------------------------------------------------------
    // Tareas
    // ------------------------------------------------------------------

    /**
     * El director gestiona cualquier tarea; el maestro solo las de sus
     * asignaciones docentes. Alumno y tutor solo leen.
     */
    public boolean puedeGestionarTarea(Integer asignacionDocenteId) {
        if (esDirector()) {
            return true;
        }
        return esMaestro() && maestroTieneAsignacion(asignacionDocenteId);
    }

    public void exigirGestionarTarea(Integer asignacionDocenteId) {
        if (!puedeGestionarTarea(asignacionDocenteId)) {
            throw new AccesoDenegadoException(
                    "Solo puedes gestionar tareas de tus propias asignaciones");
        }
    }

    // ------------------------------------------------------------------
    // Evaluaciones
    // ------------------------------------------------------------------

    /**
     * El director gestiona cualquier evaluación; el maestro solo las de sus
     * asignaciones docentes. Alumno y tutor no crean ni modifican evaluaciones.
     */
    public boolean puedeGestionarEvaluacion(Integer asignacionDocenteId) {
        if (esDirector()) {
            return true;
        }
        return esMaestro() && maestroTieneAsignacion(asignacionDocenteId);
    }

    public void exigirGestionEvaluacion(Integer asignacionDocenteId) {
        if (!puedeGestionarEvaluacion(asignacionDocenteId)) {
            throw new AccesoDenegadoException(
                    "Solo puedes gestionar evaluaciones de tus propias asignaciones");
        }
    }

    // ------------------------------------------------------------------
    // Entregas de tareas
    // ------------------------------------------------------------------

    /** La tarea pertenece a una asignación del maestro autenticado. */
    public boolean maestroTieneTarea(Integer tareaId) {
        if (tareaId == null) {
            return false;
        }
        return tareas.findById(tareaId)
                .map(tarea -> maestroTieneAsignacion(tarea.getAsignacionDocenteId()))
                .orElse(false);
    }

    public boolean puedeVerEntrega(EntregaTarea entrega) {
        if (entrega == null) {
            return false;
        }
        if (esDirector() || esMaestro()) {
            return true;
        }
        return puedeVerAlumno(entrega.getAlumnoId());
    }

    public void exigirVerEntrega(EntregaTarea entrega) {
        if (!puedeVerEntrega(entrega)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para consultar esta entrega");
        }
    }

    /**
     * Solo el alumno dueño puede crear su entrega. El director puede crear
     * cualquiera; el maestro califica, no entrega, y el tutor no entrega.
     */
    public boolean puedeCrearEntrega(EntregaTarea entrega) {
        if (esDirector()) {
            return true;
        }
        if (!esAlumno() || entrega == null) {
            return false;
        }
        return alumnoIdPropio().map(entrega.getAlumnoId()::equals).orElse(false);
    }

    public void exigirCrearEntrega(EntregaTarea entrega) {
        if (!puedeCrearEntrega(entrega)) {
            throw new AccesoDenegadoException(
                    "Solo puedes registrar entregas propias de tareas");
        }
    }

    /**
     * El alumno edita su propia entrega. El maestro solo puede calificar
     * entregas de tareas que pertenecen a sus asignaciones. El tutor no edita.
     */
    public boolean puedeEditarEntrega(EntregaTarea existente, EntregaTarea datos) {
        if (existente == null || datos == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        if (esMaestro()) {
            boolean tareaActualPropia = maestroTieneTarea(existente.getTareaId());
            boolean tareaNuevaPropia = datos.getTareaId() == null
                    || maestroTieneTarea(datos.getTareaId());
            return tareaActualPropia && tareaNuevaPropia;
        }
        if (esAlumno()) {
            boolean entregaPropia = alumnoIdPropio()
                    .map(existente.getAlumnoId()::equals)
                    .orElse(false);
            boolean mismoAlumno = datos.getAlumnoId() == null
                    || datos.getAlumnoId().equals(existente.getAlumnoId());
            return entregaPropia && mismoAlumno;
        }
        return false;
    }

    public void exigirEditarEntrega(EntregaTarea existente, EntregaTarea datos) {
        if (!puedeEditarEntrega(existente, datos)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para modificar esta entrega");
        }
    }

    /** Devuelve el ID del alumno propio o corta la operación con 403. */
    public Integer exigirAlumnoIdPropio() {
        return alumnoIdPropio().orElseThrow(() -> new AccesoDenegadoException(
                "Tu usuario no tiene un expediente de alumno asociado"));
    }

    // ------------------------------------------------------------------
    // Conversaciones y mensajes
    // ------------------------------------------------------------------

    public boolean puedeVerTodasLasConversaciones() {
        return esDirector();
    }

    public boolean puedeVerConversacion(Integer conversacionId) {
        if (conversacionId == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        Integer usuarioId = usuarioId();
        return conversaciones.existsByIdAndCreadaPor_Id(conversacionId, usuarioId)
                || participantes.existsByConversacion_IdAndUsuario_Id(conversacionId, usuarioId);
    }

    public boolean puedeVerConversacion(Conversacion conversacion) {
        return conversacion != null && puedeVerConversacion(conversacion.getId());
    }

    public void exigirVerConversacion(Integer conversacionId) {
        if (!puedeVerConversacion(conversacionId)) {
            throw new AccesoDenegadoException("No tienes permiso para consultar esta conversación");
        }
    }

    /**
     * Solo el creador de la conversación (o el director) puede cambiar sus
     * datos. Un participante puede leer y escribir mensajes, pero no editar la
     * conversación.
     */
    public boolean puedeEditarConversacion(Integer conversacionId) {
        if (esDirector()) {
            return true;
        }
        return conversacionId != null
                && conversaciones.existsByIdAndCreadaPor_Id(conversacionId, usuarioId());
    }

    public void exigirEditarConversacion(Integer conversacionId) {
        if (!puedeEditarConversacion(conversacionId)) {
            throw new AccesoDenegadoException("Solo el creador puede modificar esta conversación");
        }
    }

    /**
     * Agregar o modificar participantes es potestad del creador de la
     * conversación o del director.
     */
    public boolean puedeGestionarParticipantes(Integer conversacionId) {
        return puedeEditarConversacion(conversacionId);
    }

    public void exigirGestionarParticipantes(Integer conversacionId) {
        if (!puedeGestionarParticipantes(conversacionId)) {
            throw new AccesoDenegadoException(
                    "Solo el creador de la conversación puede gestionar sus participantes");
        }
    }

    public boolean puedeVerParticipante(ConversacionParticipante participante) {
        return participante != null && puedeVerConversacion(participante.getConversacionId());
    }

    public void exigirVerParticipante(ConversacionParticipante participante) {
        if (!puedeVerParticipante(participante)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para consultar este participante");
        }
    }

    /**
     * Puede eliminar la participación el director, el creador de la
     * conversación o el propio participante (salirse del chat).
     */
    public boolean puedeEliminarParticipante(ConversacionParticipante participante) {
        if (participante == null) {
            return false;
        }
        if (esDirector() || puedeGestionarParticipantes(participante.getConversacionId())) {
            return true;
        }
        return usuarioId().equals(participante.getUsuarioId());
    }

    public void exigirEliminarParticipante(ConversacionParticipante participante) {
        if (!puedeEliminarParticipante(participante)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para eliminar este participante");
        }
    }

    /**
     * Verifica si el usuario puede ver participantes de una conversacion por ID.
     */
    public boolean puedeVerParticipanteId(Integer conversacionId) {
        return puedeVerConversacion(conversacionId);
    }

    public void exigirVerParticipanteId(Integer conversacionId) {
        if (!puedeVerParticipanteId(conversacionId)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para consultar participantes de esta conversacion");
        }
    }

    /**
     * Puede eliminar la participacion el director, el creador de la
     * conversacion o el propio participante (salirse del chat).
     */
    public boolean puedeEliminarParticipanteId(Integer conversacionId, Integer usuarioId) {
        if (conversacionId == null || usuarioId == null) {
            return false;
        }
        if (esDirector() || puedeGestionarParticipantes(conversacionId)) {
            return true;
        }
        return usuarioId().equals(usuarioId);
    }

    public void exigirEliminarParticipanteId(Integer conversacionId, Integer usuarioId) {
        if (!puedeEliminarParticipanteId(conversacionId, usuarioId)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para eliminar este participante");
        }
    }

    public boolean puedeVerMensaje(Mensaje mensaje) {
        return mensaje != null && puedeVerConversacion(mensaje.getConversacionId());
    }

    public void exigirVerMensaje(Mensaje mensaje) {
        if (!puedeVerMensaje(mensaje)) {
            throw new AccesoDenegadoException("No tienes permiso para consultar este mensaje");
        }
    }

    /**
     * Solo el director o un participante de la conversación puede escribir
     * mensajes en ella.
     */
    public boolean puedeEscribirMensaje(Integer conversacionId) {
        if (esDirector()) {
            return true;
        }
        return puedeVerConversacion(conversacionId);
    }

    public void exigirEscribirMensaje(Integer conversacionId) {
        if (!puedeEscribirMensaje(conversacionId)) {
            throw new AccesoDenegadoException(
                    "Solo puedes escribir en conversaciones en las que participas");
        }
    }

    /**
     * Solo el remitente propio puede editar su mensaje, y nunca cambiar la
     * conversación ni el remitente. El director puede editar cualquiera.
     */
    public boolean puedeEditarMensaje(Mensaje existente, Mensaje datos) {
        if (existente == null || datos == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        Integer usuarioId = usuarioId();
        boolean esRemitente = usuarioId != null && usuarioId.equals(existente.getRemitenteId());
        boolean mismaConversacion = datos.getConversacionId() == null
                || datos.getConversacionId().equals(existente.getConversacionId());
        boolean mismoRemitente = datos.getRemitenteId() == null
                || datos.getRemitenteId().equals(existente.getRemitenteId());
        return esRemitente && mismaConversacion && mismoRemitente;
    }

    public void exigirEditarMensaje(Mensaje existente, Mensaje datos) {
        if (!puedeEditarMensaje(existente, datos)) {
            throw new AccesoDenegadoException(
                    "No puedes editar este mensaje");
        }
    }

    /**
     * Solo el remitente propio puede eliminar su mensaje. El director puede
     * eliminar cualquiera.
     */
    public boolean puedeEliminarMensaje(Mensaje mensaje) {
        if (mensaje == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        Integer usuarioId = usuarioId();
        return usuarioId != null && usuarioId.equals(mensaje.getRemitenteId());
    }

    public void exigirEliminarMensaje(Mensaje mensaje) {
        if (!puedeEliminarMensaje(mensaje)) {
            throw new AccesoDenegadoException(
                    "No puedes eliminar este mensaje");
        }
    }

    /**
     * Verifica si el usuario puede ver mensajes de una conversacion por ID.
     * Director puede ver todos; otros solo si participan de la conversacion.
     */
    public boolean puedeVerMensajeId(Integer conversacionId) {
        return puedeVerConversacion(conversacionId);
    }

    public void exigirVerMensajeId(Integer conversacionId) {
        if (!puedeVerMensajeId(conversacionId)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para consultar este mensaje");
        }
    }

    /**
     * Verifica si el usuario puede editar un mensaje. Director puede editar
     * cualquiera; el remitente propio puede editar el suyo, sin cambiar la
     * conversacion ni el remitente.
     */
    public boolean puedeEditarMensajeId(Integer conversacionId, Integer remitenteId) {
        if (esDirector()) {
            return true;
        }
        Integer usuarioId = usuarioId();
        return usuarioId != null && usuarioId.equals(remitenteId);
    }

    public void exigirEditarMensajeId(Integer conversacionId, Integer remitenteId) {
        if (!puedeEditarMensajeId(conversacionId, remitenteId)) {
            throw new AccesoDenegadoException(
                    "No puedes editar este mensaje");
        }
    }

    /**
     * Verifica si el usuario puede eliminar un mensaje. Director puede eliminar
     * cualquiera; el remitente propio puede eliminar el suyo.
     */
    public boolean puedeEliminarMensajeId(Integer conversacionId, Integer remitenteId) {
        if (esDirector()) {
            return true;
        }
        Integer usuarioId = usuarioId();
        return usuarioId != null && usuarioId.equals(remitenteId);
    }

    public void exigirEliminarMensajeId(Integer conversacionId, Integer remitenteId) {
        if (!puedeEliminarMensajeId(conversacionId, remitenteId)) {
            throw new AccesoDenegadoException(
                    "No puedes eliminar este mensaje");
        }
    }

    /** Conversaciones que puede listar el usuario. Solo se usa si no ve todas. */
    public Set<Integer> idsConversacionesVisibles() {
        if (puedeVerTodasLasConversaciones()) {
            return Set.of();
        }
        Integer usuarioId = usuarioId();
        Set<Integer> ids = new HashSet<>();
        conversaciones.findByCreadaPor_Id(usuarioId).forEach(c -> ids.add(c.getId()));
        participantes.findByUsuario_Id(usuarioId)
                .forEach(p -> {
                    if (p.getConversacionId() != null) {
                        ids.add(p.getConversacionId());
                    }
                });
        return ids;
    }

    // ------------------------------------------------------------------
    // Reuniones
    // ------------------------------------------------------------------

    /**
     * Verifica si el maestro autenticado tiene al menos una asignación con la
     * asignación docente indicada.
     */
    public boolean maestroTieneAsignacionDocente(Integer asignacionDocenteId) {
        if (asignacionDocenteId == null) {
            return false;
        }
        return maestroIdPropio()
                .map(maestroId -> asignaciones.existsByMaestro_IdAndId(maestroId, asignacionDocenteId))
                .orElse(false);
    }

    /**
     * El director ve todas las reuniones. El maestro ve las de sus propias
     * asignaciones docentes. Alumno y tutor ven las de las reuniones en las
     * que participan.
     */
    public boolean puedeVerReunion(Reunion reunion) {
        if (reunion == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        if (esMaestro()) {
            Integer asignacionId = reunion.getAsignacionDocenteId();
            if (asignacionId != null) {
                return maestroTieneAsignacionDocente(asignacionId);
            }
            // Sin asignación docente: el maestro solo ve las que creó.
            Integer usuarioId = usuarioId();
            return usuarioId != null && usuarioId.equals(reunion.getCreadaPorId());
        }
        // Alumno y tutor: solo reuniones donde son participantes.
        Integer usuarioId = usuarioId();
        return usuarioId != null
                && reunionParticipantes.existsByReunion_IdAndUsuario_Id(reunion.getId(), usuarioId);
    }

    public void exigirVerReunion(Reunion reunion) {
        if (!puedeVerReunion(reunion)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para consultar esta reunión");
        }
    }

    /**
     * Crear reuniones es potestad del director y del maestro. El maestro solo
     * puede crear reuniones en sus propias asignaciones docentes. La creadaPor
     * se fuerza al usuario autenticado.
     */
    public boolean puedeCrearReunion(Reunion reunion) {
        if (!esDirector() && !esMaestro()) {
            return false;
        }
        if (esMaestro() && reunion != null && reunion.getAsignacionDocenteId() != null) {
            return maestroTieneAsignacionDocente(reunion.getAsignacionDocenteId());
        }
        return true;
    }

    public void exigirCrearReunion(Reunion reunion) {
        if (!puedeCrearReunion(reunion)) {
            throw new AccesoDenegadoException(
                    "Solo puedes crear reuniones en tus propias asignaciones");
        }
    }

    /**
     * Editar reuniones: el director puede editar cualquiera; el maestro solo
     * las que creó o las de sus asignaciones. No se puede cambiar la
     * asignación docente ni el creador.
     */
    public boolean puedeEditarReunion(Reunion existente, Reunion datos) {
        if (existente == null || datos == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        if (!esMaestro()) {
            return false;
        }
        Integer usuarioId = usuarioId();
        boolean esCreador = usuarioId != null && usuarioId.equals(existente.getCreadaPorId());
        boolean asignacionPropia = maestroTieneAsignacionDocente(existente.getAsignacionDocenteId());
        boolean mismaAsignacion = datos.getAsignacionDocenteId() == null
                || datos.getAsignacionDocenteId().equals(existente.getAsignacionDocenteId());
        return (esCreador || asignacionPropia) && mismaAsignacion;
    }

    public void exigirEditarReunion(Reunion existente, Reunion datos) {
        if (!puedeEditarReunion(existente, datos)) {
            throw new AccesoDenegadoException(
                    "No puedes modificar esta reunión");
        }
    }

    /**
     * Eliminar reuniones: solo el director o el creador de la reunión.
     */
    public boolean puedeEliminarReunion(Reunion reunion) {
        if (reunion == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        Integer usuarioId = usuarioId();
        return usuarioId != null && usuarioId.equals(reunion.getCreadaPorId());
    }

    public void exigirEliminarReunion(Reunion reunion) {
        if (!puedeEliminarReunion(reunion)) {
            throw new AccesoDenegadoException(
                    "No puedes eliminar esta reunión");
        }
    }

    /**
     * Verifica si el usuario puede ver una reunion por ID.
     * Director ve todas; maestro ve las de sus asignaciones o las que creó;
     * alumno y tutor solo las en las que participan.
     */
    public boolean puedeVerReunionId(Integer reunionId) {
        if (reunionId == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        if (esMaestro()) {
            return reuniones.findById(reunionId)
                    .map(reunion -> {
                        Integer asignacionId = reunion.getAsignacionDocenteId();
                        if (asignacionId != null) {
                            return maestroTieneAsignacionDocente(asignacionId);
                        }
                        Integer usuarioId = usuarioId();
                        return usuarioId != null && usuarioId.equals(reunion.getCreadaPorId());
                    })
                    .orElse(false);
        }
        Integer usuarioId = usuarioId();
        return usuarioId != null
                && reunionParticipantes.existsByReunion_IdAndUsuario_Id(reunionId, usuarioId);
    }

    public void exigirVerReunionId(Integer reunionId) {
        if (!puedeVerReunionId(reunionId)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para consultar esta reunión");
        }
    }

    /**
     * Verifica si el usuario puede crear una reunion en la asignación indicada.
     * Solo director y maestro pueden crear reuniones; el maestro solo en sus
     * propias asignaciones docentes.
     */
    public boolean puedeCrearReunionId(Integer asignacionDocenteId) {
        if (!esDirector() && !esMaestro()) {
            return false;
        }
        if (esMaestro() && asignacionDocenteId != null) {
            return maestroTieneAsignacionDocente(asignacionDocenteId);
        }
        return true;
    }

    public void exigirCrearReunionId(Integer asignacionDocenteId) {
        if (!puedeCrearReunionId(asignacionDocenteId)) {
            throw new AccesoDenegadoException(
                    "Solo puedes crear reuniones en tus propias asignaciones");
        }
    }

    /**
     * Verifica si el usuario puede editar una reunion por ID.
     * Director puede editar cualquiera; maestro solo las que creó o las de sus
     * asignaciones.
     */
    public boolean puedeEditarReunionId(Integer reunionId) {
        if (reunionId == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        if (!esMaestro()) {
            return false;
        }
        Integer usuarioId = usuarioId();
        return reuniones.findById(reunionId)
                .map(reunion -> {
                    boolean esCreador = usuarioId != null
                            && usuarioId.equals(reunion.getCreadaPorId());
                    boolean asignacionPropia = maestroTieneAsignacionDocente(
                            reunion.getAsignacionDocenteId());
                    return esCreador || asignacionPropia;
                })
                .orElse(false);
    }

    public void exigirEditarReunionId(Integer reunionId) {
        if (!puedeEditarReunionId(reunionId)) {
            throw new AccesoDenegadoException(
                    "No puedes modificar esta reunión");
        }
    }

    /**
     * Verifica si el usuario puede eliminar una reunion por ID.
     * Solo el director o el creador de la reunion.
     */
    public boolean puedeEliminarReunionId(Integer reunionId, Integer creadaPorId) {
        if (reunionId == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        Integer usuarioId = usuarioId();
        return usuarioId != null && usuarioId.equals(creadaPorId);
    }

    public void exigirEliminarReunionId(Integer reunionId, Integer creadaPorId) {
        if (!puedeEliminarReunionId(reunionId, creadaPorId)) {
            throw new AccesoDenegadoException(
                    "No puedes eliminar esta reunión");
        }
    }

    // ------------------------------------------------------------------
    // Participantes de reuniones
    // ------------------------------------------------------------------

    /**
     * Verifica si el usuario es creador de una reunión.
     */
    private boolean esCreadorDeReunion(Integer reunionId) {
        if (reunionId == null) {
            return false;
        }
        Integer usuarioId = usuarioId();
        return usuarioId != null
                && reuniones.findById(reunionId)
                    .map(r -> usuarioId.equals(r.getCreadaPorId()))
                    .orElse(false);
    }

    /**
     * Director ve todos los participantes. Maestro ve los de reuniones de sus
     * asignaciones o que creó. Alumno y tutor solo ven su propia inscripción.
     */
    public boolean puedeVerReunionParticipante(ReunionParticipante participante) {
        if (participante == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        if (esMaestro()) {
            return puedeVerReunion(participante.getReunion());
        }
        Integer usuarioId = usuarioId();
        return usuarioId != null && usuarioId.equals(participante.getUsuarioId());
    }

    public void exigirVerReunionParticipante(ReunionParticipante participante) {
        if (!puedeVerReunionParticipante(participante)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para consultar este participante");
        }
    }

    /**
     * Crear participantes de reunión: director o creador de la reunión pueden
     * agregar cualquiera. Maestro solo en reuniones de sus propias
     * asignaciones.
     */
    public boolean puedeCrearReunionParticipante(ReunionParticipante participante) {
        if (!esDirector() && !esMaestro()) {
            return false;
        }
        Integer reunionId = participante == null ? null : participante.getReunionId();
        if (esDirector()) {
            return reunionId != null;
        }
        return puedeVerReunion(reuniones.findById(reunionId).orElse(null));
    }

    public void exigirCrearReunionParticipante(ReunionParticipante participante) {
        if (!puedeCrearReunionParticipante(participante)) {
            throw new AccesoDenegadoException(
                    "Solo puedes agregar participantes a reuniones que gestionas");
        }
    }

    /**
     * Editar participante: director o creador de la reunión.
     */
    public boolean puedeEditarReunionParticipante(ReunionParticipante existente,
                                                  ReunionParticipante datos) {
        if (existente == null || datos == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        return esCreadorDeReunion(existente.getReunionId());
    }

    public void exigirEditarReunionParticipante(ReunionParticipante existente,
                                                ReunionParticipante datos) {
        if (!puedeEditarReunionParticipante(existente, datos)) {
            throw new AccesoDenegadoException(
                    "No puedes modificar este participante");
        }
    }

    /**
     * Eliminar participante: director, creador de la reunión, o el propio
     * usuario (salida voluntaria).
     */
    public boolean puedeEliminarReunionParticipante(ReunionParticipante participante) {
        if (participante == null) {
            return false;
        }
        if (esDirector() || esCreadorDeReunion(participante.getReunionId())) {
            return true;
        }
        Integer usuarioId = usuarioId();
        return usuarioId != null && usuarioId.equals(participante.getUsuarioId());
    }

    public void exigirEliminarReunionParticipante(ReunionParticipante participante) {
        if (!puedeEliminarReunionParticipante(participante)) {
            throw new AccesoDenegadoException(
                    "No puedes eliminar este participante");
        }
    }

    /**
     * Verifica si el usuario puede ver un participante de reunion por IDs.
     * Director ve todos; maestro ve los de reuniones de sus asignaciones o que
     * creo; alumno y tutor solo ven su propia inscripcion.
     */
    public boolean puedeVerReunionParticipanteId(Integer reunionId, Integer usuarioId) {
        if (reunionId == null || usuarioId == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        if (esMaestro()) {
            return reuniones.findById(reunionId)
                    .map(reunion -> {
                        Integer asignacionId = reunion.getAsignacionDocenteId();
                        if (asignacionId != null) {
                            return maestroTieneAsignacionDocente(asignacionId);
                        }
                        return usuarioId.equals(reunion.getCreadaPorId());
                    })
                    .orElse(false);
        }
        return usuarioId().equals(usuarioId);
    }

    public void exigirVerReunionParticipanteId(Integer reunionId, Integer usuarioId) {
        if (!puedeVerReunionParticipanteId(reunionId, usuarioId)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso para consultar este participante");
        }
    }

    /**
     * Verifica si el usuario puede crear un participante de reunion en la
     * reunion indicada. Director o creador de la reunion pueden agregar
     * participantes. Maestro solo en reuniones de sus propias asignaciones.
     */
    public boolean puedeCrearReunionParticipanteId(Integer reunionId) {
        if (reunionId == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        if (!esMaestro()) {
            return false;
        }
        return reuniones.findById(reunionId)
                .map(reunion -> {
                    Integer asignacionId = reunion.getAsignacionDocenteId();
                    if (asignacionId != null) {
                        return maestroTieneAsignacionDocente(asignacionId);
                    }
                    Integer usuarioId = usuarioId();
                    return usuarioId != null && usuarioId.equals(reunion.getCreadaPorId());
                })
                .orElse(false);
    }

    public void exigirCrearReunionParticipanteId(Integer reunionId) {
        if (!puedeCrearReunionParticipanteId(reunionId)) {
            throw new AccesoDenegadoException(
                    "Solo puedes agregar participantes a reuniones que gestionas");
        }
    }

    /**
     * Verifica si el usuario puede editar un participante de reunion por IDs.
     * Director o creador de la reunion pueden editar.
     */
    public boolean puedeEditarReunionParticipanteId(Integer reunionId, Integer usuarioId) {
        if (reunionId == null || usuarioId == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        Integer authUsuarioId = usuarioId();
        return authUsuarioId != null
                && reuniones.findById(reunionId)
                    .map(r -> authUsuarioId.equals(r.getCreadaPorId()))
                    .orElse(false);
    }

    public void exigirEditarReunionParticipanteId(Integer reunionId, Integer usuarioId) {
        if (!puedeEditarReunionParticipanteId(reunionId, usuarioId)) {
            throw new AccesoDenegadoException(
                    "No puedes modificar este participante");
        }
    }

    /**
     * Verifica si el usuario puede eliminar un participante de reunion por IDs.
     * Director, creador de la reunion, o el propio usuario pueden eliminar.
     */
    public boolean puedeEliminarReunionParticipanteId(Integer reunionId, Integer usuarioId) {
        if (reunionId == null || usuarioId == null) {
            return false;
        }
        if (esDirector()) {
            return true;
        }
        Integer authUsuarioId = usuarioId();
        if (authUsuarioId != null
                && reuniones.findById(reunionId)
                    .map(r -> authUsuarioId.equals(r.getCreadaPorId()))
                    .orElse(false)) {
            return true;
        }
        return authUsuarioId != null && authUsuarioId.equals(usuarioId);
    }

    public void exigirEliminarReunionParticipanteId(Integer reunionId, Integer usuarioId) {
        if (!puedeEliminarReunionParticipanteId(reunionId, usuarioId)) {
            throw new AccesoDenegadoException(
                    "No puedes eliminar este participante");
        }
    }
}

/* ============================================================
   AUDITORIA DE LA BASE - SistemaGestionEscolar
   SOLO LECTURA: este script no inserta, no actualiza y no borra.
   Ejecutar en SSMS (F5) o con sqlcmd:

   sqlcmd -S "localhost\SQL2022" -U sa -P 1234 -C ^
          -d SistemaGestionEscolar -f 65001 ^
          -i verificar_base.sql -W -s " | "
   ============================================================ */
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;

IF OBJECT_ID('tempdb..#R') IS NOT NULL DROP TABLE #R;
CREATE TABLE #R (
    id       INT IDENTITY(1,1) PRIMARY KEY,
    bloque   NVARCHAR(30)  NOT NULL,
    control  NVARCHAR(160) NOT NULL,
    esperado NVARCHAR(50)  NOT NULL,
    obtenido NVARCHAR(50)  NOT NULL,
    ok       BIT           NOT NULL
);

/* ============================================================
   1. CONTEO DE TODAS LAS TABLAS (minimo 10 registros)
   ============================================================ */
INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Conteos', N'Registros en ' + t.name, N'>= 10',
       CAST(SUM(CASE WHEN p.index_id IN (0,1) THEN p.rows ELSE 0 END) AS NVARCHAR(50)),
       CASE WHEN SUM(CASE WHEN p.index_id IN (0,1) THEN p.rows ELSE 0 END) >= 10 THEN 1 ELSE 0 END
FROM sys.tables t
JOIN sys.partitions p ON p.object_id = t.object_id
WHERE t.is_ms_shipped = 0 AND t.name <> 'sysdiagrams'
GROUP BY t.name;

DECLARE @tablas INT, @fks INT, @unicos INT, @sinPk INT;
SELECT @tablas = COUNT(*) FROM sys.tables WHERE is_ms_shipped = 0 AND name <> 'sysdiagrams';
SELECT @fks    = COUNT(*) FROM sys.foreign_keys WHERE is_ms_shipped = 0;
SELECT @unicos = COUNT(*)
FROM sys.indexes i
JOIN sys.tables t ON t.object_id = i.object_id
WHERE t.is_ms_shipped = 0 AND t.name <> 'sysdiagrams'
  AND i.is_unique = 1 AND i.is_primary_key = 0;
SELECT @sinPk = COUNT(*)
FROM sys.tables t
WHERE t.is_ms_shipped = 0 AND t.name <> 'sysdiagrams'
  AND NOT EXISTS (SELECT 1 FROM sys.indexes i WHERE i.object_id = t.object_id AND i.is_primary_key = 1);

INSERT INTO #R (bloque, control, esperado, obtenido, ok) VALUES
    (N'Conteos',    N'Tablas de usuario',            N'25', CAST(@tablas AS NVARCHAR(50)), CASE WHEN @tablas = 25 THEN 1 ELSE 0 END),
    (N'Integridad', N'Llaves foraneas declaradas',   N'38', CAST(@fks    AS NVARCHAR(50)), CASE WHEN @fks    = 38 THEN 1 ELSE 0 END),
    (N'Integridad', N'Indices unicos (sin PK)',      N'18', CAST(@unicos AS NVARCHAR(50)), CASE WHEN @unicos = 18 THEN 1 ELSE 0 END),
    (N'Integridad', N'Tablas sin llave primaria',    N'0',  CAST(@sinPk  AS NVARCHAR(50)), CASE WHEN @sinPk  = 0  THEN 1 ELSE 0 END);

/* ============================================================
   2. INTEGRIDAD REFERENCIAL: 0 registros huerfanos por cada FK
   ============================================================ */
DECLARE @fk SYSNAME, @tp SYSNAME, @tr SYSNAME, @cp SYSNAME, @cr SYSNAME, @sql NVARCHAR(MAX);

DECLARE cur_fk CURSOR LOCAL FAST_FORWARD FOR
SELECT fk.name, tp.name, tr.name, cp.name, cr.name
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
JOIN sys.tables  tp ON tp.object_id = fk.parent_object_id
JOIN sys.tables  tr ON tr.object_id = fk.referenced_object_id
JOIN sys.columns cp ON cp.object_id = fkc.parent_object_id     AND cp.column_id = fkc.parent_column_id
JOIN sys.columns cr ON cr.object_id = fkc.referenced_object_id AND cr.column_id = fkc.referenced_column_id
WHERE fk.is_ms_shipped = 0;

OPEN cur_fk;
FETCH NEXT FROM cur_fk INTO @fk, @tp, @tr, @cp, @cr;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = N'
        INSERT INTO #R (bloque, control, esperado, obtenido, ok)
        SELECT N''Integridad'',
               N''FK ' + REPLACE(@fk, '''', '''''') + N' (' + @tp + N' -> ' + @tr + N')'',
               N''0 huerfanos'',
               CAST(COUNT(*) AS NVARCHAR(50)),
               CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END
        FROM ' + QUOTENAME(@tp) + N' p
        WHERE p.' + QUOTENAME(@cp) + N' IS NOT NULL
          AND NOT EXISTS (
              SELECT 1 FROM ' + QUOTENAME(@tr) + N' r
              WHERE r.' + QUOTENAME(@cr) + N' = p.' + QUOTENAME(@cp) + N'
          );';
    EXEC sp_executesql @sql;
    FETCH NEXT FROM cur_fk INTO @fk, @tp, @tr, @cp, @cr;
END
CLOSE cur_fk;
DEALLOCATE cur_fk;

/* ============================================================
   3. CLAVES UNICAS: 0 grupos duplicados
   ============================================================ */
DECLARE @tabla SYSNAME, @indice SYSNAME, @cols NVARCHAR(MAX);

DECLARE cur_uq CURSOR LOCAL FAST_FORWARD FOR
SELECT t.name, i.name,
       STUFF((SELECT N', ' + QUOTENAME(c.name)
              FROM sys.index_columns ic
              JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
              WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id
                AND ic.is_included_column = 0
              ORDER BY ic.key_ordinal
              FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, N'')
FROM sys.indexes i
JOIN sys.tables t ON t.object_id = i.object_id
WHERE t.is_ms_shipped = 0 AND t.name <> 'sysdiagrams'
  AND i.is_unique = 1 AND i.is_primary_key = 0;

OPEN cur_uq;
FETCH NEXT FROM cur_uq INTO @tabla, @indice, @cols;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = N'
        INSERT INTO #R (bloque, control, esperado, obtenido, ok)
        SELECT N''Integridad'',
               N''Unico ' + REPLACE(@indice, '''', '''''') + N' (' + @tabla + N')'',
               N''0 duplicados'',
               CAST(COUNT(*) AS NVARCHAR(50)),
               CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END
        FROM (
            SELECT ' + @cols + N'
            FROM ' + QUOTENAME(@tabla) + N'
            GROUP BY ' + @cols + N'
            HAVING COUNT(*) > 1
        ) d;';
    EXEC sp_executesql @sql;
    FETCH NEXT FROM cur_uq INTO @tabla, @indice, @cols;
END
CLOSE cur_uq;
DEALLOCATE cur_uq;

/* ============================================================
   4. CONTEXTO: MANAGUA Y COLEGIO OTTO DE LA ROCHA
   ============================================================ */
INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Contexto', N'Alumnos del Colegio Otto de la Rocha', N'10',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 10 THEN 1 ELSE 0 END
FROM alumnos
WHERE colegio_procedencia = N'Colegio Otto de la Rocha';

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Contexto', N'Alumnos con codigo COR-2026-###', N'10',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 10 THEN 1 ELSE 0 END
FROM alumnos
WHERE codigo_mined LIKE N'COR-2026-%';

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Contexto', N'Correos institucionales @ottodelarocha', N'26',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 26 THEN 1 ELSE 0 END
FROM usuarios
WHERE email LIKE N'%@ottodelarocha.edu.ni';

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Contexto', N'Tutores con correo personal @correo.com', N'5',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 5 THEN 1 ELSE 0 END
FROM usuarios
WHERE email LIKE N'%@correo.com';

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Contexto', N'Usuarios con barrio registrado', N'31',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 31 THEN 1 ELSE 0 END
FROM usuarios
WHERE barrio IS NOT NULL AND LTRIM(RTRIM(barrio)) <> N'';

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Contexto', N'Alumnos con al menos un tutor', N'10',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 10 THEN 1 ELSE 0 END
FROM (SELECT DISTINCT id_alumno FROM alumno_tutor) x;

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Contexto', N'Roles registrados', N'10',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 10 THEN 1 ELSE 0 END
FROM roles;

/* ============================================================
   5. USUARIOS NUEVOS Y ACCESO
   ============================================================ */
DECLARE @nuevos TABLE (user_name NVARCHAR(50) PRIMARY KEY);
INSERT INTO @nuevos (user_name) VALUES
    (N'maestra_karla'), (N'maestro_roberto'), (N'maestra_silvia'),
    (N'maestro_fernando'), (N'maestra_patricia'), (N'tutor_marvin'),
    (N'tutora_lourdes'), (N'tutor_erasmo'), (N'tutora_gladys'),
    (N'tutor_henry'), (N'alumno_oscar'), (N'alumna_ximena');

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Usuarios', N'Usuarios nuevos creados', N'12',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 12 THEN 1 ELSE 0 END
FROM usuarios u JOIN @nuevos n ON n.user_name = u.user_name;

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Usuarios', N'Usuarios nuevos con clave pass123', N'12',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 12 THEN 1 ELSE 0 END
FROM usuarios u JOIN @nuevos n ON n.user_name = u.user_name
WHERE u.password_hash = N'pass123';

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Usuarios', N'Usuarios nuevos activos', N'12',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 12 THEN 1 ELSE 0 END
FROM usuarios u JOIN @nuevos n ON n.user_name = u.user_name
WHERE u.estado IN (N'1', N'true', N'Activo');

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Usuarios', N'Maestros nuevos (rol 2)', N'5',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 5 THEN 1 ELSE 0 END
FROM usuarios u JOIN @nuevos n ON n.user_name = u.user_name
WHERE u.id_rol = 2;

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Usuarios', N'Tutores nuevos (rol 4)', N'5',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 5 THEN 1 ELSE 0 END
FROM usuarios u JOIN @nuevos n ON n.user_name = u.user_name
WHERE u.id_rol = 4;

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Usuarios', N'Alumnos nuevos (rol 3)', N'2',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 2 THEN 1 ELSE 0 END
FROM usuarios u JOIN @nuevos n ON n.user_name = u.user_name
WHERE u.id_rol = 3;

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Usuarios', N'Usuarios activos en total', N'31',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 31 THEN 1 ELSE 0 END
FROM usuarios
WHERE estado IN (N'1', N'true', N'Activo');

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Usuarios', N'Usuarios con clave no vacia', N'31',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 31 THEN 1 ELSE 0 END
FROM usuarios
WHERE password_hash IS NOT NULL AND LEN(password_hash) > 0;

/* ============================================================
   6. COHERENCIA DE LOS DATOS ACADEMICOS
   ============================================================ */
INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Coherencia', N'Notas fuera del puntaje maximo', N'0',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END
FROM notas n
JOIN evaluaciones e ON e.id_evaluacion = n.id_evaluacion
WHERE n.calificacion < 0 OR n.calificacion > e.puntaje_maximo;

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Coherencia', N'Evaluaciones con cierre antes de publicacion', N'0',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END
FROM evaluaciones
WHERE fecha_cierre < fecha_publicacion;

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Coherencia', N'Tareas con limite antes de publicacion', N'0',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END
FROM tareas
WHERE fecha_limite < fecha_publicacion;

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Coherencia', N'Asistencias con estado invalido', N'0',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END
FROM asistencias
WHERE estado NOT IN (N'Presente', N'Ausente', N'Tarde', N'Justificado');

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Coherencia', N'Justificaciones resueltas sin aprobador', N'0',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END
FROM justificaciones_ausencia
WHERE estado IN (N'Aprobada', N'Rechazada') AND aprobado_por IS NULL;

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Coherencia', N'Justificaciones pendientes con aprobador', N'0',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END
FROM justificaciones_ausencia
WHERE estado = N'Pendiente'
  AND (aprobado_por IS NOT NULL OR fecha_aprobacion IS NOT NULL);

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Coherencia', N'Matriculas activas', N'10',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 10 THEN 1 ELSE 0 END
FROM matriculas
WHERE estado = N'Activa';

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Coherencia', N'Alumnos sin matricula', N'0',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END
FROM alumnos a
WHERE NOT EXISTS (SELECT 1 FROM matriculas m WHERE m.id_alumno = a.id_alumno);

INSERT INTO #R (bloque, control, esperado, obtenido, ok)
SELECT N'Coherencia', N'Secciones sin maestro guia', N'0',
       CAST(COUNT(*) AS NVARCHAR(50)), CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END
FROM secciones
WHERE id_maestro_guia IS NULL;

/* ============================================================
   7. MUESTRA DE DATOS PARA REVISAR A OJO
   ============================================================ */
SELECT N'CONTEO POR TABLA' AS muestra;
SELECT t.name AS tabla,
       SUM(CASE WHEN p.index_id IN (0,1) THEN p.rows ELSE 0 END) AS filas
FROM sys.tables t
JOIN sys.partitions p ON p.object_id = t.object_id
WHERE t.is_ms_shipped = 0 AND t.name <> 'sysdiagrams'
GROUP BY t.name
ORDER BY t.name;

SELECT N'USUARIOS POR ROL' AS muestra;
SELECT r.nombre AS rol, COUNT(u.id_usuario) AS usuarios
FROM roles r
LEFT JOIN usuarios u ON u.id_rol = r.id_rol
GROUP BY r.nombre
ORDER BY usuarios DESC, r.nombre;

SELECT N'ALUMNOS' AS muestra;
SELECT a.id_alumno, u.user_name,
       u.nombres + N' ' + u.apellidos AS nombre_completo,
       a.codigo_mined, a.colegio_procedencia, u.barrio
FROM alumnos a
JOIN usuarios u ON u.id_usuario = a.id_usuario
ORDER BY a.id_alumno;

SELECT N'SECCIONES Y MATRICULADOS' AS muestra;
SELECT s.id_seccion, g.nombre AS grado, s.nombre AS seccion, s.turno,
       COUNT(m.id_matricula) AS matriculados
FROM secciones s
JOIN grados g ON g.id_grado = s.id_grado
LEFT JOIN matriculas m ON m.id_seccion = s.id_seccion
GROUP BY s.id_seccion, g.nombre, s.nombre, s.turno
ORDER BY s.id_seccion;

SELECT N'USUARIOS NUEVOS' AS muestra;
SELECT u.id_usuario, u.user_name,
       u.nombres + N' ' + u.apellidos AS nombre_completo,
       r.nombre AS rol, u.email, u.estado
FROM usuarios u
JOIN @nuevos n ON n.user_name = u.user_name
JOIN roles r ON r.id_rol = u.id_rol
ORDER BY u.user_name;

/* ============================================================
   8. RESULTADO GLOBAL
   ============================================================ */
SELECT COUNT(*) AS controles,
       SUM(CASE WHEN ok = 0 THEN 1 ELSE 0 END) AS fallos,
       CASE WHEN SUM(CASE WHEN ok = 0 THEN 1 ELSE 0 END) = 0
            THEN N'TODO OK' ELSE N'REVISAR' END AS resultado
FROM #R;

SELECT N'DETALLE DE FALLOS' AS muestra;
SELECT bloque, control, esperado, obtenido
FROM #R
WHERE ok = 0
ORDER BY id;

SELECT N'DETALLE COMPLETO' AS muestra;
SELECT bloque, control, esperado, obtenido,
       CASE WHEN ok = 1 THEN N'OK' ELSE N'FALLO' END AS estado
FROM #R
ORDER BY id;

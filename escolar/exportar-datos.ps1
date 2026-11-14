# Exporta los datos de SQL Server a un archivo SQL para PostgreSQL,
# usando sqlcmd (viene con el Client SDK de SQL Server).
#
#   - Genera INSERTs con los nombres de columna reales.
#   - Conserva los ids, asi que las claves foraneas siguen validas.
#   - El esquema de SQL Server fue creado con las mismas entidades JPA,
#     por eso coincide con el que Hibernate genera en PostgreSQL.

$ErrorActionPreference = 'Stop'

$SQLCMD = 'C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\170\Tools\Binn\SQLCMD.EXE'
$server = 'localhost\SQL2022'
$db     = 'SistemaGestionEscolar'
$user   = 'sa'
$pass   = '1234'

# Tablas en orden de dependencia (para que las FK se satisfagan).
$tablas = @(
  'roles','anios_escolares','grados','secciones','asignaturas','usuarios',
  'maestros','alumnos','tutores','alumno_tutor','matriculas',
  'asignaciones_docentes','evaluaciones','notas','asistencias','tareas',
  'entregas_tareas','materiales','justificaciones_ausencia','reuniones',
  'reunion_participantes','conversaciones','conversacion_participantes','mensajes'
)

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('-- ============================================================')
[void]$sb.AppendLine('--  COLEGIO OTTO DE LA ROCHA - Datos exportados de SQL Server')
[void]$sb.AppendLine("--  Generado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
[void]$sb.AppendLine('--')
[void]$sb.AppendLine('--  Cargar en PostgreSQL:')
[void]$sb.AppendLine('--    psql "postgresql://USER:PASS@HOST/escolar" -f datos-postgres.sql')
[void]$sb.AppendLine('-- ============================================================')
[void]$sb.AppendLine('')
[void]$sb.AppendLine("SET client_encoding = 'UTF8';")
[void]$sb.AppendLine('SET foreign_keys = OFF;')
[void]$sb.AppendLine('')

$total = 0

foreach ($t in $tablas) {
    # -W quita los guiones de preenchido, -s"|" usa pipes como separador,
    # -h-1 desactiva los encabezados, -Q ejecuta la consulta.
    $sql = "SET NOCOUNT ON; SELECT * FROM [$t];"
    $out = & $SQLCMD -S $server -d $db -U $user -P $pass -C -W -s '|' -h -1 -Q $sql 2>$null

    if (-not $out -or $out.Count -eq 0) {
        Write-Host "  (vacio) $t" -ForegroundColor DarkGray
        continue
    }

    # Cabecera con los nombres de columna.
    $head = & $SQLCMD -S $server -d $db -U $user -P $pass -C -W -s '|' -h -1 -Q "SET NOCOUNT ON; SELECT TOP 0 * FROM [$t];" 2>$null

    # sqlcmd imprime la cabecera en la primera consulta; la recuperamos aparte
    # con -h-1 y nombres explicitos via information_schema.
    $cols = & $SQLCMD -S $server -d $db -U $user -P $pass -C -W -s '|' -h -1 -Q "SET NOCOUNT ON; SELECT STRING_AGG(QUOTENAME(COLUMN_NAME), ',') FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '$t';" 2>$null

    $colList = $cols | Where-Object { $_ -and $_ -notmatch '^-+$' } | Select-Object -First 1
    if (-not $colList) { continue }
    $colList = $colList.Trim()

    [void]$sb.AppendLine('-- ---------------------------------------------------------')
    [void]$sb.AppendLine("--  $t ($($out.Count) registros)")
    [void]$sb.AppendLine('-- ---------------------------------------------------------')

    foreach ($linea in $out) {
        if (-not $linea) { continue }
        if ($linea -match '^\s*-+(\s*-+)*\s*$') { continue }  # separador

        $partes = $linea -split '\|'
        $vals = @()
        foreach ($p in $partes) {
            $p = $p.Trim()
            if ($p -eq 'NULL' -or $p -eq '') { $vals += 'NULL'; continue }
            # Los NULL de sqlcmd vienen como la cadena vacia en columnas de
            # texto; los numericos NULL se detectan por estar vacios tambien.
            $vals += ("'" + $p.Replace("'", "''") + "'")
        }
        [void]$sb.AppendLine("INSERT INTO $t ($colList) VALUES (" + ($vals -join ', ') + ');')
    }

    [void]$sb.AppendLine('')
    $total += $out.Count
    Write-Host "  OK  $t -> $($out.Count) registros" -ForegroundColor Green
}

[void]$sb.AppendLine('SET foreign_keys = ON;')
[void]$sb.AppendLine('')
[void]$sb.AppendLine("-- Fin de la carga. Total de registros: $total")

$salida = Join-Path $PSScriptRoot 'datos-postgres.sql'
[System.IO.File]::WriteAllText($salida, $sb.ToString(), (New-Object System.Text.UTF8Encoding $false))
Write-Host ''
Write-Host "Archivo generado: datos-postgres.sql ($total registros)" -ForegroundColor Green
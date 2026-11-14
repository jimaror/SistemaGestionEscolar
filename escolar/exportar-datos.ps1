# ============================================================================
#  Exporta las tablas de SQL Server a un archivo SQL para PostgreSQL.
#
#  - Usa sqlcmd (viene con el Client SDK de SQL Server).
#  - Los nombres de columna son los reales del esquema.
#  - Los ids se conservan, asi que las claves foraneas siguen validas.
#  - La salida va en UTF-8 sin BOM, con el separador de columnas
#    remplazado por | para no romper los datos que lo contengan.
# ============================================================================

$ErrorActionPreference = 'Stop'

$SQLCMD = 'C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\170\Tools\Binn\SQLCMD.EXE'
$server = 'localhost\SQL2022'
$db     = 'SistemaGestionEscolar'
$user   = 'sa'
$pass   = '1234'

# Tablas en orden de dependencia.
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
    # Columnas reales, en orden, con QUOTENAME para nombres con caracteres raros.
    $cols = & $SQLCMD -S $server -d $db -U $user -P $pass -C -W -s '|' -h -1 `
        -Q "SET NOCOUNT ON; SELECT STRING_AGG(QUOTENAME(COLUMN_NAME), ',') FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '$t';" 2>$null |
        Where-Object { $_ -and $_ -notmatch '^-+$' } | Select-Object -First 1

    if (-not $cols) {
        Write-Host "  (sin columnas) $t" -ForegroundColor DarkGray
        continue
    }
    $cols = $cols.Trim()

    # Nombres de columna单独 para saber cuales son numericos (sin comillas).
    $tipos = & $SQLCMD -S $server -d $db -U $user -P $pass -C -W -s '|' -h -1 `
        -Q "SET NOCOUNT ON; SELECT STRING_AGG(COLUMN_NAME + ':' + DATA_TYPE, ',') FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '$t';" 2>$null |
        Where-Object { $_ -and $_ -notmatch '^-+$' } | Select-Object -First 1

    $esNumerico = @{}
    if ($tipos) {
        foreach ($par in $tipos.Trim().Split(',')) {
            $kv = $par.Split(':')
            if ($kv.Count -eq 2) {
                $tipo = $kv[1].Trim()
                $esNumerico[$kv[0].Trim()] = ($tipo -match '^(int|bigint|smallint|tinyint|decimal|numeric|real|double|float|bit|boolean)$')
            }
        }
    }

    # Datos.
    $out = & $SQLCMD -S $server -d $db -U $user -P $pass -C -W -s '|' -h -1 `
        -Q "SET NOCOUNT ON; SELECT * FROM [$t];" 2>$null

    if (-not $out -or $out.Count -eq 0) {
        Write-Host "  (vacio) $t" -ForegroundColor DarkGray
        continue
    }

    $nombres = $cols.Split(',') | ForEach-Object { $_.Trim().Trim('[', ']') }

    [void]$sb.AppendLine('-- ---------------------------------------------------------')
    [void]$sb.AppendLine("--  $t ($($out.Count) registros)")
    [void]$sb.AppendLine('-- ---------------------------------------------------------')

    foreach ($linea in $out) {
        if (-not $linea) { continue }
        if ($linea -match '^\s*-+(\s*-+)*\s*$') { continue }

        $partes = $linea -split '\|'
        $vals = @()

        for ($i = 0; $i -lt $nombres.Count; $i++) {
            $nombre = $nombres[$i]
            $valor = if ($i -lt $partes.Count) { $partes[$i].Trim() } else { '' }

            if ($valor -eq '' -or $valor -eq 'NULL') {
                $vals += 'NULL'
            } elseif ($esNumerico[$nombre]) {
                # Numero: sin comillas (PostgreSQL lo rechaza con comillas).
                $vals += $valor
            } else {
                # Texto: comillas simples, con el apostrophe escapado.
                $vals += "'" + $valor.Replace("'", "''") + "'"
            }
        }

        [void]$sb.AppendLine("INSERT INTO $t ($cols) VALUES (" + ($vals -join ', ') + ');')
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

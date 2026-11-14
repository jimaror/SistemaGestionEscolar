# Exporta todas las tablas de SQL Server a un archivo SQL para PostgreSQL.
# Los nombres de columna y los ids se conservan tal cual (el esquema de
# SQL Server fue creado con las mismas entidades JPA, asi que coincide).

$ErrorActionPreference = 'Stop'
$server = 'localhost\SQL2022'
$db = 'SistemaGestionEscolar'
$user = 'sa'
$pass = '1234'

# Tablas en orden de dependencia
$tablas = @(
  'roles','anios_escolares','grados','secciones','asignaturas','usuarios',
  'maestros','alumnos','tutores','alumno_tutor','matriculas',
  'asignaciones_docentes','evaluaciones','notas','asistencias','tareas',
  'entregas_tareas','materiales','justificaciones_ausencia','reuniones',
  'reunion_participantes','conversaciones','conversacion_participantes','mensajes'
)

$conn = New-Object System.Data.SqlClient.SqlConnection
$conn.ConnectionString = "Server=$server;Database=$db;User Id=$user;Password=$pass;TrustServerCertificate=True"
$conn.Open()
Write-Host "Conectado a SQL Server" -ForegroundColor Green

$sql = New-Object System.Text.StringBuilder
[void]$sql.AppendLine("-- ============================================================")
[void]$sql.AppendLine("--  COLEGIO OTTO DE LA ROCHA - Datos exportados de SQL Server")
[void]$sql.AppendLine("--  Generado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
[void]$sql.AppendLine("--")
[void]$sql.AppendLine("--  Cargar en PostgreSQL:")
[void]$sql.AppendLine("--    psql ""postgresql://USER:PASS@HOST/escolar"" -f datos-postgres.sql")
[void]$sql.AppendLine("-- ============================================================")
[void]$sql.AppendLine("")
[void]$sql.AppendLine("SET client_encoding = 'UTF8';")
[void]$sql.AppendLine("SET foreign_keys = OFF;")
[void]$sql.AppendLine("")

$total = 0

foreach ($tabla in $tablas) {
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "SELECT * FROM [$tabla]"
    $adapter = New-Object System.Data.SqlClient.SqlDataAdapter $cmd
    $data = New-Object System.Data.DataTable
    [void]$adapter.Fill($data)

    if ($data.Rows.Count -eq 0) {
        Write-Host "  (vacio) $tabla" -ForegroundColor DarkGray
        continue
    }

    $cols = $data.Columns | ForEach-Object { $_.ColumnName }
    $colList = ($cols | ForEach-Object { '"' + $_ + '"' }) -join ', '

    # Convierte un valor de SQL Server a literal de PostgreSQL
    function Convertir($v) {
        if ($v -is [DBNull]) { return 'NULL' }
        if ($v -is [int] -or $v -is [long] -or $v -is [short] -or $v -is [byte]) { return [string]$v }
        if ($v -is [double] -or $v -is [decimal]) { return ([string]$v).Replace(',', '.') }
        if ($v -is [bool]) { if ($v) { return 'TRUE' } else { return 'FALSE' } }
        if ($v -is [datetime]) {
            $s = $v.ToString('yyyy-MM-ddTHH:mm:ss')
            return "'$s'"
        }
        $s = [string]$v
        $s = $s.Replace("'", "''")
        return "'$s'"
    }

    [void]$sql.AppendLine("-- ---------------------------------------------------------")
    [void]$sql.AppendLine("--  $tabla ($($data.Rows.Count) registros)")
    [void]$sql.AppendLine("-- ---------------------------------------------------------")

    foreach ($row in $data.Rows) {
        $vals = @()
        foreach ($c in $cols) {
            $vals += Convertir $row[$c]
        }
        [void]$sql.AppendLine("INSERT INTO $tabla ($colList) VALUES (" + ($vals -join ', ') + ");")
    }

    # Ajusta la secuencia de la PK para los inserts futuros.
    $pk = $cols | Where-Object { $_ -like 'id_*' } | Select-Object -First 1
    if ($pk) {
        [void]$sql.AppendLine("SELECT setval(pg_get_serial_sequence('$tabla', '$pk'), (SELECT MAX($pk) FROM $tabla) + 1, false);")
    }
    [void]$sql.AppendLine("")

    $total += $data.Rows.Count
    Write-Host "  OK  $tabla -> $($data.Rows.Count) registros" -ForegroundColor Green
}

$conn.Close()

[void]$sql.AppendLine("SET foreign_keys = ON;")
[void]$sql.AppendLine("")
[void]$sql.AppendLine("-- Total de registros: $total")

$salida = 'D:\01 PROYECTOS ESCOLARES\ProyectoWebEscolar\escolar\datos-postgres.sql'
[System.IO.File]::WriteAllText($salida, $sql.ToString(), (New-Object System.Text.UTF8Encoding $false))
Write-Host ""
Write-Host "Archivo generado: $salida ($total registros)" -ForegroundColor Cyan
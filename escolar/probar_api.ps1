# ============================================================
#  Prueba rapida del backend escolar (solo lectura)
#  Uso:
#    .\probar_api.ps1                 -> prueba y al final detiene la app si la arranco el script
#    .\probar_api.ps1 -DejarAbierta   -> prueba y deja la app corriendo en http://localhost:8080
# ============================================================
param([switch]$DejarAbierta)

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
$base = 'http://localhost:8080'
$arrancadaPorScript = $false

function PuertoActivo {
    param([int]$puerto)
    return [bool](Get-NetTCPConnection -LocalPort $puerto -State Listen -ErrorAction SilentlyContinue)
}

function Login {
    param([string]$usuario, [string]$clave)
    Invoke-RestMethod -Uri "$base/api/auth/login" -Method Post -ContentType 'application/json' `
        -Body (ConvertTo-Json @{ username = $usuario; password = $clave }) -TimeoutSec 20
}

function Estado {
    param([string]$metodo, [string]$ruta, [string]$token)
    $cabeceras = @{}
    if ($token) { $cabeceras['Authorization'] = "Bearer $token" }
    try {
        $r = Invoke-WebRequest -Uri "$base$ruta" -Method $metodo -Headers $cabeceras -UseBasicParsing -TimeoutSec 25
        return [int]$r.StatusCode
    } catch {
        $resp = $_.Exception.Response
        if ($null -ne $resp) { return [int]$resp.StatusCode }
        return -1
    }
}

# ---------- 1. Arrancar la app si hace falta ----------
if (-not (PuertoActivo 8080)) {
    Write-Host "Arrancando la aplicacion (puede tardar ~40 s)..." -ForegroundColor Cyan
    $logOut = Join-Path $env:TEMP 'opencode\prueba_api.out.log'
    $logErr = Join-Path $env:TEMP 'opencode\prueba_api.err.log'
    Start-Process -FilePath (Join-Path $raiz 'mvnw.cmd') -ArgumentList 'spring-boot:run' `
        -WorkingDirectory $raiz -WindowStyle Hidden `
        -RedirectStandardOutput $logOut -RedirectStandardError $logErr
    $arrancadaPorScript = $true
}

$listo = $false
for ($i = 0; $i -lt 90; $i++) {
    try {
        Invoke-WebRequest -Uri "$base/api/auth/login" -Method Post -ContentType 'application/json' `
            -Body '{"username":"x","password":"x"}' -UseBasicParsing -TimeoutSec 2 | Out-Null
        $listo = $true; break
    } catch {
        if ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -in 400, 401, 403) { $listo = $true; break }
        Start-Sleep -Seconds 2
    }
}
if (-not $listo) {
    Write-Host "La aplicacion no respondio. Revisa los logs en $env:TEMP\opencode\prueba_api.err.log" -ForegroundColor Red
    exit 1
}
Write-Host "Aplicacion lista en $base" -ForegroundColor Green
Write-Host ''

# ---------- 2. Login de los usuarios nuevos ----------
$usuarios = @(
    @{ u = 'maestra_karla';     rol = 'Maestro' },
    @{ u = 'maestro_roberto';   rol = 'Maestro' },
    @{ u = 'maestra_silvia';    rol = 'Maestro' },
    @{ u = 'maestro_fernando';  rol = 'Maestro' },
    @{ u = 'maestra_patricia';  rol = 'Maestro' },
    @{ u = 'tutor_marvin';      rol = 'Tutor' },
    @{ u = 'tutora_lourdes';    rol = 'Tutor' },
    @{ u = 'tutor_erasmo';      rol = 'Tutor' },
    @{ u = 'tutora_gladys';     rol = 'Tutor' },
    @{ u = 'tutor_henry';       rol = 'Tutor' },
    @{ u = 'alumno_oscar';      rol = 'Alumno' },
    @{ u = 'alumna_ximena';     rol = 'Alumno' }
)

Write-Host '=== LOGIN DE USUARIOS NUEVOS (clave pass123) ===' -ForegroundColor Cyan
$fallos = 0
foreach ($item in $usuarios) {
    try {
        $r = Login $item.u 'pass123'
        $ok = ($r.rol -eq $item.rol)
        if (-not $ok) { $fallos++ }
        Write-Host ("  {0,-20} {1,-8} rol={2}" -f $item.u, $(if ($ok) { 'OK' } else { 'ROL MAL' }), $r.rol)
    } catch {
        $fallos++
        Write-Host ("  {0,-20} FALLO   {1}" -f $item.u, $_.Exception.Message) -ForegroundColor Red
    }
}
Write-Host ''

# ---------- 3. Conteos por API ----------
$director = Login 'director1' 'pass123'
$cabeceras = @{ Authorization = "Bearer $($director.token)" }

$rutas = @('usuarios','alumnos','alumno-tutores','anios-escolares','asignaciones-docentes',
    'asignaturas','asistencias','conversaciones','conversacion-participantes','entregas-tareas',
    'evaluaciones','grados','justificaciones-ausencia','maestros','materiales','matriculas',
    'mensajes','notas','reuniones','reunion-participantes','secciones','tareas','tutores')

Write-Host '=== REGISTROS DEVUELTOS POR CADA RUTA ===' -ForegroundColor Cyan
foreach ($ruta in $rutas) {
    try {
        $datos = Invoke-RestMethod -Uri "$base/api/$ruta" -Headers $cabeceras -TimeoutSec 25
        $n = @($datos).Count
        $marca = if ($n -ge 10) { 'OK' } else { 'BAJO' }
        Write-Host ("  {0,-30} {1,4}  {2}" -f "/api/$ruta", $n, $marca)
    } catch {
        Write-Host ("  {0,-30} ERROR {1}" -f "/api/$ruta", $_.Exception.Message) -ForegroundColor Red
        $fallos++
    }
}
Write-Host ''

# ---------- 4. Seguridad y detalle ----------
Write-Host '=== SEGURIDAD Y CONSULTAS DE DETALLE ===' -ForegroundColor Cyan
$sinToken = Estado 'GET' '/api/grados' $null
$alumno = Login 'alumno_juan' 'pass123'
$alumnoUsuarios = Estado 'GET' '/api/usuarios' $alumno.token
$directorUsuarios = Estado 'GET' '/api/usuarios' $director.token
$detalle = Invoke-RestMethod -Uri "$base/api/secciones/1013" -Headers $cabeceras -TimeoutSec 25

$checks = @(
    @{ Nombre = 'Sin token -> 401';                 Ok = ($sinToken -eq 401) },
    @{ Nombre = 'Alumno GET /api/usuarios -> 403';  Ok = ($alumnoUsuarios -eq 403) },
    @{ Nombre = 'Director GET /api/usuarios -> 200'; Ok = ($directorUsuarios -eq 200) },
    @{ Nombre = 'Seccion 1013 = Noveno grado A';    Ok = ($detalle.id -eq 1013 -and $detalle.grado.nombre -eq 'Noveno grado' -and $detalle.turno -eq 'Matutino') }
)
foreach ($c in $checks) {
    if (-not $c.Ok) { $fallos++ }
    Write-Host ("  {0,-45} {1}" -f $c.Nombre, $(if ($c.Ok) { 'OK' } else { 'FALLO' })) -ForegroundColor $(if ($c.Ok) { 'Green' } else { 'Red' })
}
Write-Host ''
Write-Host ("Seccion 1013 -> grado: {0}, turno: {1}, maestro guia: {2} {3}" -f `
    $detalle.grado.nombre, $detalle.turno, $detalle.maestroGuia.nombre, $detalle.maestroGuia.apellido)
Write-Host ''

if ($fallos -eq 0) {
    Write-Host 'RESULTADO: todas las pruebas pasaron.' -ForegroundColor Green
} else {
    Write-Host "RESULTADO: $fallos prueba(s) con problemas." -ForegroundColor Red
}

# ---------- 5. Dejar o detener la app ----------
if ($arrancadaPorScript -and -not $DejarAbierta) {
    Write-Host ''
    Write-Host 'Deteniendo la aplicacion...' -ForegroundColor Cyan
    $pids = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($p in $pids) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue }
} elseif (-not $arrancadaPorScript) {
    Write-Host ''
    Write-Host 'La aplicacion ya estaba corriendo; se deja abierta.' -ForegroundColor Cyan
} else {
    Write-Host ''
    Write-Host "La aplicacion queda corriendo en $base (cierra la ventana o deten el proceso java para pararla)." -ForegroundColor Cyan
}

# ============================================================
#  MANTENER DESPIERTO - Sistema Colegio Otto de la Rocha
#
#  Despierta el backend y el frontend de Render y los mantiene
#  activos mientras esta ventana este abierta.
#
#  USAR SOLO ALREDEDOR DE LA EXPOSICION:
#  Render regala 750 horas de instancia al mes y se comparten
#  entre los dos servicios. Dejarlo 24/7 todo el mes agota ese
#  limite y suspende los servicios.
#
#  Uso normal: doble clic en MANTENER-DESPIERTO.bat
#  Antes de exponer: doble clic en PREPARAR-EXPOSICION.bat
# ============================================================

param(
    [switch]$UnaVez,
    [switch]$AbrirNavegador
)

$frontend = 'https://escolar-frontend-rzdh.onrender.com/login'
$servicios = @(
    @{ Nombre = 'Backend '; Url = 'https://escolar-backend-vw07.onrender.com/api/salud' },
    @{ Nombre = 'Frontend'; Url = $frontend }
)

$registro = Join-Path $PSScriptRoot 'keep-alive.log'

function Probar-Servicio {
    param($Servicio)

    $hora = Get-Date -Format 'HH:mm:ss'
    try {
        $resp = Invoke-WebRequest -Uri $Servicio.Url -Method GET -TimeoutSec 120 -UseBasicParsing
        $msg = "[$hora] $($Servicio.Nombre) OK ($($resp.StatusCode))"
        Write-Host $msg -ForegroundColor Green
        Add-Content -Path $registro -Value $msg -Encoding UTF8
        return $true
    } catch {
        $msg = "[$hora] $($Servicio.Nombre) iniciando/error: $($_.Exception.Message)"
        Write-Host $msg -ForegroundColor Yellow
        Add-Content -Path $registro -Value $msg -Encoding UTF8
        return $false
    }
}

Write-Host '===============================================' -ForegroundColor Cyan
Write-Host '  Colegio Otto de la Rocha - servicios en linea' -ForegroundColor Cyan
Write-Host '  Backend y frontend se despiertan juntos'       -ForegroundColor Cyan
Write-Host '  Para detener: cerra esta ventana'               -ForegroundColor Cyan
Write-Host '===============================================' -ForegroundColor Cyan
Write-Host ''

if ($AbrirNavegador) {
    Write-Host 'Abriendo el sistema en el navegador...' -ForegroundColor Cyan
    Start-Process $frontend
}

do {
    $todosOk = $true
    foreach ($servicio in $servicios) {
        if (-not (Probar-Servicio $servicio)) {
            $todosOk = $false
        }
    }

    if ($UnaVez) { break }

    if (-not $todosOk) {
        Write-Host '  Esperando 15 segundos y reintentando...' -ForegroundColor DarkGray
        Start-Sleep -Seconds 15
    } else {
        Write-Host '  Servicios despiertos. Proximo control en 4 minutos.' -ForegroundColor DarkGray
        Start-Sleep -Seconds 240
    }
} while ($true)

Write-Host ''
Write-Host 'Listo.' -ForegroundColor Green

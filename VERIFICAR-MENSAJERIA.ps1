# Verifica que el fix de destinatarios ya este desplegado en Render.
# Doble clic o: powershell -ExecutionPolicy Bypass -File VERIFICAR-MENSAJERIA.ps1

$base = 'https://escolar-backend-vw07.onrender.com'

Write-Host '==============================================' -ForegroundColor Cyan
Write-Host '  VERIFICAR DESTINATARIOS DE MENSAJERIA' -ForegroundColor Cyan
Write-Host '==============================================' -ForegroundColor Cyan
Write-Host ''

try {
    $login = Invoke-RestMethod -Uri "$base/api/auth/login" -Method Post `
        -ContentType 'application/json' `
        -Body '{"username":"tutor_ana_vargas","password":"pass123"}' `
        -TimeoutSec 180
    Write-Host 'Login: OK' -ForegroundColor Green
} catch {
    Write-Host 'Login: FALLO (el backend puede estar despertando, espera 1 min y reintenta)' -ForegroundColor Red
    Read-Host 'Presiona Enter para salir'
    exit 1
}

$headers = @{ Authorization = "Bearer $($login.token)" }

try {
    $dest = Invoke-RestMethod -Uri "$base/api/mensajes/destinatarios" `
        -Headers $headers -TimeoutSec 180
    Write-Host "Endpoint nuevo: OK  ($($dest.Count) destinatarios)" -ForegroundColor Green
    Write-Host ''
    $dest | Select-Object -First 15 | ForEach-Object {
        $nombre = "$($_.nombres) $($_.apellidos)".Trim()
        Write-Host "  [$($_.rol)] $nombre"
    }
    Write-Host ''
    Write-Host 'SI VES ESTA LISTA, el backend ya esta actualizado.' -ForegroundColor Green
    Write-Host 'Ahora haz Ctrl+F5 en el frontend y abre Mensajes > Nuevo mensaje.' -ForegroundColor Green
} catch {
    $code = ''
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    Write-Host "Endpoint nuevo: FALLO (HTTP $code)" -ForegroundColor Red
    Write-Host 'Render todavia tiene el codigo viejo.' -ForegroundColor Yellow
    Write-Host ''
    Write-Host 'Haz Manual Deploy en Render para AMBOS servicios:' -ForegroundColor Yellow
    Write-Host '  1) escolar-backend  -> Manual Deploy -> Deploy latest commit' -ForegroundColor Yellow
    Write-Host '  2) escolar-frontend -> Manual Deploy -> Deploy latest commit' -ForegroundColor Yellow
    Write-Host 'Espera a que digan Live y vuelve a ejecutar este archivo.' -ForegroundColor Yellow
}

Write-Host ''
Read-Host 'Presiona Enter para salir'

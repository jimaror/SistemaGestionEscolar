$dir = 'C:\Users\JMarkz\Desktop\ProyectoWebEscolar\escolar'
$url = $null
foreach ($f in @("$dir\cloudflared.log", "$dir\cloudflared.err")) {
    if (Test-Path $f) {
        $m = Get-Content $f -ErrorAction SilentlyContinue |
            Select-String -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -AllMatches |
            ForEach-Object { $_.Matches } |
            ForEach-Object { $_.Value } |
            Where-Object { $_ -notmatch '/_' } |
            Select-Object -Last 1
        if ($m) { $url = $m }
    }
}
if ($url) {
    Write-Host "URL ENCONTRADA: $url"
} else {
    Write-Host "URL ENCONTRADA: (ninguna - revisa el log)"
}
$ErrorActionPreference = "Continue"

$services = @(
  @{ name = "Auth"; cmd = "pnpm --filter service-auth dev"; port = 3001 },
  @{ name = "Course"; cmd = "pnpm --filter service-course dev"; port = 3002 },
  @{ name = "Video"; cmd = "pnpm --filter service-video dev"; port = 3003 },
  @{ name = "Payment"; cmd = "pnpm --filter service-payment dev"; port = 3004 },
  @{ name = "Notification"; cmd = "pnpm --filter service-notification dev"; port = 3005 },
  @{ name = "Live"; cmd = "pnpm --filter service-live dev"; port = 3006 },
  @{ name = "Test"; cmd = "pnpm --filter service-test dev"; port = 3007 },
  @{ name = "Gateway"; cmd = "pnpm --filter api-gateway dev"; port = 3000 }
)

foreach ($svc in $services) {
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = "powershell.exe"
  $psi.Arguments = "-NoExit -Command `"cd 'C:\Users\LAPTECH\Desktop\yourclass'; $($svc.cmd)`""
  $psi.UseShellExecute = $true
  $psi.WindowStyle = "Normal"
  [System.Diagnostics.Process]::Start($psi) | Out-Null
  Write-Host "Started $($svc.name) on port $($svc.port)"
}

Write-Host ""
Write-Host "All services should be running!"
Write-Host "Gateway: http://localhost:3000"
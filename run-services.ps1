$services = @(
  @{name="Auth"; filter="service-auth"; port=3001},
  @{name="Course"; filter="service-course"; port=3002},
  @{name="Video"; filter="service-video"; port=3003},
  @{name="Payment"; filter="service-payment"; port=3004},
  @{name="Notification"; filter="service-notification"; port=3005},
  @{name="Live"; filter="service-live"; port=3006},
  @{name="Test"; filter="service-test"; port=3007},
  @{name="Gateway"; filter="api-gateway"; port=3000}
)

foreach ($s in $services) {
  $cmd = "pnpm --filter $($s.filter) dev"
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\LAPTECH\Desktop\yourclass'; $cmd" -WindowStyle Normal
  Write-Host "Started $($s.name) on port $($s.port)"
  Start-Sleep 2
}

Write-Host ""
Write-Host "All services started!"
Write-Host "Gateway: http://localhost:3000"
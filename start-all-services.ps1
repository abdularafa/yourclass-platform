$ErrorActionPreference = "Stop"

function Start-Service-InBackground {
    param($Name, $Command)
    $job = Start-Job -ScriptBlock {
        param($cmd, $workdir)
        Set-Location $workdir
        Invoke-Expression $cmd
    } -ArgumentList $Command, (Get-Location).Path
    Write-Host "[Startup] Started $Name"
    return $job
}

Write-Host "Starting all services..."
Write-Host ""

$jobs = @()

$jobs += Start-Service-InBackground "Auth Service" "pnpm --filter service-auth dev"
Start-Sleep 2
$jobs += Start-Service-InBackground "Course Service" "pnpm --filter service-course dev"
Start-Sleep 2
$jobs += Start-Service-InBackground "Video Service" "pnpm --filter service-video dev"
Start-Sleep 2
$jobs += Start-Service-InBackground "Payment Service" "pnpm --filter service-payment dev"
Start-Sleep 2
$jobs += Start-Service-InBackground "Notification Service" "pnpm --filter service-notification dev"
Start-Sleep 2
$jobs += Start-Service-InBackground "Live Service" "pnpm --filter service-live dev"
Start-Sleep 2
$jobs += Start-Service-InBackground "Test Service" "pnpm --filter service-test dev"
Start-Sleep 3

Write-Host ""
Write-Host "Starting API Gateway..."
$jobs += Start-Service-InBackground "API Gateway" "pnpm --filter api-gateway dev"

Write-Host ""
Write-Host "All services started!"
Write-Host "Gateway: http://localhost:3000"
Write-Host ""
Write-Host "Press Ctrl+C to stop all services"

Wait-Job $jobs | Out-Null
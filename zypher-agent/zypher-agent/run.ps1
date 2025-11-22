# Run the Zypher agent safely from PowerShell
# Sets a project-local ZYPHER_HOME and runs the Deno script with minimal permissions.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

# Use project-local .zypher by default
$env:ZYPHER_HOME = Join-Path $scriptDir '.zypher'
if (-not (Test-Path $env:ZYPHER_HOME)) {
    New-Item -ItemType Directory -Path $env:ZYPHER_HOME | Out-Null
}
Write-Host "ZYPHER_HOME set to $env:ZYPHER_HOME"

# Check for Deno
if (-not (Get-Command deno -ErrorAction SilentlyContinue)) {
    Write-Error "Deno not found in PATH. Install Deno by running: iwr https://deno.land/install.ps1 -useb | iex"
    exit 1
}

# Run with minimal permissions: network, env, and write to create .zypher
deno run --unstable --allow-net --allow-env --allow-write main.ts

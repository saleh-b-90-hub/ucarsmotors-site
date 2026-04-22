$ErrorActionPreference = "Continue"
$log = Join-Path $PSScriptRoot "deploy-env-log.txt"
function Log([string]$m) { Add-Content -Path $log -Value $m -Encoding utf8 }
if (Test-Path $log) { Remove-Item $log -Force }
New-Item -Path $log -ItemType File -Force | Out-Null

function RefreshPath {
  $machine = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $user = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machine;$user"
}

Log "=== winget install Git.Git ==="
try {
  winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements 2>&1 | ForEach-Object { Log "$_" }
} catch { Log "$_" }

Log "=== winget install GitHub.cli ==="
try {
  winget install --id GitHub.cli -e --source winget --accept-package-agreements --accept-source-agreements 2>&1 | ForEach-Object { Log "$_" }
} catch { Log "$_" }

RefreshPath
$gitCandidates = @(
  "C:\Program Files\Git\cmd\git.exe",
  "C:\Program Files (x86)\Git\cmd\git.exe"
)
$git = $null
foreach ($c in $gitCandidates) {
  if (Test-Path $c) { $git = $c; break }
}
if (-not $git) { $git = "git" }

Log "=== git --version ==="
try {
  & $git --version 2>&1 | ForEach-Object { Log "$_" }
} catch { Log "$_" }

$proj = "C:\Users\saleh\.cursor\projects\empty-window"
if (-not (Test-Path $proj)) { $proj = $PSScriptRoot }
Set-Location $proj
Log "=== cwd ==="
Log (Get-Location).Path

Log "=== git init / add / commit / remote / push ==="
& $git init 2>&1 | ForEach-Object { Log "$_" }
& $git add . 2>&1 | ForEach-Object { Log "$_" }
& $git commit -m "deploy" 2>&1 | ForEach-Object { Log "$_" }
& $git branch -M main 2>&1 | ForEach-Object { Log "$_" }
& $git remote remove origin 2>&1 | ForEach-Object { Log "$_" }
& $git remote add origin https://github.com/saleh-b-90-hub/ucrasmotors-site.git 2>&1 | ForEach-Object { Log "$_" }
& $git push -u origin main 2>&1 | ForEach-Object { Log "$_" }

Log "=== verify raw index.html ==="
try {
  $r = Invoke-WebRequest -UseBasicParsing -Uri "https://raw.githubusercontent.com/saleh-b-90-hub/ucrasmotors-site/main/index.html" -TimeoutSec 45
  Log ("HTTP " + $r.StatusCode)
} catch { Log $_.Exception.Message }

Log "=== npx vercel --prod ==="
RefreshPath
try {
  npx --yes vercel --prod --yes 2>&1 | ForEach-Object { Log "$_" }
} catch { Log "$_" }

Log "=== probe vercel.app ==="
foreach ($u in @("https://ucrasmotors-site.vercel.app/", "https://ucarsmotors-site.vercel.app/")) {
  try {
    $p = Invoke-WebRequest -UseBasicParsing -Uri $u -TimeoutSec 30
    Log ("$u HTTP " + $p.StatusCode)
  } catch { Log ("$u " + $_.Exception.Message) }
}

Log "DONE"

$ErrorActionPreference = "Continue"
$log = Join-Path $PSScriptRoot "deploy-env-log.txt"
function Log([string]$m) { Add-Content -Path $log -Value $m -Encoding utf8 }

function RefreshPath {
  $machine = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $user = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machine;$user"
}

Log "`n=== PHASE2: Node LTS ==="
try {
  winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements 2>&1 | ForEach-Object { Log "$_" }
} catch { Log "$_" }
RefreshPath

Log "`n=== PHASE2: git identity + commit + push ==="
$git = "C:\Program Files\Git\cmd\git.exe"
$proj = "C:\Users\saleh\.cursor\projects\empty-window"
Set-Location $proj
& $git config user.email "saleh-b-90-hub@users.noreply.github.com"
& $git config user.name "saleh-b-90-hub"
& $git add . 2>&1 | ForEach-Object { Log "$_" }
& $git commit -m "deploy" 2>&1 | ForEach-Object { Log "$_" }
& $git branch -M main 2>&1 | ForEach-Object { Log "$_" }
& $git remote remove origin 2>&1 | ForEach-Object { Log "$_" }
& $git remote add origin https://github.com/saleh-b-90-hub/ucrasmotors-site.git 2>&1 | ForEach-Object { Log "$_" }

Log "=== gh auth status ==="
$gh = "C:\Program Files\GitHub CLI\gh.exe"
if (-not (Test-Path $gh)) { $gh = "gh" }
& $gh auth status 2>&1 | ForEach-Object { Log "$_" }

Log "=== gh auth setup-git ==="
& $gh auth setup-git 2>&1 | ForEach-Object { Log "$_" }

Log "=== git push ==="
& $git push -u origin main 2>&1 | ForEach-Object { Log "$_" }

Log "=== verify raw ==="
try {
  $r = Invoke-WebRequest -UseBasicParsing -Uri "https://raw.githubusercontent.com/saleh-b-90-hub/ucrasmotors-site/main/index.html" -TimeoutSec 45
  Log ("HTTP " + $r.StatusCode)
} catch { Log $_.Exception.Message }

Log "=== npx vercel --prod ==="
& npx.cmd --yes vercel --prod --yes 2>&1 | ForEach-Object { Log "$_" }

Log "=== probe vercel ==="
foreach ($u in @("https://ucrasmotors-site.vercel.app/", "https://ucarsmotors-site.vercel.app/")) {
  try {
    $p = Invoke-WebRequest -UseBasicParsing -Uri $u -TimeoutSec 30
    Log ("$u HTTP " + $p.StatusCode)
  } catch { Log ("$u " + $_.Exception.Message) }
}
Log "PHASE2 DONE"

<# 
  Pushes this folder to GitHub so Vercel can deploy.
  Option A (easiest): GitHub CLI already logged in
    gh auth login
    .\PUSH-TO-GITHUB.ps1

  Option B: Personal Access Token (HTTPS)
    Set env GITHUB_TOKEN to a token with repo scope (classic) or Contents: Read/Write (fine-grained on this repo)
    .\PUSH-TO-GITHUB.ps1
#>
$ErrorActionPreference = "Stop"
$Repo = "saleh-b-90-hub/ucarsmotors-site"
$RemoteHttps = "https://github.com/$Repo.git"

Set-Location $PSScriptRoot

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "Git is not installed or not on PATH. Install Git for Windows, then re-run."
  exit 1
}

if (-not (Test-Path .git)) { git init | Out-Host }

git add -A
$status = git status --porcelain
if ($status) {
  git commit -m "Deploy U Cars Motors website" | Out-Host
} else {
  git commit --allow-empty -m "Deploy U Cars Motors website (empty commit)" | Out-Host
}

git branch -M main

git remote remove origin 2>$null
git remote add origin $RemoteHttps

if (Get-Command gh -ErrorAction SilentlyContinue) {
  try {
    gh auth status 2>&1 | Out-Host
    gh auth setup-git 2>&1 | Out-Host
    git push -u origin main | Out-Host
    Write-Host "OK: pushed via GitHub CLI (gh)."
    exit 0
  } catch {
    Write-Warning "gh present but push failed; trying GITHUB_TOKEN method..."
  }
}

if (-not $env:GITHUB_TOKEN) {
  Write-Error @"
Push failed or no GitHub auth found.

Do ONE of these:
  1) Run: gh auth login
     then: .\PUSH-TO-GITHUB.ps1

  2) Create a PAT: https://github.com/settings/tokens
     Fine-grained: repo $Repo -> Contents Read/Write
     Then in PowerShell:
       `$env:GITHUB_TOKEN = 'YOUR_TOKEN_HERE'
       .\PUSH-TO-GITHUB.ps1
"@
  exit 1
}

$pushUrl = "https://x-access-token:$($env:GITHUB_TOKEN)@github.com/$Repo.git"
git push -u $pushUrl main | Out-Host
Write-Host "OK: pushed using GITHUB_TOKEN."

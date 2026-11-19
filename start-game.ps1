$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Нужен Node.js 22 или новее.' }
$gameHadKey = [bool]$env:DES_DETECTIVE_OPENAI_API_KEY
if (-not $gameHadKey) {
    $gameKey = Read-Host 'Введи отдельный OpenAI API key игры (ввод скрыт, Enter — без ИИ)' -AsSecureString
    $gamePointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($gameKey)
    try { $env:DES_DETECTIVE_OPENAI_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($gamePointer) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($gamePointer); $gameKey.Dispose() }
}
try { node (Join-Path $PSScriptRoot 'server.cjs') }
finally { if (-not $gameHadKey) { Remove-Item Env:DES_DETECTIVE_OPENAI_API_KEY -ErrorAction SilentlyContinue } }

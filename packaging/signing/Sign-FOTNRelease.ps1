param(
  [Parameter(Mandatory=$true)][string]$FilePath,
  [Parameter(Mandatory=$true)][string]$CertificateThumbprint,
  [Parameter(Mandatory=$true)][string]$TimestampUrl
)
$ErrorActionPreference='Stop'
$target=(Resolve-Path $FilePath).Path
$sigTool=Get-ChildItem 'C:\Program Files (x86)\Windows Kits\10\bin' -Filter signtool.exe -Recurse -ErrorAction SilentlyContinue |
  Where-Object {$_.FullName -like '*\x64\signtool.exe'} | Sort-Object FullName -Descending | Select-Object -First 1
if(-not $sigTool){ throw 'SIGNTOOL_MISSING' }
$cert=Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert -ErrorAction SilentlyContinue |
  Where-Object {$_.Thumbprint -eq $CertificateThumbprint -and $_.HasPrivateKey -and $_.NotAfter -gt (Get-Date)} |
  Select-Object -First 1
if(-not $cert){ throw 'CERTIFICATE_REQUIRED_OR_INVALID_THUMBPRINT' }
& $sigTool.FullName sign /sha1 $CertificateThumbprint /fd SHA256 /tr $TimestampUrl /td SHA256 $target
if($LASTEXITCODE -ne 0){ throw "SIGN_FAILED:$LASTEXITCODE" }
& $sigTool.FullName verify /pa /v $target
if($LASTEXITCODE -ne 0){ throw "VERIFY_FAILED:$LASTEXITCODE" }
Get-AuthenticodeSignature -LiteralPath $target | Select-Object Status,StatusMessage,
  @{n='Signer';e={$_.SignerCertificate.Subject}},@{n='Thumbprint';e={$_.SignerCertificate.Thumbprint}} | ConvertTo-Json -Compress

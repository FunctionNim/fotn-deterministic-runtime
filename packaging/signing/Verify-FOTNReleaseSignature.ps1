param([Parameter(Mandatory=$true)][string]$FilePath)
$ErrorActionPreference='Stop'
$target=(Resolve-Path $FilePath).Path
$sig=Get-AuthenticodeSignature -LiteralPath $target
$result=[ordered]@{
  file=$target
  status=[string]$sig.Status
  statusMessage=$sig.StatusMessage
  signer=if($sig.SignerCertificate){$sig.SignerCertificate.Subject}else{$null}
  thumbprint=if($sig.SignerCertificate){$sig.SignerCertificate.Thumbprint}else{$null}
}
$result | ConvertTo-Json -Compress
if($sig.Status -ne 'Valid'){ exit 2 }

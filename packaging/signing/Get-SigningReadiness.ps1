$ErrorActionPreference='Stop'
$sigTool=Get-ChildItem 'C:\Program Files (x86)\Windows Kits\10\bin' -Filter signtool.exe -Recurse -ErrorAction SilentlyContinue |
  Where-Object {$_.FullName -like '*\x64\signtool.exe'} | Sort-Object FullName -Descending | Select-Object -First 1
$certs=@(Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert -ErrorAction SilentlyContinue |
  Where-Object {$_.HasPrivateKey -and $_.NotAfter -gt (Get-Date)})
$status=if(-not $sigTool){'SIGNTOOL_MISSING'}elseif($certs.Count -eq 0){'CERTIFICATE_REQUIRED'}else{'READY'}
[pscustomobject]@{
  status=$status
  signtool=if($sigTool){$sigTool.FullName}else{$null}
  usableCertificateCount=$certs.Count
  certificates=@($certs | Select-Object Subject,Thumbprint,NotAfter)
} | ConvertTo-Json -Depth 5
if($status -ne 'READY'){ exit 2 }

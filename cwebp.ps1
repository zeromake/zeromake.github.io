# 定义参数
param (
    [Parameter(Mandatory=$true, Position=0)]
    [string]$directoryPath
)

# 检查目录是否存在
if (-not (Test-Path -Path $directoryPath -PathType Container)) {
    Write-Host "目录不存在，请检查路径是否正确。" -ForegroundColor Red
    exit
}

# 获取目录中的所有 PNG 文件
$pngFiles = Get-ChildItem -Path $directoryPath -Filter "*.png" -Recurse -File

# 遍历每个 PNG 文件并转换为 WEBP
foreach ($pngFile in $pngFiles) {
    $outputPath = $pngFile.FullName -replace '\.png$', '.webp'
    Write-Host "正在转换 $($pngFile.FullName) 为 $outputPath ..." -NoNewline
    try {
        .\cwebp.exe -q 85 $($pngFile.FullName) -o $outputPath
        Write-Host " 完成。" -ForegroundColor Green
    } catch {
        Write-Host " 失败。" -ForegroundColor Red
        Write-Error $_
    }
}

Write-Host "所有文件转换完成。"
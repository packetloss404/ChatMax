Add-Type -AssemblyName System.Drawing

$bmp32 = New-Object System.Drawing.Bitmap(32,32)
$g32 = [System.Drawing.Graphics]::FromImage($bmp32)
$g32.Clear([System.Drawing.Color]::FromArgb(108,92,231))
$g32.Dispose()
$bmp32.Save("D:\projects\ChatMax\desktop\src-tauri\icons\32x32.png")

$bmp128 = New-Object System.Drawing.Bitmap(128,128)
$g128 = [System.Drawing.Graphics]::FromImage($bmp128)
$g128.Clear([System.Drawing.Color]::FromArgb(108,92,231))
$g128.Dispose()
$bmp128.Save("D:\projects\ChatMax\desktop\src-tauri\icons\128x128.png")

$bmp256 = New-Object System.Drawing.Bitmap(256,256)
$g256 = [System.Drawing.Graphics]::FromImage($bmp256)
$g256.Clear([System.Drawing.Color]::FromArgb(108,92,231))
$g256.Dispose()
$bmp256.Save("D:\projects\ChatMax\desktop\src-tauri\icons\128x128@2x.png")
$bmp256.Save("D:\projects\ChatMax\desktop\src-tauri\icons\icon.png")

$icon = [System.Drawing.Icon]::FromHandle($bmp256.GetHicon())
$fs = New-Object System.IO.FileStream("D:\projects\ChatMax\desktop\src-tauri\icons\icon.ico", [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()

$bmp32.Dispose()
$bmp128.Dispose()
$bmp256.Dispose()

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$sources = Join-Path $PWD 'art/source/1.8.0'
New-Item -ItemType Directory -Force -Path $sources | Out-Null
$files = @{
    dragon = 'exec-1e7908d0-a94b-4c77-83f3-e7b872a280d4.png'
    jet = 'exec-85ad5f7f-63cc-499e-b2ec-d733a3d38eb4.png'
    strategic_jet = 'exec-7d35c5ab-04ef-4f1f-9dfa-a93403c6988d.png'
    helicopter = 'exec-a581c48b-c0ea-4696-8aaf-9fe9aa06b8a1.png'
}
# Source rectangles separate the generated rows before packing into legacy slots.
$rows = @{
    jet = @(@(0,0,1268,358), @(0,358,1268,285), @(0,643,1268,281), @(0,924,1268,316))
    strategic_jet = @(@(0,0,1354,307), @(0,307,1354,292), @(0,599,1354,300), @(0,899,1354,262))
    helicopter = @(@(0,25,840,385), @(0,425,985,325), @(0,760,1000,310), @(0,1075,960,290))
}
foreach ($name in $files.Keys) {

    $atlasPath = Join-Path $PWD "src/assets/sprites/$name.json"

    $atlas = Get-Content -LiteralPath (Join-Path $sources "$name-layout.json") -Raw | ConvertFrom-Json
    $source = [System.Drawing.Bitmap]::FromFile((Join-Path $sources "$name.png"))
    $output = [System.Drawing.Bitmap]::new([int]($atlas.meta.size.w * 2), [int]($atlas.meta.size.h * 2))
    $graphics = [System.Drawing.Graphics]::FromImage($output)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $ordered = @($atlas.frames | Sort-Object { $_.frame.y }, { $_.frame.x })
    for ($i = 0; $i -lt $ordered.Count; $i++) {
        $frame = $ordered[$i].frame
        if ($name -eq 'dragon') {
            $col = $i % 3
            $row = [math]::Floor($i / 3)
            $crop = [System.Drawing.RectangleF]::new($col * 579, $row * 452, 579, 452)
            $dest = [System.Drawing.RectangleF]::new($frame.x * 2 + 8, $frame.y * 2 + $row * 8, 289.5, 226)
        } else {
            $r = $rows[$name][$i]
            $crop = [System.Drawing.RectangleF]::new($r[0], $r[1], $r[2], $r[3])
            $dest = [System.Drawing.RectangleF]::new($frame.x * 2 + 2, $frame.y * 2 + 2, $frame.w * 2 - 4, $frame.h * 2 - 4)
        }
        $graphics.DrawImage($source, $dest, $crop, [System.Drawing.GraphicsUnit]::Pixel)
    }
    $graphics.Dispose()
    $source.Dispose()
    $output.Save((Join-Path $PWD "src/assets/sprites/$name.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $output.Dispose()
    foreach ($entry in $atlas.frames) {
        foreach ($field in @('x','y','w','h')) { $entry.frame.$field *= 2 }
        foreach ($field in @('x','y','w','h')) { $entry.spriteSourceSize.$field *= 2 }
        $entry.sourceSize.w *= 2
        $entry.sourceSize.h *= 2
    }
    $atlas.meta.size.w *= 2
    $atlas.meta.size.h *= 2
    $atlas.meta.scale = '2'
    $atlas | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $atlasPath -Encoding utf8
    Write-Output "Packed $name at $($atlas.meta.size.w)x$($atlas.meta.size.h)"
}



param(
    [string]$Source = (Join-Path (Split-Path $PSScriptRoot -Parent) 'moodle-plugin-src\ueabbuilder'),
    [string]$OutputPath = (Join-Path (Split-Path $PSScriptRoot -Parent) 'artifacts\moodle\block_ueabbuilder-1.6.0.zip')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$sourcePath = (Resolve-Path -LiteralPath $Source).Path
if (!(Test-Path -LiteralPath (Join-Path $sourcePath 'version.php') -PathType Leaf)) {
    throw "Moodle plugin version.php is missing: $sourcePath"
}

$outputPath = [System.IO.Path]::GetFullPath($OutputPath)
[System.IO.Directory]::CreateDirectory((Split-Path $outputPath -Parent)) | Out-Null
$stream = [System.IO.File]::Open($outputPath, 'Create', 'ReadWrite', 'None')
try {
    $archive = [System.IO.Compression.ZipArchive]::new($stream, 'Create', $true)
    try {
        Get-ChildItem -LiteralPath $sourcePath -Recurse -File | ForEach-Object {
            $relative = $_.FullName.Substring($sourcePath.Length).TrimStart([char[]]"\/")
            $entry = $archive.CreateEntry(
                'ueabbuilder/' + $relative.Replace('\', '/'),
                [System.IO.Compression.CompressionLevel]::Optimal
            )
            $entry.LastWriteTime = $_.LastWriteTime
            $input = $_.OpenRead()
            $output = $entry.Open()
            try { $input.CopyTo($output) } finally { $output.Dispose(); $input.Dispose() }
        }
    } finally { $archive.Dispose() }
} finally { $stream.Dispose() }

$archive = [System.IO.Compression.ZipFile]::OpenRead($outputPath)
try {
    $entries = @($archive.Entries | ForEach-Object { $_.FullName })
    if (@($entries | Where-Object { $_ -notmatch '^ueabbuilder/' }).Count -gt 0) {
        throw 'The ZIP contains files outside the ueabbuilder/ root.'
    }
    if (@($entries | Where-Object { $_ -eq 'ueabbuilder/version.php' }).Count -ne 1) {
        throw 'The ZIP does not contain exactly one ueabbuilder/version.php entry.'
    }
    if (@($entries | Where-Object { $_ -match '\\' }).Count -gt 0) {
        throw 'The ZIP contains Windows-style path separators.'
    }
} finally { $archive.Dispose() }

[PSCustomObject]@{
    Package = $outputPath
    Component = 'block_ueabbuilder'
    PluginType = 'block'
    RootDirectory = 'ueabbuilder'
    Files = $entries.Count
    Size = (Get-Item -LiteralPath $outputPath).Length
    SHA256 = (Get-FileHash -LiteralPath $outputPath -Algorithm SHA256).Hash
}

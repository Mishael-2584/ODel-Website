[CmdletBinding()]
param(
    [string]$SourceDirectory,
    [string]$OutputPath
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression

$repositoryRoot = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($SourceDirectory)) {
    $SourceDirectory = Join-Path $repositoryRoot 'moodle-plugin-src\facultyassistant'
}

$sourceRoot = (Resolve-Path -LiteralPath $SourceDirectory).Path
if ((Split-Path -Leaf $sourceRoot) -ne 'facultyassistant') {
    throw 'The Moodle plugin source directory must be named facultyassistant.'
}

$versionPath = Join-Path $sourceRoot 'version.php'
if (-not (Test-Path -LiteralPath $versionPath -PathType Leaf)) {
    throw 'The plugin source is missing facultyassistant/version.php.'
}

$versionCode = [System.IO.File]::ReadAllText($versionPath)
$componentPattern = '(?m)^\s*\$plugin\->component\s*=\s*([''"])(.+?_.+?)\1\s*;'
$componentMatches = [regex]::Matches($versionCode, $componentPattern)
if ($componentMatches.Count -ne 1) {
    throw 'version.php must contain exactly one Moodle-detectable $plugin->component declaration.'
}

$component = $componentMatches[0].Groups[2].Value
if ($component -ne 'local_facultyassistant') {
    throw "Expected component local_facultyassistant, found $component."
}

$releaseMatch = [regex]::Match(
    $versionCode,
    '(?m)^\s*\$plugin\->release\s*=\s*([''"])(.+?)\1\s*;'
)
if (-not $releaseMatch.Success) {
    throw 'version.php must declare $plugin->release.'
}
$release = $releaseMatch.Groups[2].Value

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $OutputPath = Join-Path $repositoryRoot "artifacts\moodle\local_facultyassistant-$release.zip"
}
$outputFullPath = [System.IO.Path]::GetFullPath($OutputPath)
[System.IO.Directory]::CreateDirectory(
    [System.IO.Path]::GetDirectoryName($outputFullPath)
) | Out-Null

$sourceUri = [Uri]($sourceRoot.TrimEnd('\') + '\')
$files = Get-ChildItem -LiteralPath $sourceRoot -Recurse -File |
    Where-Object {
        $_.Name -notin @('.DS_Store', 'Thumbs.db') -and
        $_.FullName -notmatch '[\\/]__MACOSX[\\/]'
    } |
    Sort-Object FullName

if ($files.Count -eq 0) {
    throw 'The Moodle plugin source directory is empty.'
}

$outputStream = [System.IO.File]::Open(
    $outputFullPath,
    [System.IO.FileMode]::Create,
    [System.IO.FileAccess]::ReadWrite,
    [System.IO.FileShare]::None
)
try {
    $archive = New-Object System.IO.Compression.ZipArchive(
        $outputStream,
        [System.IO.Compression.ZipArchiveMode]::Create,
        $true
    )
    try {
        foreach ($file in $files) {
            $relativePath = [Uri]::UnescapeDataString(
                $sourceUri.MakeRelativeUri([Uri]$file.FullName).ToString()
            )
            $entryName = "facultyassistant/$relativePath"
            $entry = $archive.CreateEntry(
                $entryName,
                [System.IO.Compression.CompressionLevel]::Optimal
            )
            $entry.LastWriteTime = [DateTimeOffset]'2000-01-01T00:00:00Z'

            $inputStream = [System.IO.File]::OpenRead($file.FullName)
            try {
                $entryStream = $entry.Open()
                try {
                    $inputStream.CopyTo($entryStream)
                } finally {
                    $entryStream.Dispose()
                }
            } finally {
                $inputStream.Dispose()
            }
        }
    } finally {
        $archive.Dispose()
    }
} finally {
    $outputStream.Dispose()
}

# Mirror Moodle 4.4's installer checks against the finished archive.
$readStream = [System.IO.File]::OpenRead($outputFullPath)
try {
    $archive = New-Object System.IO.Compression.ZipArchive(
        $readStream,
        [System.IO.Compression.ZipArchiveMode]::Read,
        $false
    )
    try {
        $entries = @($archive.Entries | Where-Object {
            -not $_.FullName.EndsWith('/')
        })
        $roots = @($entries | ForEach-Object {
            $_.FullName.Split('/')[0]
        } | Select-Object -Unique)
        if ($roots.Count -ne 1 -or $roots[0] -ne 'facultyassistant') {
            throw 'The finished ZIP must contain exactly one facultyassistant root directory.'
        }

        $versionEntries = @($entries | Where-Object {
            $_.FullName -eq 'facultyassistant/version.php' -and $_.Length -gt 0
        })
        if ($versionEntries.Count -ne 1) {
            throw 'The finished ZIP must contain facultyassistant/version.php directly below its root.'
        }

        $reader = New-Object System.IO.StreamReader($versionEntries[0].Open())
        try {
            $archivedVersionCode = $reader.ReadToEnd()
        } finally {
            $reader.Dispose()
        }
        $archivedMatches = [regex]::Matches(
            $archivedVersionCode,
            $componentPattern
        )
        if (
            $archivedMatches.Count -ne 1 -or
            $archivedMatches[0].Groups[2].Value -ne 'local_facultyassistant'
        ) {
            throw 'Moodle 4.4 would not detect this archive as local_facultyassistant.'
        }
    } finally {
        $archive.Dispose()
    }
} finally {
    $readStream.Dispose()
}

$hash = Get-FileHash -LiteralPath $outputFullPath -Algorithm SHA256
$package = Get-Item -LiteralPath $outputFullPath
[PSCustomObject]@{
    Package = $package.FullName
    Component = $component
    PluginType = 'local'
    RootDirectory = 'facultyassistant'
    Files = $files.Count
    Size = $package.Length
    SHA256 = $hash.Hash
}

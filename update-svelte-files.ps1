$distFolder = Resolve-Path -Path "./dist"

function Update-SvelteFiles {
    param (
        [string]$folder
    )

    $svelteFiles = Get-ChildItem -Path $folder -Filter *.svelte
    $readmeFiles = Get-ChildItem -Path $folder -Filter README.md

    if ($svelteFiles.Count -eq 1 -and $readmeFiles.Count -eq 1) {
        $svelteFile = $svelteFiles[0].FullName
        $readmeFile = $readmeFiles[0].FullName

        $readmeContent = Get-Content -Path $readmeFile -Raw -Encoding utf8
        $componentTagStart = "<!--`r`n@component"
        $componentTagEnd = "-->"

        $svelteContent = Get-Content -Path $svelteFile -Raw -Encoding utf8
        $svelteContent += "`r`n$componentTagStart`r`n$readmeContent`r`n$componentTagEnd"
        Set-Content -Path $svelteFile -Value $svelteContent -Encoding utf8NoBOM
    }
}

function Traverse-Folders {
    param (
        [string]$rootFolder
    )

    $folders = Get-ChildItem -Path $rootFolder -Directory -Recurse
    foreach ($folder in $folders) {
        Update-SvelteFiles -folder $folder.FullName
    }
}

Traverse-Folders -rootFolder $distFolder

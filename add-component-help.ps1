$distFolder = Resolve-Path -Path "./dist"

function Update-SvelteFiles {
    param (
        [string]$folder
    )

    $svelteFiles = Get-ChildItem -Path $folder -Filter *.svelte.d.ts
    $readmeFiles = Get-ChildItem -Path $folder -Filter README.md

    if ($svelteFiles.Count -eq 1 -and $readmeFiles.Count -eq 1) {
        $svelteFile = $svelteFiles[0].FullName
        $readmeFile = $readmeFiles[0].FullName

        # Extract component name from filename (e.g., "Link.svelte.d.ts" -> "Link")
        $componentName = [System.IO.Path]::GetFileNameWithoutExtension($svelteFiles[0].Name) -replace '\.svelte.*$', ''

        $readmeContent = Get-Content -Path $readmeFile -Raw -Encoding utf8
        # Normalize line endings to Unix format
        $readmeContent = $readmeContent -replace "`r`n", "`n" -replace "`r", "`n"
        
        $svelteContent = Get-Content -Path $svelteFile -Raw -Encoding utf8
        
        # Find JSDoc comment before the specific component's declare statement
        $declarePattern = "declare const ${componentName}:"
        if ($svelteContent -match "(/\*\*[\s\S]*?\*/)\s*$([regex]::Escape($declarePattern))") {
            # Replace existing JSDoc comment for this specific component
            $newJSDoc = "/**`n * $($readmeContent -replace "`n", "`n * ")`n */"
            $svelteContent = $svelteContent -replace "/\*\*[\s\S]*?\*/\s*(?=$([regex]::Escape($declarePattern)))", "$newJSDoc`n"
        } else {
            # Add new JSDoc comment before the specific component's declare statement
            $newJSDoc = "/**`n * $($readmeContent -replace "`n", "`n * ")`n */`n"
            $svelteContent = $svelteContent -replace "($([regex]::Escape($declarePattern)))", "$newJSDoc`$1"
        }
        
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

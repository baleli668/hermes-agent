    # Offline mode: source is already extracted by the desktop bootstrap.
    if ($SourceDir) {
        if (-not (Test-Path $SourceDir)) {
            throw "SourceDir does not exist: $SourceDir"
        }
        if ($SourceDir -ne $InstallDir) {
            Write-Info "Copying source from $SourceDir to $InstallDir ..."
            New-Item -ItemType Directory -Force -Path (Split-Path $InstallDir -Parent) | Out-Null
            if (Test-Path $InstallDir) {
                cmd /c "rd /s /q `"$InstallDir`"" 2>$null
                Start-Sleep -Milliseconds 500
                if (Test-Path $InstallDir) {
                    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $InstallDir
                }
            }
            Copy-Item -Recurse -Path "$SourceDir\*" -Destination $InstallDir -ErrorAction Stop
        }
        Write-Success "Source ready (offline bundle)"
        return
    }

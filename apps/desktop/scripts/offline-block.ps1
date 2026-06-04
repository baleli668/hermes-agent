    # Offline mode: source is already extracted by the desktop bootstrap.
    if ($SourceDir) {
        if (-not (Test-Path $SourceDir)) {
            throw "SourceDir does not exist: $SourceDir"
        }
        if ($SourceDir -ne $InstallDir) {
            Write-Info "Copying source from $SourceDir to $InstallDir ..."
            New-Item -ItemType Directory -Force -Path (Split-Path $InstallDir -Parent) | Out-Null
            # Remove stale destination (may be file OR dir from prior runs)
            if (Test-Path $InstallDir) {
                Remove-Item -Force -Recurse -ErrorAction SilentlyContinue $InstallDir
                if (Test-Path $InstallDir) {
                    throw "Could not remove stale destination: $InstallDir"
                }
            }
            Copy-Item -Recurse -Path "$SourceDir\*" -Destination $InstallDir -ErrorAction Stop
        }
        Write-Success "Source ready (offline bundle)"
        return
    }

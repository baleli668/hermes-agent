/**
 * prepare-offline-bundle.cjs
 *
 * Prepares the offline bootstrap bundle shipped inside the Electron app's
 * resources.  On first launch bootstrap-runner.cjs detects the bundle and
 * uses local files instead of downloading from GitHub.
 *
 * KEY DESIGN: install.ps1 is extracted directly from git (binary-clean) and
 * branded via Buffer-level replacements to avoid ANY encoding / line-ending
 * corruption.  The result is self-tested with PowerShell before acceptance.
 *
 * Output: apps/desktop/build/offline/
 *   ├── install.ps1         # NiuMa-branded Windows installer (verified)
 *   ├── install.sh           # Unix installer script
 *   ├── source.tar.gz        # Full project source (git archive)
 *   └── manifest.json        # metadata
 */

const fs = require('node:fs')
const path = require('node:path')
const { execSync } = require('node:child_process')

const ROOT = path.resolve(__dirname, '..', '..', '..')
const OUT = path.resolve(__dirname, '..', 'build', 'offline')

// ── Brand replacements (applied in order to git-clean install.ps1) ──────
// Each entry is [search, replace] — both MUST be UTF-8 strings.
// LONGER strings first to avoid partial-match ordering issues.
const BRAND_REPLACEMENTS = [
  // GitHub URLs — replace BEFORE generic "hermes-agent"
  ['NousResearch/hermes-agent', 'baleli668/hermes-agent'],

  // Paths with backslashes — keep literal, order matters (longer first)
  ['LOCALAPPDATA\\hermes\\hermes-agent', 'LOCALAPPDATA\\niuma\\niuma-agent'],
  ['LOCALAPPDATA\\hermes', 'LOCALAPPDATA\\niuma'],
  ['HERMES_HOME\\hermes-agent', 'HERMES_HOME\\niuma-agent'],
  ['niuma\\hermes-agent', 'niuma\\niuma-agent'],

  // Full phrases
  ['Hermes Agent Installer', 'NiuMa Agent Installer'],
  ['Hermes Agent Persona', 'NiuMa Agent Persona'],
  ['Hermes Agent', 'NiuMa Agent'],
  ['An open source AI agent by Nous Research.', 'Gallop into the future -- an open source AI agent.'],

  // Company
  ['Nous Research', 'NiuMa'],

  // Icon
  ['⚕', '◆'],  // caduceus → diamond

  // Managed string
  ['(Hermes-managed)', '(NiuMa-managed)'],

  // How-to text
  ['how Hermes communicates', 'how NiuMa communicates'],

  // Path shorthand
  ['~/.hermes', '~/.niuma'],

  // Banner color
  ['-ForegroundColor Magenta', '-ForegroundColor Cyan'],
]

// ── Offline-mode SourceDir patch ────────────────────────────────────────
// Read from separate .ps1 snippet to avoid JS backtick / PS backtick conflicts
const SOURCEDIR_BLOCK = fs.readFileSync(path.join(__dirname, 'offline-block.ps1'))

// ── Helpers ─────────────────────────────────────────────────────────────

function getCleanInstallPs1() {
  // Use the LATEST upstream install.ps1 (which we know works — tested).
  const result = execSync(
    'git show upstream/main:scripts/install.ps1',
    { cwd: ROOT, encoding: 'buffer', maxBuffer: 10 * 1024 * 1024 }
  )
  console.log('[offline-bundle] extracted from upstream/main: ' + result.length + ' bytes')
  return result
}

function applyReplacements(buf) {
  for (const [search, replace] of BRAND_REPLACEMENTS) {
    const searchBuf = Buffer.from(search, 'utf8')
    const replaceBuf = Buffer.from(replace, 'utf8')
    let offset = 0
    while (true) {
      const idx = buf.indexOf(searchBuf, offset)
      if (idx === -1) break
      buf = Buffer.concat([buf.subarray(0, idx), replaceBuf, buf.subarray(idx + searchBuf.length)])
      offset = idx + replaceBuf.length
    }
  }
  return buf
}

function addSourceDirParam(buf) {
  // Add [string]$SourceDir = "" before closing ")" of param().
  var pattern = Buffer.from('$IncludeDesktop\n)', 'utf8')
  var replacement = Buffer.from('$IncludeDesktop,\n    [string]$SourceDir = ""\n)', 'utf8')
  var idx = buf.indexOf(pattern)
  if (idx !== -1) {
    buf = Buffer.concat([buf.subarray(0, idx), replacement, buf.subarray(idx + pattern.length)])
    console.log('[offline-bundle] inserted -SourceDir param')
  } else {
    console.error('[offline-bundle] WARNING: could not find IncludeDesktop to add SourceDir')
  }
  return buf
}

function addOfflineBlock(buf) {
  // Insert offline check right after "function Install-Repository {"
  var marker = Buffer.from('function Install-Repository {', 'utf8')
  var idx = buf.indexOf(marker)
  if (idx === -1) {
    console.error('[offline-bundle] WARNING: could not find Install-Repository function')
    return buf
  }
  var insertAt = idx + marker.length
  return Buffer.concat([buf.subarray(0, insertAt), SOURCEDIR_BLOCK, buf.subarray(insertAt)])
}

function selfTest(buf) {
  var testPath = path.join(OUT, '.test_install.ps1')
  fs.writeFileSync(testPath, buf)
  console.log('[offline-bundle] self-test: running PowerShell manifest parse...')
  try {
    var result = execSync(
      'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "' + testPath + '" -Manifest',
      { encoding: 'utf8', timeout: 60000, stdio: 'pipe' }
    )
    var lines = result.split(/\r?\n/).filter(Boolean)
    for (var i = lines.length - 1; i >= 0; i--) {
      try {
        var parsed = JSON.parse(lines[i])
        if (parsed && Array.isArray(parsed.stages) && parsed.stages.length > 0) {
          console.log('[offline-bundle] self-test PASSED — ' + parsed.stages.length + ' stages')
          fs.unlinkSync(testPath)
          return true
        }
      } catch (e) {}
    }
    console.error('[offline-bundle] self-test FAILED: no valid manifest in output')
    console.error('[offline-bundle] stdout:', result.substring(0, 2000))
    fs.unlinkSync(testPath)
    return false
  } catch (err) {
    console.error('[offline-bundle] self-test FAILED: PowerShell exited with error')
    console.error('[offline-bundle] stderr:', (err.stderr || err.message).substring(0, 2000))
    console.error('[offline-bundle] test file kept at: ' + testPath)
    return false
  }
}

// ── Main ────────────────────────────────────────────────────────────────

function main() {
  console.log('[offline-bundle] preparing offline bootstrap bundle...')

  fs.rmSync(OUT, { recursive: true, force: true })
  fs.mkdirSync(OUT, { recursive: true })

  // install.ps1
  console.log('[offline-bundle] extracting clean install.ps1 from git...')
  var buf = getCleanInstallPs1()
  console.log('[offline-bundle] original: ' + buf.length + ' bytes')

  buf = applyReplacements(buf)
  console.log('[offline-bundle] branded: ' + buf.length + ' bytes')

  buf = addSourceDirParam(buf)

  buf = addOfflineBlock(buf)
  console.log('[offline-bundle] +patches: ' + buf.length + ' bytes')

  if (!selfTest(buf)) {
    console.error('[offline-bundle] ABORTING BUILD')
    process.exit(1)
  }

  fs.writeFileSync(path.join(OUT, 'install.ps1'), buf)
  console.log('[offline-bundle] install.ps1 written and verified')

  // install.sh
  var installSh = path.join(ROOT, 'scripts', 'install.sh')
  if (fs.existsSync(installSh)) {
    fs.copyFileSync(installSh, path.join(OUT, 'install.sh'))
    console.log('[offline-bundle] copied install.sh')
  }

  // source.tar.gz
  var tarball = path.join(OUT, 'source.tar.gz')
  console.log('[offline-bundle] creating source tarball via git archive...')
  execSync('git archive --format=tar.gz -o "' + tarball + '" HEAD', { cwd: ROOT, stdio: 'pipe' })
  console.log('[offline-bundle] source.tar.gz: ' + (fs.statSync(tarball).size / 1024 / 1024).toFixed(1) + ' MB')

  // manifest.json
  var commit = 'unknown', branch = 'main'
  try {
    commit = execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim()
    branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT, encoding: 'utf8' }).trim()
  } catch (e) {}

  fs.writeFileSync(
    path.join(OUT, 'manifest.json'),
    JSON.stringify({ sourceCommit: commit, sourceBranch: branch,
      timestamp: new Date().toISOString(), protocol: 'offline-bundle-v1' }, null, 2) + '\n'
  )

  console.log('[offline-bundle] done — all artifacts ready and verified')
}

main()

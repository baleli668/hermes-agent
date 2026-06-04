/**
 * prepare-offline-bundle.cjs
 *
 * Prepares the offline bootstrap bundle that gets shipped inside the Electron
 * app's resources. On first launch, bootstrap-runner.cjs detects the bundle
 * and uses local files instead of downloading from GitHub.
 *
 * Output: apps/desktop/build/offline/
 *   ├── install.ps1         # Windows installer script
 *   ├── install.sh           # Unix installer script
 *   ├── source.tar.gz        # Full project source (no .git, node_modules, etc.)
 *   └── manifest.json        # { sourceCommit, sourceBranch, timestamp }
 */

const fs = require('node:fs')
const path = require('node:path')
const { execSync } = require('node:child_process')

const ROOT = path.resolve(__dirname, '..', '..', '..')
const OUT = path.resolve(__dirname, '..', 'build', 'offline')

// Files/dirs to exclude from source tarball
const EXCLUDES = [
  '.git', '.venv', 'node_modules', '.claude', '.nix-stamps',
  'apps/desktop/node_modules', 'apps/desktop/dist', 'apps/desktop/release',
  'apps/desktop/build',
  'web/node_modules', 'web/dist',
  'ui-tui/node_modules', 'ui-tui/dist',
  'website/node_modules', 'website/build', 'website/.docusaurus',
  '__pycache__', '*.pyc', '*.egg-info', '*.egg',
  'logs', '*.log',
]

function main() {
  console.log('[offline-bundle] preparing offline bootstrap bundle...')

  // Clean and recreate output dir
  fs.rmSync(OUT, { recursive: true, force: true })
  fs.mkdirSync(OUT, { recursive: true })

  // Copy install scripts
  const installPs1 = path.join(ROOT, 'scripts', 'install.ps1')
  const installSh = path.join(ROOT, 'scripts', 'install.sh')

  if (fs.existsSync(installPs1)) {
    fs.copyFileSync(installPs1, path.join(OUT, 'install.ps1'))
    console.log('[offline-bundle] copied install.ps1')
  } else {
    console.error('[offline-bundle] WARNING: install.ps1 not found!')
  }

  if (fs.existsSync(installSh)) {
    fs.copyFileSync(installSh, path.join(OUT, 'install.sh'))
    console.log('[offline-bundle] copied install.sh')
  }

  // Create source tarball using git archive (most reliable way)
  const tarball = path.join(OUT, 'source.tar.gz')
  try {
    const gitDir = path.join(ROOT, '.git')
    if (fs.existsSync(gitDir)) {
      // git archive auto-excludes things in .gitignore
      execSync(
        `git archive --format=tar.gz -o "${tarball}" HEAD`,
        { cwd: ROOT, stdio: 'pipe' }
      )
      console.log('[offline-bundle] created source.tar.gz via git archive')
    } else {
      throw new Error('no .git directory')
    }
  } catch (err) {
    // Fallback: use tar if available
    console.log('[offline-bundle] git archive failed, trying tar fallback...')
    try {
      const excludeArgs = EXCLUDES.map(e => `--exclude="${e}"`).join(' ')
      execSync(
        `tar -czf "${tarball}" ${excludeArgs} -C "${ROOT}" .`,
        { cwd: ROOT, stdio: 'pipe' }
      )
      console.log('[offline-bundle] created source.tar.gz via tar')
    } catch (err2) {
      console.error('[offline-bundle] ERROR: could not create source tarball:', err2.message)
      process.exit(1)
    }
  }

  // Get git info for manifest
  let commit = 'unknown'
  let branch = 'main'
  try {
    commit = execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim()
    branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT, encoding: 'utf8' }).trim()
  } catch {}

  const manifest = {
    sourceCommit: commit,
    sourceBranch: branch,
    timestamp: new Date().toISOString(),
    protocol: 'offline-bundle-v1',
  }
  fs.writeFileSync(
    path.join(OUT, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n'
  )
  console.log('[offline-bundle] wrote manifest.json')

  // Print summary
  const size = fs.statSync(tarball).size
  console.log(`[offline-bundle] done — ${(size / 1024 / 1024).toFixed(1)} MB source tarball`)
}

main()

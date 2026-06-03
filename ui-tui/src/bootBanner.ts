const TEAL = '\x1b[38;2;0;188;212m'
const CYAN = '\x1b[38;2;0;151;167m'
const DARKTEAL = '\x1b[38;2;0;131;143m'
const DIM = '\x1b[38;2;0;96;100m'
const RESET = '\x1b[0m'

const LOGO = [
  '███╗   ██╗██╗██╗   ██╗ ██████╗██╗      █████╗ ██╗    ██╗',
  '████╗  ██║██║██║   ██║██╔════╝██║     ██╔══██╗██║    ██║',
  '██╔██╗ ██║██║██║   ██║██║     ██║     ███████║██║ █╗ ██║',
  '██║╚██╗██║██║██║   ██║██║     ██║     ██╔══██║██║███╗██║',
  '██║ ╚████║██║╚██████╔╝╚██████╗███████╗██║  ██║╚███╔███╔╝',
  '╚═╝  ╚═══╝╚═╝ ╚═════╝  ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝'
]

const GRADIENT = [TEAL, TEAL, CYAN, CYAN, DARKTEAL, DIM] as const
const LOGO_WIDTH = 70

const TAGLINE = `${DIM}◆ NiuMa · Gallop into the future${RESET}`
const FALLBACK = `\x1b[1m${TEAL}◆ NIUMA${RESET}`

export function bootBanner(cols: number = process.stdout.columns || 80): string {
  const body = cols >= LOGO_WIDTH ? LOGO.map((text, i) => `${GRADIENT[i]}${text}${RESET}`).join('\n') : FALLBACK

  return `\n${body}\n${TAGLINE}\n\n`
}

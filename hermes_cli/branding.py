"""NiuClaw brand configuration — single source of truth for all product branding.

Import-safe module with no project dependencies.  Every user-facing surface
(CLI, TUI, web dashboard, install scripts) reads from here so that upstream
merges only conflict in this one file.
"""

from __future__ import annotations

# ── Product identity ─────────────────────────────────────────────────────────

PRODUCT_NAME = "NiuClaw"
PRODUCT_NAME_FULL = "NiuClaw Agent"
PRODUCT_SHORT = "NC"
COMPANY_NAME = "NiuClaw"

CLI_COMMAND = "niuclaw"
CLI_COMMAND_LEGACY = "hermes"  # kept as alias for backward compat

# ── Paths & environment variables ────────────────────────────────────────────

ENV_PREFIX = "NIUCLAW"
ENV_HOME = "NIUCLAW_HOME"
ENV_HOME_LEGACY = "HERMES_HOME"

DATA_DIR_DEFAULT = ".niuclaw"
DATA_DIR_LEGACY = ".hermes"

# Windows-specific paths
WINDOWS_LOCALAPPDATA_SUBDIR = "niuclaw"
WINDOWS_LEGACY_SUBDIR = "hermes"

# ── GitHub / URLs ────────────────────────────────────────────────────────────

GITHUB_ORG = "baleli668"
GITHUB_REPO = "hermes-agent"
GITHUB_UPSTREAM_ORG = "NousResearch"
GITHUB_UPSTREAM_REPO = "hermes-agent"

REPO_URL_HTTPS = f"https://github.com/{GITHUB_ORG}/{GITHUB_REPO}.git"
REPO_URL_SSH = f"git@github.com:{GITHUB_ORG}/{GITHUB_REPO}.git"
UPSTREAM_URL_HTTPS = f"https://github.com/{GITHUB_UPSTREAM_ORG}/{GITHUB_UPSTREAM_REPO}.git"

DOMAIN = "niuclaw.com"
DOCS_URL = f"https://{GITHUB_REPO}.{DOMAIN}/docs"

# ── Color palette (teal/cyan — replaces gold #FFD700) ────────────────────────

COLOR_PRIMARY = "#00BCD4"   # Teal (was #FFD700 gold)
COLOR_ACCENT = "#0097A7"    # Dark teal (was #FFBF00 amber)
COLOR_DIM = "#006064"       # Deep teal (was #B8860B dim bronze)
COLOR_BORDER = "#00838F"    # Border teal (was #CD7F32 bronze)
COLOR_TEXT = "#E0F7FA"      # Light cyan (was #FFF8DC cornsilk)
COLOR_ERROR = "#FF5252"     # Red accent (unchanged)

# ANSI true-color escape equivalents
ANSI_PRIMARY = "\033[1;38;2;0;188;212m"   # bold #00BCD4
ANSI_ACCENT = "\033[1;38;2;0;151;167m"    # bold #0097A7
ANSI_DIM = "\033[2;38;2;0;96;100m"         # dim #006064

# ── Icon & tagline ───────────────────────────────────────────────────────────

ICON = "◆"          # ◆ diamond
TAGLINE = "Claw into the future"
WELCOME_TEXT = f"Welcome to {PRODUCT_NAME_FULL}! Type your message or /help for commands."
GOODBYE_TEXT = "Claws retracted! ◆"

# ── ASCII art ────────────────────────────────────────────────────────────────

NIUCLAW_LOGO = r"""[bold #00BCD4]███╗   ██╗██╗██╗   ██╗ ██████╗██╗      █████╗ ██╗    ██╗[/]
[bold #00BCD4]████╗  ██║██║██║   ██║██╔════╝██║     ██╔══██╗██║    ██║[/]
[#0097A7]██╔██╗ ██║██║██║   ██║██║     ██║     ███████║██║ █╗ ██║[/]
[#0097A7]██║╚██╗██║██║██║   ██║██║     ██║     ██╔══██║██║███╗██║[/]
[#00838F]██║ ╚████║██║╚██████╔╝╚██████╗███████╗██║  ██║╚███╔███╔╝[/]
[#006064]╚═╝  ╚═══╝╚═╝ ╚═════╝  ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝[/]"""

NIUCLAW_HERO = r"""[#006064]                ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄[/]
[#006064]                █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█[/]
[#00838F]                █  ╔╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╗  █[/]
[#00838F]                █  ╚╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╝  █[/]
[#0097A7]     ◆           █  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄  █           ◆[/]
[#0097A7]                █  █▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█  █[/]
[#00BCD4]                █  █▓◇◇◇◇◇◇◇◇◇◇◇◇◇▓█  █[/]
[#00BCD4]                █  █▓◇◆ NIUCLAW ◆◇▓█  █[/]
[#00BCD4]                █  █▓◇◇◇◇◇◇◇◇◇◇◇◇◇▓█  █[/]
[#0097A7]                █  █▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█  █[/]
[#0097A7]     ◆           █  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  █           ◆[/]
[#00838F]                █  ╔╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╦╗  █[/]
[#00838F]                █  ╚╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╝  █[/]
[#006064]                █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█[/]
[#006064]                ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀[/]"""

# ── Default SOUL / system prompt ─────────────────────────────────────────────

DEFAULT_SOUL = (
    f"You are {PRODUCT_NAME_FULL}, an intelligent AI assistant created by {COMPANY_NAME}. "
    "You are helpful, thoughtful, and precise. You have access to a wide range of tools "
    "including file system operations, web search, code execution, and more. "
    "You communicate clearly and concisely, preferring direct answers over verbose explanations. "
    "When you make mistakes, you acknowledge them and correct course. "
    "You are running inside the NiuClaw Agent framework — a self-improving AI agent platform."
)

# ── Skin name constants ──────────────────────────────────────────────────────

DEFAULT_SKIN_NAME = "niuclaw"
LEGACY_SKIN_NAME = "hermes-legacy"

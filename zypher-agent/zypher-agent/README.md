# Zypher Agent

This is a small Deno-based agent using the `@corespeed/zypher` package.

## Requirements

- Deno (latest stable). Install on Windows (PowerShell):

```powershell
iwr https://deno.land/install.ps1 -useb | iex
```

## Environment variables

- `OPENAI_API_KEY` (required): your OpenAI API key.
- `ZYPHER_HOME` (optional): directory for Zypher to store runtime data. If not set, the project will use a project-local `.zypher` directory by default when using `run.ps1`.

You can create a `.env` file in the project root (the project loads `.env`) or set environment variables in your shell.

An example `.env` is provided in `.env.example`.

## Quick start (PowerShell)

From the project directory:

```powershell
cd 'C:\Users\DELL\Downloads\zypher-agent\zypher-agent'

# (Optional) copy example env and add your API key
Copy-Item .env.example .env
# edit .env and set OPENAI_API_KEY

# Zypher Agent - Quick Start

Get Zypher Agent running in under 5 minutes. This guide shows the essential steps to create your first AI agent.

## Prerequisites

- **Deno 2.0+** ([install here](https://deno.land/))
- **API Keys**
  - Anthropic API key ([console.anthropic.com](https://console.anthropic.com/))
  - Firecrawl API key ([firecrawl.dev](https://firecrawl.dev/))
  - Note: Anthropic is used in this example, but you can use OpenAI or other providers.

## Step 1: Install Zypher Agent

```bash
deno add jsr:@corespeed/zypher
deno add npm:rxjs-for-await

```

If you prefer to run manually without the helper, run with minimal permissions:

```powershell
$env:ZYPHER_HOME = Join-Path (Get-Location) '.zypher'
deno run --unstable --allow-net --allow-env --allow-write main.ts
can also use
deno run -A main.ts
```

If you want to use the existing `deno task start` which grants all permissions, run:

```powershell
deno task start
```

## Notes

- `ZYPHER_HOME` controls where Zypher will create its runtime directory. The code respects `ZYPHER_HOME` if set; otherwise it falls back to HOME / USERPROFILE / project cwd.
- The helper `run.ps1` ensures a safe project-local `.zypher` directory is used and that Deno exists before running.


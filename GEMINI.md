# Project Context: cgomanager

## Project Overview
**cgomanager** is currently in its initial setup phase. The project directory is essentially empty, indicating a new development effort.

### Core Technologies
- **Gemini CLI:** Used for AI-assisted development and orchestration.
- **Stitch MCP:** The project is configured with the Stitch MCP server (`https://stitch.googleapis.com/mcp`), which suggests that UI design generation and frontend code scaffolding will be a primary focus.

## Project Structure
As of the initial analysis, the directory contains:
- `.gemini/settings.json`: Configuration for MCP servers (currently `stitch`).
- `GEMINI.md`: This instructional context file.

## Development Status
- [ ] **Define Tech Stack:** Determine whether this will be a Web, Mobile, or CLI application.
- [ ] **Initialize Repository:** Set up version control and project scaffolding (e.g., `npm init`, `go mod init`).
- [ ] **Design Prototype:** Utilize Stitch MCP to generate initial UI screens and design tokens.

## Building and Running
*Commands will be documented here once the project stack is initialized.*

- **Build:** `TODO`
- **Run:** `TODO`
- **Test:** `TODO`

## Development Conventions
*Conventions will be established as the codebase grows.*

- **Styling:** TBD (Recommendation: Vanilla CSS for web prototypes).
- **Tooling:** Leverage Gemini CLI for iterative development and Stitch for UI-first workflows.
- **UX/UI Directive:** Always obtain UX/UI information and designs through the **Stitch MCP** server. **NEVER** use Playwright for visual research or design analysis.


<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax


<!-- nx configuration end-->
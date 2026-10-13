---
name: sumup-mcp
description: Use the SumUp MCP server (https://mcp.sumup.com/mcp) from Cursor, Claude Code, Codex, or any MCP-capable client. Use when the user mentions SumUp MCP, needs to wire mcp.sumup.com, or wants tool-based access to SumUp APIs.
license: Apache-2.0
---

# SumUp MCP Server Guide

Use this skill when setup or usage of the SumUp MCP server is requested.

Canonical endpoint:

- `https://mcp.sumup.com/mcp`

## What this skill covers

- MCP server wiring in MCP-capable clients
- Auth handshake troubleshooting
- Prompt patterns for tool-driven SumUp API tasks
- Safe usage guardrails for production and sandbox contexts

## Choose a Setup

If the SumUp plugin or extension is already installed, use its bundled MCP connection instead of adding a duplicate server. For a new assistant setup, prefer the packaged integration described at https://developer.sumup.com/tools/llms/plugins/.

For Codex, install the plugin from a terminal:

```bash
codex plugin marketplace add sumup/sumup-skills
codex plugin add sumup@sumup
codex plugin list
```

Start a new session to load its skills and tools. Complete SumUp OAuth authorization when prompted. For the Codex IDE extension, use standalone skills and a direct MCP connection.

The hosted endpoint uses OAuth access tokens issued for the MCP resource. Do not configure a SumUp API key (`sup_sk_...`) as its Bearer token. For API-key authentication or stdio-only clients, use the local `@sumup/mcp` package with Node.js 22 or later and `SUMUP_API_KEY`.

## Direct Hosted Setup

1. Add an MCP server entry named `sumup`.
2. Set URL to `https://mcp.sumup.com/mcp`.
3. Use streamable HTTP transport if the client requires explicit transport.
4. Complete authentication flow when prompted by the client.
5. Confirm tools are discoverable before first task prompt.

### Codex

```bash
codex mcp add sumup --url https://mcp.sumup.com/mcp
codex mcp login sumup
codex mcp list
```

Complete the browser authorization flow; use `/mcp` in a session to inspect tools.

### Claude Code

```bash
claude mcp add --transport http --scope user sumup https://mcp.sumup.com/mcp
claude mcp list
```

Run `/mcp` in Claude Code and select the SumUp server to authenticate.

### Cursor

Merge this into `~/.cursor/mcp.json` (all projects) or `.cursor/mcp.json` (one project):

```json
{
  "mcpServers": {
    "sumup": {
      "url": "https://mcp.sumup.com/mcp"
    }
  }
}
```

Complete authorization in Cursor's MCP settings.

For Gemini CLI, VS Code, Claude Desktop, or another client, consult https://developer.sumup.com/tools/llms/mcp-server/ and the client's current documentation. Use the client's actual configuration schema; field names differ between clients.

## Local Setup

For a local stdio server with API-key authentication:

```bash
SUMUP_API_KEY='sup_sk_...' npx -y @sumup/mcp
```

Keep the actual key in the client's private configuration or environment. It is not a credential for the hosted OAuth endpoint.

## Prompt Patterns

- "Use the SumUp MCP tools to show my merchant profile." (Read-only verification.)
- "List my SumUp merchant checkouts from the last 24 hours."
- "Create a sandbox checkout for 12.34 EUR and return the checkout id."
- "Inspect this checkout id and summarize status transitions."
- "Show what data is needed to reconcile failed payments for this reference."

## Common Failure Modes

### Server not reachable

- Confirm exact URL and transport.
- Check client allows outbound HTTPS.
- Retry from a clean session.

### Auth loop or unauthorized

- Re-run auth handshake and ensure correct account/environment.
- For hosted connections, remove any API-key Bearer header and authenticate through OAuth. For local connections, check `SUMUP_API_KEY`.
- Confirm the token/session has required scopes.

### Tools not appearing

- Refresh/reload MCP server in client.
- Confirm server alias matches the expected name in prompts/config.

## Safety and Reliability Rules

- Never expose secrets or raw tokens in prompts or logs.
- Prefer sandbox for new workflows and regression tests.
- For payment-critical actions, verify final checkout status through deterministic reads.
- Record checkout ids/references for auditability and reconciliation.

## Required Response Contract

When answering MCP setup/use requests, include:

1. Exact server configuration snippet.
2. Authentication steps and where failures usually happen.
3. One verification command/prompt to confirm setup.
4. A safe first task in sandbox before production usage.

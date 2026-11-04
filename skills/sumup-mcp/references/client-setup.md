# SumUp MCP Client Setup

Read only the section for the client and transport being configured. If SumUp tools already work, use that connection instead of reinstalling the plugin or adding another server.

## Hosted connection

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

For Gemini CLI, VS Code, Claude Desktop, or another client, consult the [SumUp MCP setup guide](https://developer.sumup.com/tools/llms/mcp-server/) and the client's current documentation. Use the client's actual configuration schema; field names differ between clients.

## Local stdio connection

For a local stdio server with API-key authentication:

```bash
SUMUP_API_KEY='sup_sk_...' npx -y @sumup/mcp
```

Keep the actual key in the client's private configuration or environment. It is not a credential for the hosted OAuth endpoint.

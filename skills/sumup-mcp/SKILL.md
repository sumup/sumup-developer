---
name: sumup-mcp
description: Configure, authenticate, troubleshoot, or use the SumUp MCP server at mcp.sumup.com. Use for MCP client setup, missing tools, OAuth connection failures, merchant account queries, and SumUp documentation resources.
license: Apache-2.0
---

# Use SumUp MCP

First determine whether the request is to use available tools or to configure a connection. If SumUp tools are already available, use them for the requested task; do not reinstall the plugin, add a duplicate server, or repeat setup instructions.

## Connection choices

| Connection | Authentication and requirements |
| --- | --- |
| Hosted `https://mcp.sumup.com/mcp` | Streamable HTTP with OAuth authorization through the client. A SumUp secret API key is not a valid Bearer token for this endpoint. |
| Local `@sumup/mcp` process | stdio with `SUMUP_API_KEY`; Node.js 22 or later. Use when API-key authentication or a stdio-only client is required. |

For a new setup, prefer the [packaged integration](https://developer.sumup.com/tools/llms/setup/) when the client supports it. Use its bundled connection if already installed. For direct configuration, read [client setup](references/client-setup.md) and only the section for the user's client and transport. Merge configuration with existing servers instead of replacing it.

Complete OAuth in the client's browser flow. Verify a new connection with a read-only request such as: "Use the SumUp MCP tools to show my merchant profile." Keep secret keys and tokens in private client configuration or the process environment.

## Documentation resources

When the client supports MCP resources, read the [documentation index](https://developer.sumup.com/llms.txt) and [OpenAPI specification](https://developer.sumup.com/openapi.json). Otherwise fetch those URLs directly; the [API index](https://developer.sumup.com/api/llms.txt) links to endpoint pages and SDK samples. Use the installed tools and current contract rather than guessing tool names or parameters.

## Connection failures

- **Unreachable server:** check the exact endpoint, transport, and outbound HTTPS access.
- **Unauthorized or repeated login:** for hosted MCP, remove any manually configured API-key Bearer header and repeat OAuth; for local stdio, check the private `SUMUP_API_KEY` environment. Confirm the intended merchant account and required permissions.
- **Missing tools:** inspect the active connection and client-supported capabilities, refresh it if needed, and report an absent capability instead of inventing a tool.

## Account operations

Use tools only for the requested account and operation. Taking payments through SumUp MCP is not supported. For payment collection, help the user implement a SumUp API or SDK integration in their application; do not collect card details or invoke tools to process a payment or start a reader payment.

For account queries, report the returned state with stable identifiers and relevant limits. A working query needs its result, not another setup guide. Do not infer payment success from a callback; use authorized reads to check the current state.

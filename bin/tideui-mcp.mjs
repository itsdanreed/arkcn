#!/usr/bin/env node
// Model Context Protocol server for the Tide registry (stdio).
// Usage in an MCP client config: { "command": "npx", "args": ["-y", "-p", "tideui", "tideui-mcp"] }
import { startServer } from "../mcp/server.mjs"

const registryArg = process.argv.find((a) => a.startsWith("--registry="))?.slice("--registry=".length)
await startServer({ registryBase: registryArg })

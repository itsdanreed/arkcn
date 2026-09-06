# MCP server

arkcn ships a [Model Context Protocol](https://modelcontextprotocol.io) server so coding agents can browse the registry, read component source and documentation, plan an install, and copy components into your project.

## Setup

Add it to your MCP client. For Claude Code, Cursor, and most others the config is:

```json
{
  "mcpServers": {
    "arkcn": { "command": "npx", "args": ["-y", "@multicomma/arkcn", "mcp"] }
  }
}
```

In Claude Code you can also run:

```bash
claude mcp add arkcn -- npx -y @multicomma/arkcn mcp
```

## Tools

| Tool | What it does |
| --- | --- |
| `list_components` | Every registry item with type, description, and dependencies |
| `search_components` | Items whose name, description, or docs mention a query |
| `get_component` | Full item: source files, packages, toolkit dependencies, CSS, docs |
| `get_docs` | The reference section for one component |
| `plan_install` | Dry run of `add` against a project: files, conflicts, packages |
| `add_components` | Writes files and CSS into a project and returns the packages to install |

`add_components` never runs your package manager; the agent (or you) installs the packages it reports. The project must have run `init` first so the server knows the alias and directories.

## Example prompts

- "Add a kanban board to this project and wire it to my tasks state."
- "What parts does the data grid export, and how does editing work?"
- "Which arkcn component should I use for a country / state / city picker?"

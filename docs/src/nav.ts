export const guides = [
  { slug: "introduction", title: "Introduction", path: "/docs" },
  { slug: "installation", title: "Installation", path: "/docs/installation" },
  { slug: "cli", title: "CLI", path: "/docs/cli" },
  { slug: "mcp", title: "MCP server", path: "/docs/mcp" },
  { slug: "theming", title: "Theming", path: "/docs/theming" },
  { slug: "conventions", title: "Conventions", path: "/docs/conventions" },
  { slug: "changelog", title: "Changelog", path: "/docs/changelog" },
]

export const guideBySlug = (slug: string) => guides.find((g) => g.slug === slug)
export const guideByPath = (path: string) => guides.find((g) => g.path === path)

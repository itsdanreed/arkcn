import { FrameworkProvider, useFramework } from "./framework"
import * as React from "react"
import { ThemeProvider } from "next-themes"
import { Tooltip } from "@/components/ui/tooltip"
import { Sonner } from "@/components/ui/sonner"
import { Layout } from "./layout"
import { ComponentPage, ComponentsIndex, GuidePage, Home, NotFound, OutlineProvider } from "./pages"
import { RouterProvider, useRoute } from "./router"

function Routes() {
  const { path, navigate } = useRoute()
  const { framework } = useFramework()
  const [outline, setOutline] = React.useState<React.ReactNode>(null)
  const component = path.match(/^\/docs\/components\/([a-z0-9-]+)$/)?.[1]
  let page: React.ReactNode
  if (path === "/") page = <Home />
  else if (path === "/docs/components") page = <ComponentsIndex />
  else if (component) page = <ComponentPage key={`${framework}:${component}`} name={component} />
  else if (path.startsWith("/docs")) page = <GuidePage path={path} />
  else page = <NotFound />
  return (
    <RouterProvider value={{ path, navigate }}>
      <OutlineProvider value={setOutline}>
        <Layout outline={outline}>{page}</Layout>
      </OutlineProvider>
    </RouterProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <FrameworkProvider>
        <Tooltip.Provider>
          <Routes />
          <Sonner.Root />
        </Tooltip.Provider>
      </FrameworkProvider>
    </ThemeProvider>
  )
}

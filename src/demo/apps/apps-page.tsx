import * as React from "react"
import {
  AppCard,
  AppCardActionTrigger,
  AppCardBody,
  AppCardDescription,
  AppCardHeader,
  AppCardLogo,
  AppCardTitle,
  Apps,
  AppsDescription,
  AppsEmpty,
  AppsFilter,
  AppsGrid,
  AppsHeader,
  AppsSearch,
  AppsSeparator,
  AppsSort,
  AppsTitle,
  AppsToolbar,
  AppsToolbarGroup,
  applyAppsQuery,
  type AppsQuery,
} from "./apps-view"
import { apps as initialApps } from "./data"

const filterOptions = [
  { value: "all", label: "All Apps" },
  { value: "connected", label: "Connected" },
  { value: "notConnected", label: "Not Connected" },
]

/** Demo apps page. */
export function AppsPage() {
  const [apps, setApps] = React.useState(initialApps)
  const [query, setQuery] = React.useState<AppsQuery>({ search: "", filter: "all", sort: "asc" })
  const visible = applyAppsQuery(apps, query, { name: (a) => a.name, connected: (a) => a.connected })

  const toggle = (name: string) =>
    setApps((prev) => prev.map((a) => (a.name === name ? { ...a, connected: !a.connected } : a)))

  return (
    <Apps
      search={query.search}
      onSearchChange={(search) => setQuery((q) => ({ ...q, search }))}
      filter={query.filter}
      onFilterChange={(filter) => setQuery((q) => ({ ...q, filter }))}
      sort={query.sort}
      onSortChange={(sort) => setQuery((q) => ({ ...q, sort }))}
    >
      <AppsHeader>
        <AppsTitle>Integrations</AppsTitle>
        <AppsDescription>Connect the tools your team already uses.</AppsDescription>
      </AppsHeader>
      <AppsToolbar>
        <AppsToolbarGroup>
          <AppsSearch />
          <AppsFilter options={filterOptions} />
        </AppsToolbarGroup>
        <AppsSort />
      </AppsToolbar>
      <AppsSeparator />
      <AppsGrid>
        {visible.length === 0 && <AppsEmpty>No apps match your filters.</AppsEmpty>}
        {visible.map((app) => (
          <AppCard key={app.name} connected={app.connected}>
            <AppCardHeader>
              <AppCardLogo>{app.logo}</AppCardLogo>
              <AppCardActionTrigger connected={app.connected} onClick={() => toggle(app.name)} />
            </AppCardHeader>
            <AppCardBody>
              <AppCardTitle>{app.name}</AppCardTitle>
              <AppCardDescription>{app.desc}</AppCardDescription>
            </AppCardBody>
          </AppCard>
        ))}
      </AppsGrid>
    </Apps>
  )
}

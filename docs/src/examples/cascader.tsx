import * as React from "react"
import {
  Cascader,
  CascaderClearTrigger,
  CascaderColumns,
  CascaderContent,
  CascaderEmpty,
  CascaderIndicator,
  CascaderSearch,
  CascaderSearchResults,
  CascaderTrigger,
  CascaderValue,
  createTreeCollection,
} from "@/components/ui/cascader"

const places = createTreeCollection({
  rootNode: {
    value: "root",
    label: "World",
    children: [
      {
        value: "us",
        label: "United States",
        children: [
          {
            value: "ca",
            label: "California",
            children: [
              { value: "sf", label: "San Francisco" },
              { value: "la", label: "Los Angeles" },
            ],
          },
          { value: "ny", label: "New York", children: [{ value: "nyc", label: "New York City" }] },
        ],
      },
      {
        value: "uk",
        label: "United Kingdom",
        children: [{ value: "eng", label: "England", children: [{ value: "lon", label: "London" }] }],
      },
    ],
  },
})

export default function CascaderExample() {
  const [value, setValue] = React.useState<string[]>(["sf"])
  return (
    <Cascader collection={places} value={value} onValueChange={({ value }) => setValue(value)} expandTrigger="hover">
      <CascaderTrigger className="w-80" aria-label="Location">
        <CascaderValue placeholder="Country / State / City" />
        <CascaderClearTrigger />
        <CascaderIndicator />
      </CascaderTrigger>
      <CascaderContent>
        <CascaderSearch placeholder="Search cities" />
        <CascaderColumns />
        <CascaderSearchResults />
        <CascaderEmpty />
      </CascaderContent>
    </Cascader>
  )
}

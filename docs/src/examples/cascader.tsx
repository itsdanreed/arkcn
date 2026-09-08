import * as React from "react"
import { Cascader, createTreeCollection } from "@/components/ui/cascader"

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
    <Cascader.Root
      collection={places}
      value={value}
      onValueChange={({ value }) => setValue(value)}
      expandTrigger="hover"
    >
      <Cascader.Trigger className="w-80" aria-label="Location">
        <Cascader.Value placeholder="Country / State / City" />
        <Cascader.ClearTrigger />
        <Cascader.Indicator />
      </Cascader.Trigger>
      <Cascader.Content>
        <Cascader.Search placeholder="Search cities" />
        <Cascader.Columns />
        <Cascader.SearchResults />
        <Cascader.Empty />
      </Cascader.Content>
    </Cascader.Root>
  )
}

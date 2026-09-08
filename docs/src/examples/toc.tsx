import { Toc } from "@/components/ui/toc"

// Headings on this docs page; `Toc` tracks which one is in view and marks its link active.
const items = [
  { value: "installation", label: "Installation", depth: 2 },
  { value: "usage", label: "Usage", depth: 2 },
  { value: "anatomy", label: "Anatomy", depth: 2 },
  { value: "props", label: "Props", depth: 2 },
  { value: "source", label: "Source", depth: 2 },
]

export default function TocExample() {
  return (
    <Toc.Root items={items} className="w-56">
      <Toc.Title>On this page</Toc.Title>
      <Toc.Content>
        <Toc.List>
          {items.map((item) => (
            <Toc.Item key={item.value} item={item}>
              <Toc.Link href={`#${item.value}`}>{item.label}</Toc.Link>
            </Toc.Item>
          ))}
        </Toc.List>
      </Toc.Content>
    </Toc.Root>
  )
}

import { Toc, TocContent, TocItem, TocLink, TocList, TocTitle } from "@/components/ui/toc"

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
    <Toc items={items} className="w-56">
      <TocTitle>On this page</TocTitle>
      <TocContent>
        <TocList>
          {items.map((item) => (
            <TocItem key={item.value} item={item}>
              <TocLink href={`#${item.value}`}>{item.label}</TocLink>
            </TocItem>
          ))}
        </TocList>
      </TocContent>
    </Toc>
  )
}

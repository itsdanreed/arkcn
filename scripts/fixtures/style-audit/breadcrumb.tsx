import { Breadcrumb } from "../adapters/breadcrumb"
export default function Example() {
  return (
    <div className="space-y-6">
      {(["ltr", "rtl"] as const).flatMap((dir) =>
        [false, true].map((custom) => (
          <section data-audit-case={dir + custom} key={dir + custom} dir={dir}>
            <Breadcrumb.Root>
              <Breadcrumb.List>
                <Breadcrumb.Item>
                  <Breadcrumb.Link href="#home" onClick={(e) => e.preventDefault()}>
                    Home
                  </Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Separator>{custom ? "/" : undefined}</Breadcrumb.Separator>
                <Breadcrumb.Item>
                  <Breadcrumb.Ellipsis />
                </Breadcrumb.Item>
                <Breadcrumb.Separator>{custom ? "/" : undefined}</Breadcrumb.Separator>
                <Breadcrumb.Item>
                  <Breadcrumb.Link asChild>
                    <a href="#components" onClick={(e) => e.preventDefault()}>
                      Components
                    </a>
                  </Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Separator>{custom ? "/" : undefined}</Breadcrumb.Separator>
                <Breadcrumb.Item>
                  <Breadcrumb.Page>Current page with a longer title</Breadcrumb.Page>
                </Breadcrumb.Item>
              </Breadcrumb.List>
            </Breadcrumb.Root>
          </section>
        ))
      )}
    </div>
  )
}

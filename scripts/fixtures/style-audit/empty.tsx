import { Empty } from "../adapters/empty"
import { Button } from "../adapters/button"
import { FolderIcon } from "lucide-react"
export default function Example() {
  return (
    <div className="space-y-6">
      {(["default", "icon"] as const).map((variant) => (
        <section key={variant} data-audit-case={variant}>
          <Empty.Root className="border">
            <Empty.Header>
              <Empty.Media variant={variant}>
                <FolderIcon />
              </Empty.Media>
              <Empty.Title>No documents yet</Empty.Title>
              <Empty.Description>
                Create your first document or{" "}
                <a href="#import" onClick={(e) => e.preventDefault()}>
                  import a file
                </a>{" "}
                to get started.
              </Empty.Description>
            </Empty.Header>
            <Empty.Content>
              <Button>Add document</Button>
              <p>All your documents will appear here.</p>
            </Empty.Content>
          </Empty.Root>
        </section>
      ))}
    </div>
  )
}

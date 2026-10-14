import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
const image =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='64'%3E%3Crect width='320' height='64' fill='%23888'/%3E%3C/svg%3E"
export default function Example() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {(["default", "sm"] as const).flatMap((size) =>
        [false, true].map((media) => (
          <section key={size + media} data-audit-case={size + media}>
            <Card.Root size={size}>
              {media && <img src={image} alt="Cover" className="h-16 w-full object-cover" />}
              <Card.Header className="border-b">
                <Card.Title>Account overview</Card.Title>
                <Card.Description>Your saved workspace preferences.</Card.Description>
                <Card.Action>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Card.Action>
              </Card.Header>
              <Card.Content>Card content</Card.Content>
              {media && (
                <Card.Footer>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </Card.Footer>
              )}
            </Card.Root>
          </section>
        ))
      )}
    </div>
  )
}

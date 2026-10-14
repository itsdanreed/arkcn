import { ToggleGroup } from "@/components/ui/toggle-group"
export default function Example() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {(["horizontal", "vertical"] as const).flatMap((orientation) =>
        ([0, 2] as const).flatMap((spacing) =>
          (["sm", "default", "lg"] as const).map((size) => (
            <section key={`${orientation}-${spacing}-${size}`} data-audit-case={`${orientation}-${spacing}-${size}`}>
              <ToggleGroup.Root
                defaultValue={["first"]}
                variant="outline"
                size={size}
                spacing={spacing}
                orientation={orientation}
              >
                <ToggleGroup.Item value="first">First</ToggleGroup.Item>
                <ToggleGroup.Item value="second">Second</ToggleGroup.Item>
                <ToggleGroup.Item value="disabled" disabled>
                  Disabled
                </ToggleGroup.Item>
              </ToggleGroup.Root>
            </section>
          ))
        )
      )}
    </div>
  )
}

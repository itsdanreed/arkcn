import { RatingGroup } from "@/components/ui/rating-group"
export default function Example() {
  return (
    <div className="space-y-6">
      {["default", "half", "disabled", "readonly"].map((state) => (
        <section key={state} data-audit-case={state}>
          <RatingGroup.Root
            count={5}
            defaultValue={state === "half" ? 2.5 : 3}
            allowHalf={state === "half"}
            disabled={state === "disabled"}
            readOnly={state === "readonly"}
          >
            <RatingGroup.Label>{state}</RatingGroup.Label>
            <RatingGroup.Control>
              <RatingGroup.Context>
                {({ items }) => items.map((index) => <RatingGroup.Item key={index} index={index} />)}
              </RatingGroup.Context>
              <RatingGroup.HiddenInput />
            </RatingGroup.Control>
          </RatingGroup.Root>
        </section>
      ))}
    </div>
  )
}

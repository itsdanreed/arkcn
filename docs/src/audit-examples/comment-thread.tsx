import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CommentThread } from "@/components/ui/comment-thread"

const people = [
  { id: "ava", name: "Ava Chen", initials: "AC" },
  { id: "noah", name: "Noah Patel", initials: "NP" },
]
export default function Example() {
  const [submitted, setSubmitted] = useState("")
  const [invalid, setInvalid] = useState(false)
  return (
    <div className="w-full max-w-sm space-y-4">
      <CommentThread.Root people={people}>
        <CommentThread.List>
          <CommentThread.Item value="first" authorId="ava">
            <CommentThread.Avatar />
            <CommentThread.Item value="reply" authorId="noah" asChild>
              <div>
                <CommentThread.Avatar />
              </div>
            </CommentThread.Item>
            <Button variant="outline" size="sm" aria-pressed={invalid} onClick={() => setInvalid(!invalid)}>
              Invalid
            </Button>
          </CommentThread.Item>
        </CommentThread.List>
        <CommentThread.Composer people={people} onSubmit={({ text }) => setSubmitted(text)} data-audit-part="composer">
          <CommentThread.ComposerInput aria-label="Comment" aria-invalid={invalid || undefined} />
          <CommentThread.ComposerMentionList />
          <CommentThread.ComposerFooter>
            <CommentThread.ComposerCancelTrigger />
            <CommentThread.ComposerSubmitTrigger />
          </CommentThread.ComposerFooter>
        </CommentThread.Composer>
      </CommentThread.Root>
      <output>{submitted && `Submitted: ${submitted}`}</output>
    </div>
  )
}

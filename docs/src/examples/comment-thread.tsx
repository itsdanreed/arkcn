import * as React from "react"
import { CommentThread } from "@/components/ui/comment-thread"

const people = [
  { id: "me", name: "Alex Morgan", initials: "AM" },
  { id: "ava", name: "Ava Chen", initials: "AC" },
  { id: "noah", name: "Noah Patel", initials: "NP" },
]

type Item = { id: string; authorId: string; text: string; at: Date; likes: number }

export default function CommentThreadExample() {
  const [comments, setComments] = React.useState<Item[]>([
    {
      id: "c1",
      authorId: "ava",
      text: "Can we ship this before Friday? @Alex Morgan",
      at: new Date(Date.now() - 7_200_000),
      likes: 2,
    },
    {
      id: "c2",
      authorId: "noah",
      text: "Docs are ready, just waiting on the build.",
      at: new Date(Date.now() - 1_800_000),
      likes: 0,
    },
  ])
  const [replyTo, setReplyTo] = React.useState<string | null>(null)
  return (
    <CommentThread.Root
      people={people}
      currentUserId="me"
      replyTo={replyTo}
      onReplyToChange={setReplyTo}
      className="w-full max-w-lg"
    >
      <CommentThread.List>
        {comments.map((c) => (
          <CommentThread.Item key={c.id} value={c.id} authorId={c.authorId}>
            <CommentThread.Avatar />
            <CommentThread.Content>
              <CommentThread.Header>
                <CommentThread.Author />
                <CommentThread.Time date={c.at} />
              </CommentThread.Header>
              <CommentThread.Body text={c.text} />
              <CommentThread.Reactions>
                <CommentThread.Reaction
                  emoji="👍"
                  count={c.likes}
                  onClick={() =>
                    setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, likes: x.likes + 1 } : x)))
                  }
                />
              </CommentThread.Reactions>
              <CommentThread.Actions>
                <CommentThread.ReplyTrigger />
              </CommentThread.Actions>
            </CommentThread.Content>
          </CommentThread.Item>
        ))}
      </CommentThread.List>
      <CommentThread.Composer
        people={people}
        onSubmit={({ text }) => {
          setComments((prev) => [
            ...prev,
            { id: `c${prev.length + 1}`, authorId: "me", text, at: new Date(), likes: 0 },
          ])
          setReplyTo(null)
        }}
        onCancel={() => setReplyTo(null)}
        className="mt-2"
      >
        <CommentThread.ComposerReplyingTo />
        <CommentThread.ComposerInput placeholder="Write a comment… type @ to mention" />
        <CommentThread.ComposerMentionList />
        <CommentThread.ComposerFooter>
          <CommentThread.ComposerHint />
          <CommentThread.ComposerSubmitTrigger />
        </CommentThread.ComposerFooter>
      </CommentThread.Composer>
    </CommentThread.Root>
  )
}

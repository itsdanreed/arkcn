import * as React from "react"
import {
  Comment,
  CommentActions,
  CommentAuthor,
  CommentAvatar,
  CommentBody,
  CommentComposer,
  CommentComposerFooter,
  CommentComposerHint,
  CommentComposerInput,
  CommentComposerMentionList,
  CommentComposerSubmitTrigger,
  CommentContent,
  CommentHeader,
  CommentList,
  CommentReaction,
  CommentReactions,
  CommentReplyTrigger,
  CommentThread,
  CommentTime,
} from "@/components/ui/comment-thread"

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
    <CommentThread
      people={people}
      currentUserId="me"
      replyTo={replyTo}
      onReplyToChange={setReplyTo}
      className="w-full max-w-lg"
    >
      <CommentList>
        {comments.map((c) => (
          <Comment key={c.id} value={c.id} authorId={c.authorId}>
            <CommentAvatar />
            <CommentContent>
              <CommentHeader>
                <CommentAuthor />
                <CommentTime date={c.at} />
              </CommentHeader>
              <CommentBody text={c.text} />
              <CommentReactions>
                <CommentReaction
                  emoji="👍"
                  count={c.likes}
                  onClick={() =>
                    setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, likes: x.likes + 1 } : x)))
                  }
                />
              </CommentReactions>
              <CommentActions>
                <CommentReplyTrigger />
              </CommentActions>
            </CommentContent>
          </Comment>
        ))}
      </CommentList>
      <CommentComposer
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
        <CommentComposerInput placeholder="Write a comment… type @ to mention" />
        <CommentComposerMentionList />
        <CommentComposerFooter>
          <CommentComposerHint />
          <CommentComposerSubmitTrigger />
        </CommentComposerFooter>
      </CommentComposer>
    </CommentThread>
  )
}

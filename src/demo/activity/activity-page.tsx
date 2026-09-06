import * as React from "react"
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  FileUpIcon,
  MessageSquareIcon,
  RocketIcon,
  Trash2Icon,
  UserPlusIcon,
} from "lucide-react"
import { toast } from "sonner"
import {
  ActivityFeed,
  ActivityFeedEmpty,
  ActivityFeedGroup,
  ActivityFeedGroupLabel,
  ActivityFeedItem,
  ActivityFeedItemActor,
  ActivityFeedItemBody,
  ActivityFeedItemContent,
  ActivityFeedItemHeader,
  ActivityFeedItemMarker,
  ActivityFeedItemTime,
  ActivityFeedItems,
  ActivityFeedLoadMoreTrigger,
} from "@/components/ui/activity-feed"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Comment,
  CommentActions,
  CommentAuthor,
  CommentAvatar,
  CommentBody,
  CommentComposer,
  CommentComposerCancelTrigger,
  CommentComposerFooter,
  CommentComposerHint,
  CommentComposerInput,
  CommentComposerMentionList,
  CommentComposerReplyingTo,
  CommentComposerSubmitTrigger,
  CommentContent,
  CommentEditTrigger,
  CommentEmpty,
  CommentHeader,
  CommentList,
  CommentMeta,
  CommentReaction,
  CommentReactions,
  CommentReplies,
  CommentReplyTrigger,
  CommentThread,
  CommentTime,
  useCommentThread,
  type CommentPerson,
} from "@/components/ui/comment-thread"
import {
  Popconfirm,
  PopconfirmCancelTrigger,
  PopconfirmConfirmTrigger,
  PopconfirmContent,
  PopconfirmDescription,
  PopconfirmFooter,
  PopconfirmHeader,
  PopconfirmIcon,
  PopconfirmTitle,
  PopconfirmTrigger,
} from "@/components/ui/popconfirm"
import { SegmentGroup, SegmentGroupIndicator, SegmentGroupItem } from "@/components/ui/segment-group"
import { cn } from "@/lib/utils"

/* -------------------------------- data ---------------------------------- */

const me: CommentPerson = { id: "me", name: "Alex Morgan", initials: "AM" }
const people: CommentPerson[] = [
  me,
  { id: "olivia", name: "Olivia Martin", initials: "OM" },
  { id: "jackson", name: "Jackson Lee", initials: "JL" },
  { id: "sofia", name: "Sofia Davis", initials: "SD" },
  { id: "will", name: "William Kim", initials: "WK" },
  { id: "isabella", name: "Isabella Nguyen", initials: "IN" },
]
const personById = (id: string) => people.find((p) => p.id === id)

type Reaction = { emoji: string; userIds: string[] }
type CommentItem = {
  id: string
  authorId: string
  text: string
  createdAt: Date
  editedAt?: Date
  reactions: Reaction[]
  replies: CommentItem[]
}

type ActivityKind = "comment" | "status" | "assign" | "import" | "invite" | "deploy"
type Activity = {
  id: string
  kind: ActivityKind
  actorId: string
  at: Date
  summary: React.ReactNode
  detail?: string
  mentionsMe?: boolean
  unread?: boolean
}

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000)
const hoursAgo = (h: number) => minutesAgo(h * 60)
const daysAgo = (d: number) => hoursAgo(d * 24)

let seq = 0
const uid = () => `c-${Date.now().toString(36)}-${(seq++).toString(36)}`

function buildComments(): CommentItem[] {
  return [
    {
      id: "c1",
      authorId: "olivia",
      text: "Customers on the annual plan keep hitting the export limit. @Alex Morgan can we raise it for them before the release?",
      createdAt: hoursAgo(5),
      reactions: [{ emoji: "👍", userIds: ["me", "jackson"] }],
      replies: [
        {
          id: "c1-1",
          authorId: "me",
          text: "Yes. Raising it to 50k rows for annual, and I'll add a note to the release notes. @Jackson Lee is that fine for the export worker?",
          createdAt: hoursAgo(4),
          reactions: [],
          replies: [],
        },
        {
          id: "c1-2",
          authorId: "jackson",
          text: "Fine as long as we stream it. I'll switch the worker to chunked writes today.",
          createdAt: hoursAgo(3),
          editedAt: hoursAgo(2.5),
          reactions: [{ emoji: "🎉", userIds: ["olivia", "me", "sofia"] }],
          replies: [],
        },
      ],
    },
    {
      id: "c2",
      authorId: "sofia",
      text: "Design review notes are in the ticket. The only open question is the empty state copy.",
      createdAt: hoursAgo(1.5),
      reactions: [],
      replies: [],
    },
  ]
}

const activityIcon: Record<ActivityKind, React.ComponentType<{ className?: string }>> = {
  comment: MessageSquareIcon,
  status: CheckCircle2Icon,
  assign: ArrowRightIcon,
  import: FileUpIcon,
  invite: UserPlusIcon,
  deploy: RocketIcon,
}

function buildActivity(): Activity[] {
  const name = (id: string) => personById(id)?.name ?? id
  return [
    {
      id: "a1",
      kind: "status",
      actorId: "sofia",
      at: minutesAgo(12),
      summary: (
        <>
          moved <strong>#1042 Export limit</strong> to <Badge variant="secondary">In review</Badge>
        </>
      ),
      unread: true,
    },
    {
      id: "a2",
      kind: "comment",
      actorId: "jackson",
      at: minutesAgo(48),
      summary: (
        <>
          commented on <strong>#1042 Export limit</strong>
        </>
      ),
      detail: "Fine as long as we stream it. I'll switch the worker to chunked writes today.",
      unread: true,
    },
    {
      id: "a3",
      kind: "comment",
      actorId: "olivia",
      at: hoursAgo(5),
      summary: (
        <>
          mentioned you in <strong>#1042 Export limit</strong>
        </>
      ),
      detail: `${name("olivia")}: "@Alex Morgan can we raise it for them before the release?"`,
      mentionsMe: true,
    },
    {
      id: "a4",
      kind: "assign",
      actorId: "olivia",
      at: hoursAgo(6),
      summary: (
        <>
          assigned <strong>#1042 Export limit</strong> to <ActivityFeedItemActor>Alex Morgan</ActivityFeedItemActor>
        </>
      ),
      mentionsMe: true,
    },
    {
      id: "a5",
      kind: "import",
      actorId: "me",
      at: hoursAgo(9),
      summary: (
        <>
          imported <strong>1,200 leads</strong> with the <strong>Leads</strong> mapping
        </>
      ),
      detail: "1,184 created · 16 updated · 3 skipped",
    },
    {
      id: "a6",
      kind: "deploy",
      actorId: "will",
      at: daysAgo(1.1),
      summary: (
        <>
          deployed <strong>v2.14.0</strong> to production
        </>
      ),
    },
    {
      id: "a7",
      kind: "invite",
      actorId: "me",
      at: daysAgo(1.4),
      summary: (
        <>
          invited <strong>Isabella Nguyen</strong> as a Manager
        </>
      ),
    },
    {
      id: "a8",
      kind: "status",
      actorId: "jackson",
      at: daysAgo(2.2),
      summary: (
        <>
          closed <strong>#1037 Login loop on Safari</strong>
        </>
      ),
    },
  ]
}

function buildOlderActivity(): Activity[] {
  return [
    {
      id: "a9",
      kind: "comment",
      actorId: "isabella",
      at: daysAgo(4),
      summary: (
        <>
          commented on <strong>#1031 Billing address</strong>
        </>
      ),
      detail: "Confirmed with finance, the field is optional for EU customers.",
    },
    {
      id: "a10",
      kind: "deploy",
      actorId: "will",
      at: daysAgo(6),
      summary: (
        <>
          deployed <strong>v2.13.2</strong> to production
        </>
      ),
    },
  ]
}

const groupLabel = (date: Date) => {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000)
  if (days < 1) return "Today"
  if (days < 2) return "Yesterday"
  if (days < 7) return "This week"
  return "Earlier"
}

/* ------------------------------ comments -------------------------------- */

function updateComment(list: CommentItem[], id: string, fn: (c: CommentItem) => CommentItem | null): CommentItem[] {
  return list
    .map((c) => {
      if (c.id === id) return fn(c)
      return { ...c, replies: updateComment(c.replies, id, fn) }
    })
    .filter((c): c is CommentItem => c !== null)
}

function findComment(list: CommentItem[], id: string): CommentItem | undefined {
  for (const c of list) {
    if (c.id === id) return c
    const nested = findComment(c.replies, id)
    if (nested) return nested
  }
  return undefined
}

function toggleReaction(reactions: Reaction[], emoji: string, userId: string): Reaction[] {
  const existing = reactions.find((r) => r.emoji === emoji)
  if (!existing) return [...reactions, { emoji, userIds: [userId] }]
  const userIds = existing.userIds.includes(userId)
    ? existing.userIds.filter((u) => u !== userId)
    : [...existing.userIds, userId]
  return reactions.map((r) => (r.emoji === emoji ? { ...r, userIds } : r)).filter((r) => r.userIds.length > 0)
}

const emojis = ["👍", "🎉", "❤️", "👀"]

function CommentNode({
  comment,
  onReact,
  onDelete,
  onEdit,
}: {
  comment: CommentItem
  onReact: (id: string, emoji: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, text: string) => void
}) {
  const { editing, setEditing } = useCommentThread()
  const isEditing = editing === comment.id
  return (
    <Comment value={comment.id} authorId={comment.authorId}>
      <CommentAvatar />
      <CommentContent>
        <CommentHeader>
          <CommentAuthor />
          <CommentTime date={comment.createdAt} />
          {comment.editedAt && <CommentMeta>edited</CommentMeta>}
        </CommentHeader>
        {isEditing ? (
          <CommentComposer
            people={people}
            defaultValue={comment.text}
            onSubmit={({ text }) => {
              onEdit(comment.id, text)
              setEditing(null)
            }}
            onCancel={() => setEditing(null)}
            className="mt-1"
          >
            <CommentComposerInput
              autoFocus
              aria-label="Edit comment"
              className="min-h-16"
              placeholder="Edit your comment…"
            />
            <CommentComposerMentionList />
            <CommentComposerFooter>
              <CommentComposerHint />
              <CommentComposerCancelTrigger />
              <CommentComposerSubmitTrigger>Save</CommentComposerSubmitTrigger>
            </CommentComposerFooter>
          </CommentComposer>
        ) : (
          <CommentBody text={comment.text} />
        )}
        {!isEditing && (
          <div className="flex flex-wrap items-center gap-2">
            <CommentReactions>
              {emojis.map((emoji) => {
                const reaction = comment.reactions.find((r) => r.emoji === emoji)
                const count = reaction?.userIds.length ?? 0
                if (!count && emoji !== "👍") return null
                return (
                  <CommentReaction
                    key={emoji}
                    emoji={emoji}
                    count={count}
                    active={reaction?.userIds.includes(me.id) ?? false}
                    onClick={() => onReact(comment.id, emoji)}
                    title={reaction ? reaction.userIds.map((id) => personById(id)?.name ?? id).join(", ") : undefined}
                  />
                )
              })}
            </CommentReactions>
            <CommentActions>
              <CommentReplyTrigger />
              {comment.authorId === me.id && (
                <>
                  <CommentEditTrigger />
                  <Popconfirm positioning={{ placement: "top-start" }}>
                    <PopconfirmTrigger asChild>
                      <Button variant="ghost" size="xs" className="h-6 px-1.5 text-xs text-muted-foreground">
                        <Trash2Icon /> Delete
                      </Button>
                    </PopconfirmTrigger>
                    <PopconfirmContent>
                      <PopconfirmHeader>
                        <PopconfirmIcon />
                        <PopconfirmTitle>Delete this comment?</PopconfirmTitle>
                        <PopconfirmDescription>Replies to it are removed as well.</PopconfirmDescription>
                      </PopconfirmHeader>
                      <PopconfirmFooter>
                        <PopconfirmCancelTrigger />
                        <PopconfirmConfirmTrigger onConfirm={() => onDelete(comment.id)}>
                          Delete
                        </PopconfirmConfirmTrigger>
                      </PopconfirmFooter>
                    </PopconfirmContent>
                  </Popconfirm>
                </>
              )}
            </CommentActions>
          </div>
        )}
        {comment.replies.length > 0 && (
          <CommentReplies>
            {comment.replies.map((reply) => (
              <CommentNode key={reply.id} comment={reply} onReact={onReact} onDelete={onDelete} onEdit={onEdit} />
            ))}
          </CommentReplies>
        )}
      </CommentContent>
    </Comment>
  )
}

/* --------------------------------- page --------------------------------- */

type Filter = "all" | "mentions" | "comments"

export function ActivityPage() {
  const [activity, setActivity] = React.useState<Activity[]>(buildActivity)
  const [older, setOlder] = React.useState(false)
  const [filter, setFilter] = React.useState<Filter>("all")
  const [comments, setComments] = React.useState<CommentItem[]>(buildComments)
  const [replyTo, setReplyTo] = React.useState<string | null>(null)

  const visible = React.useMemo(() => {
    const all = older ? [...activity, ...buildOlderActivity()] : activity
    return all.filter((a) => (filter === "all" ? true : filter === "mentions" ? a.mentionsMe : a.kind === "comment"))
  }, [activity, older, filter])

  const groups = React.useMemo(() => {
    const map = new Map<string, Activity[]>()
    for (const item of visible) {
      const label = groupLabel(item.at)
      map.set(label, [...(map.get(label) ?? []), item])
    }
    return [...map.entries()]
  }, [visible])

  const markRead = (id: string) => setActivity((prev) => prev.map((a) => (a.id === id ? { ...a, unread: false } : a)))

  const post = ({ text, mentions }: { text: string; mentions: string[] }) => {
    const comment: CommentItem = { id: uid(), authorId: me.id, text, createdAt: new Date(), reactions: [], replies: [] }
    if (replyTo) {
      setComments((prev) => updateComment(prev, replyTo, (c) => ({ ...c, replies: [...c.replies, comment] })))
    } else {
      setComments((prev) => [...prev, comment])
    }
    setReplyTo(null)
    setActivity((prev) => [
      {
        id: `act-${comment.id}`,
        kind: "comment",
        actorId: me.id,
        at: comment.createdAt,
        summary: (
          <>
            {replyTo ? "replied on" : "commented on"} <strong>#1042 Export limit</strong>
          </>
        ),
        detail: text,
      },
      ...prev,
    ])
    if (mentions.length) {
      toast(`Notified ${mentions.map((id) => personById(id)?.name ?? id).join(", ")}`)
    }
  }

  const react = (id: string, emoji: string) =>
    setComments((prev) =>
      updateComment(prev, id, (c) => ({ ...c, reactions: toggleReaction(c.reactions, emoji, me.id) }))
    )
  const remove = (id: string) => setComments((prev) => updateComment(prev, id, () => null))
  const edit = (id: string, text: string) =>
    setComments((prev) => updateComment(prev, id, (c) => ({ ...c, text, editedAt: new Date() })))

  const replyingTo = replyTo ? findComment(comments, replyTo) : undefined
  const unread = activity.filter((a) => a.unread).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Activity</h2>
          <p className="text-muted-foreground">
            What happened across the workspace, and the discussion on a ticket. Type <code>@</code> to mention someone.
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                Feed
                {unread > 0 && (
                  <Badge className="h-5 min-w-5 justify-center rounded-full px-1.5 tabular-nums">{unread}</Badge>
                )}
              </CardTitle>
              <CardDescription>Newest first. PageUp and PageDown move between items.</CardDescription>
            </div>
            <SegmentGroup value={filter} onValueChange={({ value }) => value && setFilter(value as Filter)}>
              <SegmentGroupIndicator />
              <SegmentGroupItem value="all">All</SegmentGroupItem>
              <SegmentGroupItem value="mentions">Mentions</SegmentGroupItem>
              <SegmentGroupItem value="comments">Comments</SegmentGroupItem>
            </SegmentGroup>
          </CardHeader>
          <CardContent>
            <ActivityFeed>
              {groups.length === 0 && <ActivityFeedEmpty>Nothing here yet.</ActivityFeedEmpty>}
              {groups.map(([label, items]) => (
                <ActivityFeedGroup key={label}>
                  <ActivityFeedGroupLabel>{label}</ActivityFeedGroupLabel>
                  <ActivityFeedItems>
                    {items.map((item) => {
                      const Icon = activityIcon[item.kind]
                      const actor = personById(item.actorId)
                      return (
                        <ActivityFeedItem
                          key={item.id}
                          value={item.id}
                          data-unread={item.unread ? "" : undefined}
                          onFocus={() => item.unread && markRead(item.id)}
                          onClick={() => item.unread && markRead(item.id)}
                        >
                          <ActivityFeedItemMarker
                            className={cn(item.kind === "comment" && "border-0 bg-transparent p-0")}
                          >
                            {item.kind === "comment" ? (
                              <Avatar size="sm" className="size-8">
                                <AvatarFallback>{actor?.initials}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <Icon />
                            )}
                          </ActivityFeedItemMarker>
                          <ActivityFeedItemContent>
                            <ActivityFeedItemHeader>
                              <ActivityFeedItemActor>{actor?.id === me.id ? "You" : actor?.name}</ActivityFeedItemActor>
                              <span>{item.summary}</span>
                              <ActivityFeedItemTime date={item.at} className="ms-auto" />
                              {item.unread && (
                                <span
                                  aria-label="Unread"
                                  className="size-2 shrink-0 self-center rounded-full bg-primary"
                                />
                              )}
                            </ActivityFeedItemHeader>
                            {item.detail && <ActivityFeedItemBody>{item.detail}</ActivityFeedItemBody>}
                          </ActivityFeedItemContent>
                        </ActivityFeedItem>
                      )
                    })}
                  </ActivityFeedItems>
                </ActivityFeedGroup>
              ))}
              {!older && filter === "all" && <ActivityFeedLoadMoreTrigger onClick={() => setOlder(true)} />}
            </ActivityFeed>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>#1042 Export limit</CardTitle>
            <CardDescription>
              {comments.reduce((n, c) => n + 1 + c.replies.length, 0)} comments · Reply inline, react, or edit your own.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CommentThread people={people} currentUserId={me.id} replyTo={replyTo} onReplyToChange={setReplyTo}>
              {comments.length === 0 ? (
                <CommentEmpty>No comments yet. Start the discussion below.</CommentEmpty>
              ) : (
                <CommentList>
                  {comments.map((comment) => (
                    <CommentNode key={comment.id} comment={comment} onReact={react} onDelete={remove} onEdit={edit} />
                  ))}
                </CommentList>
              )}
              <CommentComposer people={people} onSubmit={post} onCancel={() => setReplyTo(null)} className="mt-2">
                <CommentComposerReplyingTo>
                  {() => (
                    <span>
                      Replying to{" "}
                      <span className="font-medium text-foreground">
                        {personById(replyingTo?.authorId ?? "")?.name}
                      </span>
                    </span>
                  )}
                </CommentComposerReplyingTo>
                <CommentComposerInput
                  placeholder={replyTo ? "Write a reply…" : "Add a comment…"}
                  aria-label="Comment"
                />
                <CommentComposerMentionList />
                <CommentComposerFooter>
                  <CommentComposerHint />
                  {replyTo && <CommentComposerCancelTrigger />}
                  <CommentComposerSubmitTrigger>{replyTo ? "Reply" : "Comment"}</CommentComposerSubmitTrigger>
                </CommentComposerFooter>
              </CommentComposer>
            </CommentThread>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import * as React from "react"
import {
  AlertTriangleIcon,
  BellOffIcon,
  CheckCircle2Icon,
  FileUpIcon,
  MessageSquareIcon,
  UserPlusIcon,
} from "lucide-react"
import {
  AppShellNotificationItem,
  AppShellNotificationItemContent,
  AppShellNotificationItemDescription,
  AppShellNotificationItemIcon,
  AppShellNotificationItemIndicator,
  AppShellNotificationItemTime,
  AppShellNotificationItemTitle,
  AppShellNotifications,
  AppShellNotificationsActionTrigger,
  AppShellNotificationsContent,
  AppShellNotificationsEmpty,
  AppShellNotificationsFooter,
  AppShellNotificationsHeader,
  AppShellNotificationsList,
  AppShellNotificationsTitle,
  AppShellNotificationsTrigger,
} from "@/components/ui/app-shell"

type Notification = {
  id: string
  title: string
  description: string
  time: string
  icon: React.ReactNode
  unread: boolean
  href?: string
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "New message from Alex John",
    description: "See you later, Alex!",
    time: "2m ago",
    icon: <MessageSquareIcon />,
    unread: true,
    href: "/inbox",
  },
  {
    id: "2",
    title: "Taylor Grande joined your team",
    description: "Assign a role to define their access level.",
    time: "1h ago",
    icon: <UserPlusIcon />,
    unread: true,
    href: "/members",
  },
  {
    id: "3",
    title: "Import finished with 5 conflicts",
    description: "crm-export-2026-08.csv · 1,190 rows. Decide which values win.",
    time: "3h ago",
    icon: <FileUpIcon />,
    unread: true,
    href: "/import/history/imp-1",
  },
  {
    id: "4",
    title: "Olivia edited the “Event leads” mapping",
    description: "Job title is now imported for contacts.",
    time: "Yesterday",
    icon: <AlertTriangleIcon />,
    unread: false,
    href: "/import/mappings/m-leads",
  },
  {
    id: "5",
    title: "TASK-7322 is now In Progress",
    description: "Bardus soleo tristis coma uberrime supplanto tollo.",
    time: "2d ago",
    icon: <CheckCircle2Icon />,
    unread: false,
    href: "/projects/tasks",
  },
]

export function NotificationsMenu({ navigate }: { navigate: (to: string) => void }) {
  const [items, setItems] = React.useState(initialNotifications)
  const [open, setOpen] = React.useState(false)
  const unread = items.filter((n) => n.unread).length

  const markRead = (id: string) => setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)))

  return (
    <AppShellNotifications open={open} onOpenChange={({ open }) => setOpen(open)}>
      <AppShellNotificationsTrigger count={unread} />
      <AppShellNotificationsContent>
        <AppShellNotificationsHeader>
          <AppShellNotificationsTitle>Notifications</AppShellNotificationsTitle>
          {unread > 0 && (
            <AppShellNotificationsActionTrigger
              onClick={() => setItems((prev) => prev.map((n) => ({ ...n, unread: false })))}
            >
              Mark all as read
            </AppShellNotificationsActionTrigger>
          )}
        </AppShellNotificationsHeader>
        {items.length === 0 ? (
          <AppShellNotificationsEmpty>
            <BellOffIcon />
            You're all caught up
          </AppShellNotificationsEmpty>
        ) : (
          <AppShellNotificationsList>
            {items.map((n) => (
              <AppShellNotificationItem key={n.id} unread={n.unread} asChild>
                <button
                  type="button"
                  onClick={() => {
                    markRead(n.id)
                    setOpen(false)
                    if (n.href) navigate(n.href)
                  }}
                >
                  <AppShellNotificationItemIcon>{n.icon}</AppShellNotificationItemIcon>
                  <AppShellNotificationItemContent>
                    <AppShellNotificationItemTitle>{n.title}</AppShellNotificationItemTitle>
                    <AppShellNotificationItemDescription>{n.description}</AppShellNotificationItemDescription>
                    <AppShellNotificationItemTime>{n.time}</AppShellNotificationItemTime>
                  </AppShellNotificationItemContent>
                  <AppShellNotificationItemIndicator />
                </button>
              </AppShellNotificationItem>
            ))}
          </AppShellNotificationsList>
        )}
        <AppShellNotificationsFooter>
          <AppShellNotificationsActionTrigger
            onClick={() => {
              setOpen(false)
              navigate("/settings/notifications")
            }}
          >
            Notification settings
          </AppShellNotificationsActionTrigger>
        </AppShellNotificationsFooter>
      </AppShellNotificationsContent>
    </AppShellNotifications>
  )
}

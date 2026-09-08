import { Tabs } from "@/components/ui/tabs"

export default function TabsExample() {
  return (
    <Tabs.Root defaultValue="account" className="w-80">
      <Tabs.List>
        <Tabs.Trigger value="account">Account</Tabs.Trigger>
        <Tabs.Trigger value="password">Password</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="account" className="text-sm text-muted-foreground">
        Make changes to your account here.
      </Tabs.Content>
      <Tabs.Content value="password" className="text-sm text-muted-foreground">
        Change your password here.
      </Tabs.Content>
    </Tabs.Root>
  )
}

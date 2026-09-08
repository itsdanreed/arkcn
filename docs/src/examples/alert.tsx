import { TerminalIcon } from "lucide-react"
import { Alert } from "@/components/ui/alert"

export default function AlertExample() {
  return (
    <div className="flex w-96 flex-col gap-3">
      <Alert.Root>
        <TerminalIcon />
        <Alert.Title>Heads up!</Alert.Title>
        <Alert.Description>You can add components to your app using the CLI.</Alert.Description>
      </Alert.Root>
      <Alert.Root variant="destructive">
        <Alert.Title>Something went wrong</Alert.Title>
        <Alert.Description>Your session has expired. Please sign in again.</Alert.Description>
      </Alert.Root>
    </div>
  )
}

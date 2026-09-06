import { TerminalIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AlertExample() {
  return (
    <div className="flex w-96 flex-col gap-3">
      <Alert>
        <TerminalIcon />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>Your session has expired. Please sign in again.</AlertDescription>
      </Alert>
    </div>
  )
}

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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

export default function PopconfirmExample() {
  return (
    <Popconfirm>
      <PopconfirmTrigger asChild>
        <Button variant="outline">Delete file</Button>
      </PopconfirmTrigger>
      <PopconfirmContent>
        <PopconfirmHeader>
          <PopconfirmIcon />
          <PopconfirmTitle>Delete this file?</PopconfirmTitle>
          <PopconfirmDescription>It cannot be recovered.</PopconfirmDescription>
        </PopconfirmHeader>
        <PopconfirmFooter>
          <PopconfirmCancelTrigger />
          <PopconfirmConfirmTrigger onConfirm={() => toast("Deleted")}>Delete</PopconfirmConfirmTrigger>
        </PopconfirmFooter>
      </PopconfirmContent>
    </Popconfirm>
  )
}

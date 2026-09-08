import { Frame } from "@/components/ui/frame"
export default function FrameExample() {
  return (
    <Frame.Root title="Isolated example" className="h-36 w-80">
      <div style={{ padding: 20, fontFamily: "system-ui" }}>
        This content lives in its own document.
        <button
          style={{ display: "block", marginTop: 12 }}
          onClick={(event) => {
            event.currentTarget.textContent = "Clicked inside the frame"
          }}
        >
          Click inside the frame
        </button>
      </div>
    </Frame.Root>
  )
}

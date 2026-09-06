import { expect, test, type Page } from "@playwright/test"

const columnCards = (page: Page, column: string) =>
  page.locator(`[data-slot=kanban-column][data-value="${column}"] [data-slot=kanban-card]`)

test.describe("app shell", () => {
  test("command dialog navigates", async ({ page }) => {
    await page.goto("/#/")
    await page.getByRole("button", { name: "Search" }).click()
    const input = page.getByPlaceholder("Type a command or search...")
    await expect(input).toBeFocused()
    await input.fill("inbox")
    await expect(page.locator("[data-slot=command-item]")).toHaveCount(1)
    await input.press("Enter")
    await expect(page).toHaveURL(/#\/inbox$/)
    await expect(page.locator("[data-slot=dialog-content]")).toHaveCount(0)
  })

  test("notifications mark all read clears the badge", async ({ page }) => {
    await page.goto("/#/")
    const trigger = page.locator("[data-slot=app-shell-notifications-trigger]")
    await expect(trigger.locator("[data-slot=app-shell-notifications-badge]")).toHaveText("3")
    await trigger.click()
    await page.getByRole("button", { name: "Mark all as read" }).click()
    await expect(trigger.locator("[data-slot=app-shell-notifications-badge]")).toHaveCount(0)
  })
})

test.describe("kanban", () => {
  test("add trigger is polymorphic via asChild", async ({ page }) => {
    await page.goto("/#/projects/board")
    const trigger = page.locator("[data-slot=kanban-add-trigger]").first()
    await expect(trigger).toHaveAttribute("data-slot", "kanban-add-trigger")
    await expect(trigger).toHaveText(/Add task/)
    const before = await page.locator("[data-slot=kanban-card]").count()
    await trigger.click()
    await expect(page.locator("[data-slot=kanban-card]")).toHaveCount(before + 1)
  })

  test("keyboard picks up, moves across columns, and drops", async ({ page }) => {
    await page.goto("/#/projects/board")
    const first = page.locator("[data-slot=kanban-card]").first()
    const id = await first.getAttribute("data-value")
    await first.focus()
    await page.keyboard.press("Space")
    await expect(first).toHaveAttribute("data-grabbed", "")
    await page.keyboard.press("ArrowRight")
    await expect(columnCards(page, "todo").nth(0)).toHaveAttribute("data-value", id!)
    await expect(page.locator(`[data-slot=kanban-card][data-value="${id}"]`)).toBeFocused()
    await page.keyboard.press("Space")
    await expect(page.locator("[data-slot=kanban-live-region]")).toHaveText("Dropped.")
    await expect(page.locator("[data-slot=kanban][data-grabbed]")).toHaveCount(0)
  })

  test("pointer drag moves a card between columns", async ({ page }) => {
    await page.goto("/#/projects/board")
    const card = page.locator("[data-slot=kanban-card]").first()
    const id = await card.getAttribute("data-value")
    const target = page.locator('[data-slot=kanban-column][data-value="in progress"] [data-slot=kanban-column-content]')
    // Native HTML5 drag: move in steps so Pragmatic sees dragenter/dragover on the target.
    const from = (await card.boundingBox())!
    const to = (await target.boundingBox())!
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
    await page.mouse.down()
    await page.mouse.move(from.x + from.width / 2 + 10, from.y + from.height / 2 + 10, { steps: 5 })
    await page.mouse.move(to.x + to.width / 2, to.y + to.height - 20, { steps: 15 })
    await page.mouse.up()
    await expect(columnCards(page, "in progress").last()).toHaveAttribute("data-value", id!)
  })
})

test.describe("form builder", () => {
  test("palette Enter appends a row and arrows split a row", async ({ page }) => {
    await page.goto("/#/forms")
    const rows = page.locator("[data-slot=canvas-row]")
    await expect(rows).toHaveCount(4)
    await page.getByRole("button", { name: "Switch" }).focus()
    await page.keyboard.press("Enter")
    await expect(rows).toHaveCount(5)
    await expect(rows.last().locator("[data-slot=field-label]")).toHaveText("Switch")

    const handle = page.locator("[data-slot=canvas-node-handle]").first()
    await handle.focus()
    await page.keyboard.press("Space")
    await page.keyboard.press("ArrowDown")
    await expect(rows).toHaveCount(6)
    await expect(rows.nth(0).locator("[data-slot=field-label]")).toContainText("Last name")
    await expect(rows.nth(1).locator("[data-slot=field-label]")).toContainText("First name")
  })

  test("remove asks for confirmation", async ({ page }) => {
    await page.goto("/#/forms")
    const nodes = page.locator("[data-slot=canvas-node]")
    await expect(nodes).toHaveCount(5)
    await nodes.first().hover()
    await nodes.first().getByRole("button", { name: "Remove field" }).click()
    const confirm = page.locator("[data-slot=popconfirm-content]")
    await expect(confirm).toBeVisible()
    await expect(confirm.locator("[data-slot=popconfirm-title]")).toContainText("Remove")
    await page.locator("[data-slot=popconfirm-cancel-trigger]").click()
    await expect(confirm).toHaveCount(0)
    await expect(nodes).toHaveCount(5)
    await nodes.first().hover()
    await nodes.first().getByRole("button", { name: "Remove field" }).click()
    await page.locator("[data-slot=popconfirm-confirm-trigger]").click()
    await expect(nodes).toHaveCount(4)
  })
})

test.describe("node graph", () => {
  const center = async (locator: ReturnType<Page["locator"]>) => {
    const box = (await locator.boundingBox())!
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  }

  test("dragging a pin onto a compatible pin connects; delete and undo work", async ({ page }) => {
    await page.goto("/#/automations")
    await page.setViewportSize({ width: 1440, height: 900 })
    const edges = page.locator("[data-slot=node-graph-edge]")
    await expect(edges).toHaveCount(9)
    // Zoom to 100% so both pins are on screen.
    await page.locator("[data-slot=node-graph-fit-view-trigger]").click()
    const source = page.locator("[data-slot=node-graph-port-pin][data-node-id=score]")
    const target = page.locator("[data-slot=node-graph-port-pin][data-node-id=greater][data-port-id=b]")
    const from = await center(source)
    const to = await center(target)
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2, { steps: 5 })
    await expect(page.locator("[data-slot=node-graph-connection-line]")).toHaveCount(1)
    await page.mouse.move(to.x, to.y, { steps: 5 })
    await expect(target).toHaveAttribute("data-target", "valid")
    await page.mouse.up()
    await expect(edges).toHaveCount(10)
    await expect(target).toHaveAttribute("data-connected", "")

    // Click the new edge, delete it, then undo.
    const edge = page.locator('[data-slot=node-graph-edge][data-value="score:value->greater:b"]')
    await edge.locator("path").first().click({ force: true })
    await expect(edge).toHaveAttribute("data-selected", "")
    await page.keyboard.press("Delete")
    await expect(edges).toHaveCount(9)
    await page.keyboard.press("ControlOrMeta+z")
    await expect(edges).toHaveCount(10)
  })

  test("context menus, alt-click disconnect, and the simulator", async ({ page }) => {
    await page.goto("/#/automations")
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.locator("[data-slot=node-graph-fit-view-trigger]").click()
    const edges = page.locator("[data-slot=node-graph-edge]")
    const nodes = page.locator("[data-slot=node-graph-node]")
    await expect(edges).toHaveCount(9)

    // Alt+click a connected input pin breaks its link.
    const pin = page.locator("[data-slot=node-graph-port-pin][data-node-id=greater][data-port-id=a]")
    await pin.click({ modifiers: ["Alt"] })
    await expect(edges).toHaveCount(8)
    await expect(pin).not.toHaveAttribute("data-connected", "")

    // Right-click a node: the menu deletes it (and its remaining links).
    await page.locator("[data-slot=node-graph-node][data-value=greater]").click({ button: "right" })
    await page.getByRole("menuitem", { name: "Delete" }).click()
    await expect(nodes).toHaveCount(9)
    await expect(edges).toHaveCount(7)

    // Run the simulation from BeginPlay: the false branch prints its literal.
    await page.getByRole("button", { name: "Run", exact: true }).click()
    await expect(page.locator("[data-output-panel]")).toContainText("Keep going", { timeout: 10_000 })
    await expect(page.locator("[data-output-panel]")).toContainText("Finished")
  })

  test("releasing a connection on empty space offers compatible nodes", async ({ page }) => {
    await page.goto("/#/automations")
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.locator("[data-slot=node-graph-fit-view-trigger]").click()
    const source = page.locator("[data-slot=node-graph-port-pin][data-node-id=name]")
    const from = await center(source)
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move(from.x + 60, from.y + 120, { steps: 6 })
    await page.mouse.up()
    const input = page.getByPlaceholder("Nodes with a string pin…")
    await expect(input).toBeFocused()
    await input.fill("print")
    await input.press("Enter")
    await expect(page.locator("[data-slot=node-graph-node]")).toHaveCount(11)
    await expect(page.locator("[data-slot=node-graph-edge]")).toHaveCount(10)
  })
})

test.describe("query builder", () => {
  test("reads as a sentence, ignores unfinished conditions, and filters live", async ({ page }) => {
    await page.goto("/#/segments")
    const summary = page.locator("[data-slot=query-builder-summary]")
    await expect(summary).toContainText("Status is Active and Role is any of Admin, Superadmin")
    const count = page.locator("[data-slot=badge].tabular-nums")
    const before = await count.textContent()

    // A new condition without a value changes nothing.
    await page.getByRole("button", { name: "Add condition" }).click()
    await expect(page.locator("[data-slot=query-builder-rule][data-incomplete]")).toHaveCount(1)
    await expect(count).toHaveText(before!)

    // Give it a value: the sentence, SQL, and count update.
    await page.getByLabel("Value").last().fill("Alex")
    await expect(summary).toContainText("and Name is Alex")
    await expect(page.locator("pre")).toContainText("fullName = 'Alex'")
    await expect(count).not.toHaveText(before!)

    // Remove it from the hover actions.
    await page.getByRole("button", { name: "Remove condition" }).last().click({ force: true })
    await expect(count).toHaveText(before!)
  })
})

test.describe("data grid", () => {
  test("virtualizes, edits with the keyboard, and tracks changes", async ({ page }) => {
    await page.goto("/#/contacts")
    const rows = page.locator("[data-slot=data-grid-row]")
    // 500 rows exist but only a window is rendered.
    await expect(rows.first()).toBeVisible()
    expect(await rows.count()).toBeLessThan(60)

    // Click a cell, type to replace, Enter commits and moves down.
    const cell = page.locator('[data-slot=data-grid-cell][data-row-index="0"][data-column="firstName"]')
    await cell.click()
    await expect(cell).toHaveAttribute("data-focused", "")
    await page.keyboard.type("Bob")
    await expect(page.locator("[data-slot=data-grid-editor]")).toHaveValue("Bob")
    await page.keyboard.press("Enter")
    await expect(cell).toHaveText("Bob")
    await expect(page.locator("[data-slot=data-grid-cell][data-focused]")).toHaveAttribute("data-row-index", "1")
    await expect(page.locator("[data-slot=floating-toolbar]")).toContainText("unsaved change")

    // Shift+arrows select a range; Escape clears it; undo restores the value.
    await page.keyboard.press("Shift+ArrowDown")
    await expect(page.locator("[data-slot=data-grid-cell][data-selected]")).toHaveCount(2)
    await page.getByRole("button", { name: "Undo" }).click()
    await expect(cell).toHaveText("Finley")

    // Scrolling far down renders a different window.
    await page.locator("[data-slot=data-grid-container]").evaluate((el) => (el.scrollTop = 12000))
    await expect(rows.first()).not.toHaveAttribute("data-index", "0")
  })
})

test.describe("rich text editor", () => {
  test("toolbar toggles format the selection and report HTML", async ({ page }) => {
    await page.goto("/#/documents")
    const content = page.locator("[data-slot=rich-text-editor-content] .tiptap")
    await expect(content.locator("h1")).toHaveText("Release notes: September")

    // Select the heading text and bold it from the toolbar.
    await content.locator("h1").click()
    await page.keyboard.press("ControlOrMeta+a")
    const bold = page.locator("[data-slot=rich-text-editor-toolbar] [data-action=bold]")
    await bold.click()
    await expect(bold).toHaveAttribute("aria-pressed", "true")
    await expect(page.locator("[data-output]")).toContainText("<strong>Release notes: September</strong>")

    // The bubble menu appears for a selection and shares the same toggle.
    await expect(page.locator("[data-slot=rich-text-editor-bubble-menu] [data-action=bold]")).toBeVisible()

    // Read-only disables the toolbar and the content.
    await page.getByText("Editable", { exact: true }).click()
    await expect(bold).toBeDisabled()
    await expect(content).toHaveAttribute("contenteditable", "false")
  })
})

test.describe("gantt", () => {
  test("bars move by drag and keyboard, and dependency arrows follow", async ({ page }) => {
    await page.goto("/#/projects/timeline")
    const bar = page.locator("[data-slot=gantt-bar][data-value=wireframes]")
    await expect(bar).toBeVisible()
    const before = await bar.getAttribute("aria-label")
    await expect(page.locator("[data-slot=gantt-dependencies] path[marker-end]")).toHaveCount(14)

    // Drag right by two days (44px per day at the day scale).
    const box = (await bar.boundingBox())!
    await page.mouse.move(box.x + 30, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 30 + 88, box.y + box.height / 2, { steps: 6 })
    await page.mouse.up()
    await expect(bar).not.toHaveAttribute("aria-label", before!)
    await expect(page.getByRole("button", { name: "Undo" })).toBeEnabled()

    // Keyboard: pick up, move one day, drop.
    const moved = await bar.getAttribute("aria-label")
    await bar.focus()
    await page.keyboard.press("Space")
    await expect(bar).toHaveAttribute("data-grabbed", "")
    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("Space")
    await expect(bar).not.toHaveAttribute("aria-label", moved!)
    await expect(page.locator("[data-slot=gantt-live-region]")).toContainText("Dropped")
  })
})

test.describe("activity", () => {
  test("mentions autocomplete, posting adds a comment and a feed item", async ({ page }) => {
    await page.goto("/#/activity")
    await expect(page.locator("[data-slot=activity-feed-item]")).toHaveCount(8)
    await expect(page.locator("[data-slot=comment]")).toHaveCount(4)

    const input = page.getByLabel("Comment", { exact: true })
    await input.fill("Thanks @Ja")
    const list = page.locator("[data-slot=comment-composer-mention-list]")
    await expect(list.locator("[role=option]")).toHaveCount(1)
    await page.keyboard.press("Enter")
    await expect(input.locator("[data-slot=comment-mention-chip]")).toHaveText("@Jackson Lee")
    await expect(list).toHaveCount(0)

    // A chip is atomic: Backspace over the trailing space, then one more removes the whole chip.
    await page.keyboard.press("Backspace")
    await page.keyboard.press("Backspace")
    await expect(input.locator("[data-slot=comment-mention-chip]")).toHaveCount(0)
    await expect(input).toHaveText("Thanks ")
    await page.keyboard.type("@Jack")
    await page.keyboard.press("Enter")
    await expect(input.locator("[data-slot=comment-mention-chip]")).toHaveCount(1)

    await page.keyboard.press("ControlOrMeta+Enter")
    await expect(page.locator("[data-slot=comment]")).toHaveCount(5)
    await expect(page.locator("[data-slot=comment-mention]").last()).toHaveText("@Jackson Lee")
    await expect(page.locator("[data-slot=activity-feed-item]").first()).toContainText("commented on")

    // Reply flow: the composer switches to reply mode and nests the comment.
    const first = page.locator("[data-slot=comment]").first()
    await first.hover()
    await first.locator("[data-slot=comment-reply-trigger]").first().click()
    await expect(page.locator("[data-slot=comment-composer-replying-to]")).toContainText("Olivia Martin")
    await page.getByLabel("Comment", { exact: true }).fill("On it")
    await page.keyboard.press("ControlOrMeta+Enter")
    await expect(first.locator("[data-slot=comment-replies] [data-slot=comment]")).toHaveCount(3)
  })
})

test.describe("calendar", () => {
  test("drag moves an event, resize changes its end, dragging empty time proposes a new event", async ({ page }) => {
    await page.goto("/#/projects/calendar")
    await page.setViewportSize({ width: 1440, height: 900 })
    const event = page.locator("[data-slot=scheduler-event][data-value=planning]")
    await expect(event).toBeVisible()
    const before = await event.getAttribute("aria-label")

    // Move down by one hour (56px per hour).
    let box = (await event.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + 12)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2, box.y + 12 + 56, { steps: 6 })
    await page.mouse.up()
    await expect(event).not.toHaveAttribute("aria-label", before!)
    await expect(event).toHaveAttribute("aria-label", /12:00 PM to 1:30 PM/)

    // Resize the end by 30 minutes.
    box = (await event.boundingBox())!
    const handle = event.locator("[data-slot=scheduler-event-resize-handle]")
    const hb = (await handle.boundingBox())!
    await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2)
    await page.mouse.down()
    await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2 + 28, { steps: 4 })
    await page.mouse.up()
    await expect(event).toHaveAttribute("aria-label", /to 2:00 PM/)

    // Drag on empty time in the last column opens the new-event dialog with the dragged range.
    const column = page.locator("[data-slot=scheduler-day-column]").last()
    const cb = (await column.boundingBox())!
    await page.mouse.move(cb.x + cb.width / 2, cb.y + 56 * 3)
    await page.mouse.down()
    await page.mouse.move(cb.x + cb.width / 2, cb.y + 56 * 4, { steps: 4 })
    await page.mouse.up()
    const dialog = page.locator("[data-slot=dialog-content]")
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText("9:00 AM – 10:00 AM")
    await dialog.getByLabel("Title").fill("Deep work")
    await dialog.getByRole("button", { name: "Add event" }).click()
    await expect(page.locator("[data-slot=scheduler-event]", { hasText: "Deep work" })).toBeVisible()

    // Month view renders chips; the view select drives it.
    await page.locator("[data-slot=scheduler-view-select]").getByText("Month", { exact: true }).click()
    await expect(page.locator("[data-slot=scheduler-month-cell]").first()).toBeVisible()
    await expect(page.locator("[data-slot=scheduler-month-event]", { hasText: "Deep work" })).toBeVisible()
  })
})

test.describe("dashboard widgets", () => {
  test("dashboard widgets lay out in rows and columns like the form builder, and the layout saves", async ({
    page,
  }) => {
    await page.goto("/#/")
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.evaluate(() => localStorage.removeItem("ui-toolkit.dashboard.layout"))
    await page.reload()
    const rows = page.locator("[data-slot=canvas-row]")
    const nodes = page.locator("[data-slot=canvas-node]")
    await expect(rows).toHaveCount(3)
    await expect(nodes).toHaveCount(8)

    await page.getByText("Customize", { exact: true }).click()
    // Keyboard: pick up "My tasks" and move it up a row (top edge of the first node in the row above).
    const tasks = page.locator("[data-slot=canvas-node][data-value=tasks]")
    await tasks.locator("[data-slot=canvas-node-handle]").focus()
    await page.keyboard.press("Space")
    await page.keyboard.press("ArrowUp")
    await expect(rows).toHaveCount(4)

    // Palette: Enter on "Analytics" appends a row with it.
    await page.getByRole("button", { name: "Analytics" }).focus()
    await page.keyboard.press("Enter")
    await expect(nodes).toHaveCount(9)
    await expect(rows).toHaveCount(5)

    // Remove a widget, save, reload.
    const sales = page.locator("[data-slot=canvas-node][data-value=sales]")
    await sales.hover()
    await sales.getByRole("button", { name: "Remove Sales" }).click()
    await expect(nodes).toHaveCount(8)
    await page.getByRole("button", { name: "Save layout" }).click()
    await page.reload()
    await expect(page.locator("[data-slot=canvas-node][data-value=analytics]")).toBeVisible()
    await expect(page.locator("[data-slot=canvas-node][data-value=sales]")).toHaveCount(0)
    await page.evaluate(() => localStorage.removeItem("ui-toolkit.dashboard.layout"))
  })
})

test.describe("pickers", () => {
  test("tree select searches, picks, and collapses teams into chips", async ({ page }) => {
    await page.goto("/#/access")
    const folder = page.getByRole("combobox", { name: "Folder" })
    await expect(folder).toContainText("Specs")
    await folder.click()
    const search = page.getByPlaceholder("Find a folder")
    await expect(search).toBeFocused()
    await search.fill("web")
    await expect(page.locator("[data-slot=tree-select-item]")).toHaveCount(1)
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    await expect(folder).toContainText("Website")
    await expect(page.locator("[data-slot=tree-select-content]")).toHaveCount(0)

    const people = page.getByRole("combobox", { name: "People" })
    await expect(people.locator("[data-slot=tree-select-chip]")).toHaveCount(2)
    await expect(people).toContainText("Platform")
    await people.getByRole("button", { name: "Remove Platform" }).click()
    await expect(people.locator("[data-slot=tree-select-chip]")).toHaveCount(1)
    await expect(page.locator("[data-slot=tree-select-content]")).toHaveCount(0)
    await people.click()
    await page.locator("[data-slot=tree-select-content] [data-slot=tree-view-node-checkbox]").first().click() // Engineering
    await expect(people.locator("[data-slot=tree-select-chip]")).toHaveCount(2)
    await expect(people).toContainText("Engineering")
  })

  test("cascader drills through columns with the keyboard and search", async ({ page }) => {
    await page.goto("/#/access")
    const location = page.getByRole("combobox", { name: "Location" })
    await expect(location).toContainText("San Francisco")
    await location.focus()
    await page.keyboard.press("ArrowDown")
    const columns = page.locator("[data-slot=cascader-column]")
    await expect(columns).toHaveCount(3)
    await expect(page.locator("[data-slot=cascader-item][data-highlighted]")).toContainText("San Francisco")
    await page.locator("[data-slot=cascader-columns]").focus()
    await page.keyboard.press("ArrowLeft")
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowRight")
    await expect(page.locator("[data-slot=cascader-item][data-highlighted]")).toContainText("New York City")
    await page.keyboard.press("Enter")
    await expect(location).toContainText("New York City")
    await expect(page.locator("[data-slot=cascader-content]")).toHaveCount(0)

    // With the search focused but empty, left/right still move across columns.
    await location.click()
    await expect(page.getByPlaceholder("Search cities")).toBeFocused()
    await page.keyboard.press("ArrowLeft")
    await expect(page.locator("[data-slot=cascader-item][data-highlighted]")).toContainText("New York")
    await page.keyboard.press("ArrowRight")
    await expect(page.locator("[data-slot=cascader-item][data-highlighted]")).toContainText("New York City")
    await page.getByPlaceholder("Search cities").fill("van")
    await expect(page.locator("[data-slot=cascader-search-result]")).toHaveCount(1)
    await page.locator("[data-slot=cascader-search-result]").click()
    await expect(location).toContainText("Vancouver")

    const category = page.getByRole("combobox", { name: "Category" })
    await category.click()
    await page.locator("[data-slot=cascader-item]", { hasText: "Home" }).click()
    await expect(category).toContainText("Home")
    await expect(page.locator("[data-slot=cascader-content]")).toBeVisible()
    await page.locator("[data-slot=cascader-item]", { hasText: "Kitchen" }).click()
    await expect(category).toContainText("Kitchen")
    await expect(page.locator("[data-slot=cascader-content]")).toHaveCount(0)
  })
})

test.describe("transfer list", () => {
  test("moves items with the arrows, keyboard, and select all", async ({ page }) => {
    await page.goto("/#/access")
    const source = page.locator("[data-slot=transfer-list-panel][data-side=source]")
    const target = page.locator("[data-slot=transfer-list-panel][data-side=target]")
    const items = (panel: typeof source) => panel.locator("[data-slot=transfer-list-item]")
    await expect(items(source)).toHaveCount(9)
    await expect(items(target)).toHaveCount(3)

    // Tick two and move them right.
    await items(source).filter({ hasText: "Edit records" }).click()
    await items(source)
      .filter({ hasText: "Delete records" })
      .click({ modifiers: ["Shift"] })
    await page.getByRole("button", { name: "Move 2 selected right" }).click()
    await expect(items(target)).toHaveCount(5)
    await expect(items(source)).toHaveCount(7)

    // Enter on a focused item moves it back; the disabled one cannot move.
    await items(target).filter({ hasText: "Edit records" }).focus()
    await page.keyboard.press("Enter")
    await expect(items(target)).toHaveCount(4)
    await items(target).filter({ hasText: "View records" }).click({ force: true })
    await expect(page.getByRole("button", { name: /Move \d+ selected left/ })).toBeDisabled()

    // Search narrows select-all to the visible rows.
    await source.getByPlaceholder("Filter permissions").fill("manage")
    await expect(items(source)).toHaveCount(2)
    await source.locator("[data-slot=transfer-list-select-all]").click()
    await page.getByRole("button", { name: "Move 2 selected right" }).click()
    await expect(items(target)).toHaveCount(6)
    await expect(target).toContainText("Manage billing")
    await expect(target).toContainText("Manage roles")
  })
})

test.describe("virtual list", () => {
  test("renders a window, jumps to a line, and drives a listbox from the keyboard", async ({ page }) => {
    await page.goto("/#/audit-log")
    const log = page.getByLabel("Log lines")
    const rows = log.locator("[data-slot=virtual-list-item]")
    await expect(rows.first()).toBeVisible()
    expect(await rows.count()).toBeLessThan(60)
    await expect(page.getByTestId("log-range")).toContainText("of 100,000")

    await page.getByLabel("Line number").fill("50000")
    await page.getByRole("button", { name: "Go to line" }).click()
    await expect(log.locator("[data-slot=virtual-list-item][data-index='49999']")).toBeVisible()
    await page.getByRole("button", { name: "End" }).click()
    await expect(log.locator("[data-slot=virtual-list-item][data-index='99999']")).toBeVisible()

    const listbox = page.getByRole("listbox", { name: "Actors" })
    await listbox.focus()
    await page.keyboard.press("End")
    await expect(listbox.locator("[data-slot=virtual-list-item][data-index='9999']")).toBeVisible()
    await page.keyboard.press("PageUp")
    await page.keyboard.press("Enter")
    await expect(listbox.locator("[data-slot=virtual-list-item][data-index='9992']")).toHaveAttribute(
      "aria-selected",
      "true"
    )
    await expect(page.getByTestId("contact-selected")).not.toHaveText("none")

    await page.getByPlaceholder("Filter by name or team").fill("zzzz")
    await expect(page.locator("[data-slot=virtual-list-empty]")).toBeVisible()
  })
})

test.describe("hotkeys", () => {
  test("? opens the shortcuts dialog and g-sequences navigate", async ({ page }) => {
    await page.goto("/#/")
    await page.locator("body").click({ position: { x: 5, y: 5 } })
    await page.keyboard.press("Shift+?")
    const dialog = page.locator("[data-slot=hotkeys-dialog]")
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText("Go to kanban")
    await page.keyboard.press("Escape")
    await expect(dialog).toHaveCount(0)

    await page.keyboard.press("g")
    await page.keyboard.press("k")
    await expect(page).toHaveURL(/#\/projects\/board$/)

    // Typing in an input must not trigger sequences, but ⌘K still opens the command menu.
    await page.goto("/#/access")
    const search = page.getByPlaceholder("Filter permissions")
    await search.fill("g")
    await search.press("k")
    await expect(page).toHaveURL(/#\/access$/)
    await search.press("ControlOrMeta+k")
    await expect(page.getByPlaceholder("Type a command or search...")).toBeVisible()
  })
})

test.describe("auth pages", () => {
  test("sign in validates, then signs in; forgot password confirms", async ({ page }) => {
    await page.goto("/#/sign-in")
    await expect(page.locator("[data-slot=app-shell-sidebar]")).toHaveCount(0)
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page.getByText("Please enter your email.")).toBeVisible()
    await page.getByLabel("Email").fill("alex.morgan@example.com")
    await page.getByLabel("Password", { exact: true }).fill("hunter22")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL(/#\/$/)
    await expect(page.locator("[data-slot=app-shell-sidebar]").first()).toBeVisible()

    await page.goto("/#/forgot-password")
    await page.getByLabel("Email").fill("alex.morgan@example.com")
    await page.getByRole("button", { name: "Send reset link" }).click()
    await expect(page.getByText("Check your inbox")).toBeVisible()

    await page.goto("/#/sign-up")
    await page.getByLabel("Email").fill("new@example.com")
    await page.getByLabel("Password", { exact: true }).fill("hunter22")
    await page.getByLabel("Confirm password").fill("hunter23")
    await page.getByRole("button", { name: "Create account" }).click()
    await expect(page.getByText("Passwords don't match.")).toBeVisible()
  })
})

test.describe("error pages", () => {
  test("error routes and unknown paths render full-page errors", async ({ page }) => {
    await page.goto("/#/errors/forbidden")
    await expect(page.locator("[data-slot=error-page]")).toContainText("403")
    await expect(page.locator("[data-slot=app-shell-sidebar]")).toHaveCount(0)
    await page.goto("/#/nowhere/at/all")
    await expect(page.locator("[data-slot=error-page]")).toContainText("Page not found")
    await expect(page.locator("[data-slot=error-page]")).toContainText("/nowhere/at/all")
    await page.getByRole("button", { name: "Back to home" }).click()
    await expect(page).toHaveURL(/#\/$/)
    await expect(page.locator("[data-slot=app-shell-sidebar]").first()).toBeVisible()
  })
})

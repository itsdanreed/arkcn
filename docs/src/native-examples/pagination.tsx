import { useState } from "react"
import { Text, View } from "react-native"
import { Pagination } from "@multicomma/arkcn-react-native/ui/pagination"
import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"

export default function PaginationExample() {
  const { colors, typography } = useNativeTheme()
  const [width, setWidth] = useState(0)
  const compact = width < 480
  return (
    <View style={{ width: "100%" }} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <Pagination.Root
        count={100}
        defaultPageSize={10}
        defaultPage={2}
        siblingCount={compact ? 0 : 1}
        style={{ flexWrap: "wrap", rowGap: 12 }}
      >
        <Pagination.FirstTrigger accessibilityLabel="First page" />
        <Pagination.PrevTrigger accessibilityLabel="Previous page" />
        <Pagination.Context>
          {(api) =>
            api.pages.map((page, index) =>
              page.type === "page" ? (
                <Pagination.Item key={page.value} {...page} />
              ) : (
                <Pagination.Ellipsis key={`ellipsis-${index}`} index={index} />
              )
            )
          }
        </Pagination.Context>
        <Pagination.NextTrigger accessibilityLabel="Next page" />
        <Pagination.LastTrigger accessibilityLabel="Last page" />
        <Pagination.Context>
          {(api) => (
            <Text
              accessibilityLiveRegion="polite"
              style={{
                ...typography.regular,
                color: colors.mutedForeground,
                fontSize: 14,
                lineHeight: 20,
                ...(compact ? { width: "100%", textAlign: "center" } : { marginLeft: 12 }),
              }}
            >
              Page {api.page} of {api.totalPages}
            </Text>
          )}
        </Pagination.Context>
      </Pagination.Root>
    </View>
  )
}

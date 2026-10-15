import { useState } from "react"
import { View } from "react-native"
import { Breadcrumb } from "@multicomma/arkcn-react-native/ui/breadcrumb"
import { Button } from "@multicomma/arkcn-react-native/ui/button"

export default function BreadcrumbExample() {
  const [page, setPage] = useState("Breadcrumb")
  return (
    <View style={{ gap: 16, maxWidth: "100%" }}>
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            {page === "Home" ? (
              <Breadcrumb.Page>Home</Breadcrumb.Page>
            ) : (
              <Breadcrumb.Link onPress={() => setPage("Home")}>Home</Breadcrumb.Link>
            )}
          </Breadcrumb.Item>
          {page !== "Home" && (
            <>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                {page === "Components" ? (
                  <Breadcrumb.Page>Components</Breadcrumb.Page>
                ) : (
                  <Breadcrumb.Link onPress={() => setPage("Components")}>Components</Breadcrumb.Link>
                )}
              </Breadcrumb.Item>
            </>
          )}
          {page === "Breadcrumb" && (
            <>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.Page>Breadcrumb</Breadcrumb.Page>
              </Breadcrumb.Item>
            </>
          )}
        </Breadcrumb.List>
      </Breadcrumb.Root>
      {page !== "Breadcrumb" && (
        <Button variant="outline" onPress={() => setPage("Breadcrumb")}>
          Return to example
        </Button>
      )}
    </View>
  )
}

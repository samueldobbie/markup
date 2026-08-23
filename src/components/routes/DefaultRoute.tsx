import { useDocumentTitle } from "@mantine/hooks"

function DefaultRoute({ children, title }: any) {
  useDocumentTitle(title)

  return (
    <>
      {children}
    </>
  )
}

export default DefaultRoute

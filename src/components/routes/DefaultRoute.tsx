import { useDocumentTitle } from "@mantine/hooks"

function DefaultRoute({ children, title }: any): JSX.Element {
  useDocumentTitle(title)

  return (
    <>
      {children}
    </>
  )
}

export default DefaultRoute

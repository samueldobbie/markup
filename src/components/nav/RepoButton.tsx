import GitHubButton from "react-github-btn"

function RepoButton(): JSX.Element {
  return (
    <GitHubButton
      href="https://github.com/samueldobbie/markup"
      data-size="large"
      data-show-count="true"
    >
      Star
    </GitHubButton>
  )
}

export default RepoButton

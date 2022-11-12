enum Path {
  Home = "/",
  Docs = "/docs",
  SignUp = "/sign-up",
  SignIn = "/sign-in",
  ForgotPassword = "/forgot-password",
  Dashboard = "/dashboard",
  Setup = "/workspace/setup/:id",
  Annotate = "/workspace/annotate/:id",
  AnnotateDemo = "/workspace/annotate/75ec6637-7bb8-4a27-af1b-7be75fcd08a7",
  Contact = "/contact",
  Settings = "/settings",
  NotFound = "*",
}

function toSetupUrl(id: string) {
  return Path.Setup.replace(":id", id)
}

function toAnnotateUrl(id: string) {
  return Path.Annotate.replace(":id", id)
}

export { Path, toSetupUrl, toAnnotateUrl }

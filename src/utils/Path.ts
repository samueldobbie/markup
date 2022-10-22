enum Path {
  Home = "/",
  Demo = "/demo",
  Docs = "/docs",
  SignUp = "/sign-up",
  SignIn = "/sign-in",
  ForgotPassword = "/forgot-password",
  Dashboard = "/dashboard",
  Setup = "/workspace/setup/:id",
  Annotate = "/workspace/annotate/:id",
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

enum Path {
  Home = "/",
  Docs = "/docs",
  SignUp = "/auth/sign-up",
  SignIn = "/auth/sign-in",
  Verification = "/auth/verify",
  ForgotPassword = "/auth/forgot-password",
  Dashboard = "/dashboard",
  Setup = "/workspace/setup/:id",
  Annotate = "/workspace/annotate/:id",
  AnnotateDemo = "/workspace/annotate/9c3c3f56-d71b-404a-821e-96b93906451c",
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

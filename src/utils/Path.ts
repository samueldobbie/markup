enum Path {
  Home = "/",
  Docs = "/docs",
  SignUp = "/auth/sign-up",
  SignIn = "/auth/sign-in",
  ForgotPassword = "/auth/forgot-password",
  ResetPassword = "/auth/reset-password",
  Dashboard = "/dashboard",
  Setup = "/workspace/setup/:id",
  Annotate = "/workspace/annotate/:id",
  Support = "/support",
  Faq = "/faq",
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

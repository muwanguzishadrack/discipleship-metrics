import { ResetPasswordForm } from "../components/reset-password-form"
import { AuthLogo } from "../components/ui/auth-logo"

export const ResetPassword = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-1">
          <AuthLogo className="h-12 w-12 lg:h-16 lg:w-16" />
          <a href="/" className="flex items-center gap-2 font-medium">
            <span className="text-xl">
              <span className="font-bold text-primary">Discipleship</span>
              <span className="font-normal" style={{ color: '#eca84b' }}>Metrics</span>
            </span>
          </a>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
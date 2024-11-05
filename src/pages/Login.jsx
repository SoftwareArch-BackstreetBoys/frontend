import { Button } from "@/components/ui/button"
import { useGoogleLogin } from "@react-oauth/google"

const Login = () => {
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google login successful", tokenResponse)
      const response = await fetch(
        `${process.env.GOOGLE_OAUTH_ROUTE}/auth/login/callback?token=${tokenResponse.access_token}`
      )
      console.log("Google login response", await response.json())

      // You can now use the tokenResponse to authenticate the user in your app
    },
    onError: (error) => {
      console.error("Google login failed", error)
      // Handle login errors here
    },
  })

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <Button onClick={googleLogin} className="w-full">
        Login with Google
      </Button>
      {/* Add more login logic here */}
    </div>
  )
}

export default Login

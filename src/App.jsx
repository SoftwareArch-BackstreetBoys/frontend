import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Events from "./pages/Events"
import Clubs from "./pages/Clubs"
import Profile from "./pages/Profile"
import ClubEvents from "./pages/ClubEvents"
import { GoogleOAuthProvider } from "@react-oauth/google"

const queryClient = new QueryClient()

const App = () => (
  <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="events" element={<Events />} />
              <Route path="clubs" element={<Clubs />} />
              <Route path="profile" element={<Profile />} />
              {/* <Route path="my-activities" element={<UserActivities />} /> */}
              <Route path="/clubs/:clubId" element={<ClubEvents />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
)

export default App

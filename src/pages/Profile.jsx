import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFetchUser } from "@/utils/useFetchUser"
import UserActivities from "./UserActivities"

const Profile = () => {
  // Mock user data (replace with actual user data in a real application)
  const [user] = useFetchUser()
  console.log(user)

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">User Profile</h2>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <p className="mb-3">Welcome! </p>
            <CardTitle>{user?.fullName}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              <strong>Email:</strong> {user?.email}
            </p>
            {/* <p className="mb-4"><strong>Joined:</strong> { }</p> */}
            {/* <Button className="w-full">Edit Profile</Button> */}
          </CardContent>
        </Card>
      </div>
      <UserActivities />
    </div>
  )
}

export default Profile

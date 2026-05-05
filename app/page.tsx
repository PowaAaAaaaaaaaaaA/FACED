'use client'
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Eye, EyeOff, LogIn } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }

    setIsLoading(true)
    setError('')

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError('Invalid email or password.')
      setIsLoading(false)
      return
    }

    // Redirect to dashboard on success
    router.push('/dashboard')
  }

  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#FFFCFB]">
      <div className="w-full h-2 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400" />

      <header className="w-full bg-white border-b border-blue-100 shadow-sm py-4 px-8">
        <div className="max-w-5xl mx-auto flex flex-row justify-center items-center gap-6">
          <Image src="/dswd_logo.png" alt="DSWD Logo" width={220} height={60} />
          <div className="h-14 w-px bg-blue-200" />
          <Image src="/bagong_pilipinas.png" alt="Bagong Pilipinas Logo" width={80} height={80} />
        </div>
      </header>

      <section className="w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 py-14 px-8 text-white text-center shadow-inner">
        <p className="text-blue-200 uppercase tracking-[0.3em] text-xs font-semibold mb-3">
          Department of Social Welfare and Development
        </p>
        <h1 className="text-2xl md:text-3xl font-extrabold leading-tight max-w-3xl mx-auto tracking-wide">
          Family Assistance Card in Emergencies and Disasters
        </h1>
        <div className="mt-3 inline-block bg-blue-400/30 border border-blue-300/40 text-blue-100 text-sm font-semibold px-5 py-1 rounded-full tracking-widest uppercase">
          FACED Digital System
        </div>
        <p className="mt-5 text-blue-200 text-sm max-w-xl mx-auto leading-relaxed">
          A centralized digital platform for managing family assistance records during emergency and disaster response operations.
        </p>
      </section>

      <main className="flex-1 flex items-center justify-center bg-[#F4F7FB] py-16 px-6">
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 w-full max-w-md p-10 flex flex-col gap-4">
          <div className="text-center mb-2">
            <h2 className="text-blue-900 font-bold text-lg">Access the System</h2>
            <p className="text-slate-500 text-sm mt-1">Select an option to continue</p>
          </div>

          <Link href="/DataPrivacy">
            <button className="btn btn-primary btn-md w-full rounded-xl text-sm tracking-wide">
              Take Survey
            </button>
          </Link>

          {/* Login button — opens modal */}
          <button
            className="btn btn-outline btn-primary btn-md w-full rounded-xl text-sm tracking-wide"
            onClick={() => {
              setError('')
              setEmail('')
              setPassword('')
              ;(document.getElementById('login_modal') as HTMLDialogElement)?.showModal()
            }}
          >
            <LogIn size={16} /> Login to Dashboard
          </button>

          <p className="text-center text-xs text-slate-400 mt-2">
            For authorized DSWD personnel only.
          </p>
        </div>
      </main>

      <footer className="w-full bg-gradient-to-b from-blue-950 via-blue-850 to-blue-800 text-blue-200 text-center py-5 px-8 text-xs">
        <p className="font-semibold text-white text-sm">Republic of the Philippines</p>
        <p className="mt-1">Department of Social Welfare and Development &mdash; FACED Digital System</p>
        <p className="mt-1 text-blue-400">All rights reserved &copy; {new Date().getFullYear()}</p>
      </footer>

      <dialog id="login_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">

          <div className="flex flex-col items-center gap-1 mb-6">
            <div className="bg-blue-100 rounded-full p-3 mb-1">
              <LogIn size={24} className="text-blue-700" />
            </div>
            <h3 className="font-bold text-lg text-blue-900">Admin Login</h3>
            <p className="text-xs text-slate-400">DSWD FACED Digital System</p>
          </div>

          {error && (
            <div className="alert alert-error mb-4 py-2 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1 mb-3">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="input input-primary w-full"
              placeholder="admin@dswd.gov.ph"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className="flex flex-col gap-1 mb-6">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input input-primary w-full pr-10"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="modal-action flex-col gap-2 mt-0">
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <><span className="loading loading-spinner loading-sm" /> Logging in...</>
              ) : 'Login'}
            </button>

            <form method="dialog" className="w-full">
              <button className="btn btn-ghost w-full">Cancel</button>
            </form>
          </div>

        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </div>
  )
}
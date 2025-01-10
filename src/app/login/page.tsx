'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
    const [emailOrUsername, setEmailOrUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            const formData = new FormData()
            formData.append('emailOrUsername', emailOrUsername)
            formData.append('password', password)

            const response = await fetch('/api/login', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Login failed')
            }

            if (data.success) {
                sessionStorage.setItem('user', JSON.stringify(data.user))
                router.push('/')
            }
        } catch (error) {
            setError((error as Error).message)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-96">
                <h1 className="text-2xl font-bold mb-6 text-white">Login</h1>
                {error && (
                    <p className="text-red-500 mb-4">{error}</p>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-300">
                            Email or Username
                        </label>
                        <input
                            type="text"
                            id="emailOrUsername"
                            value={emailOrUsername}
                            onChange={(e) => setEmailOrUsername(e.target.value)}
                            className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
                    >
                        Login
                    </button>
                    <p className="text-center text-gray-400 mt-4">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-blue-400 hover:text-blue-300">
                            Sign Up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
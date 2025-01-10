'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PostForm from '@/components/PostForm'
import PostList from '@/components/PostList'
import Link from 'next/link'

export default function Home() {
    const [user, setUser] = useState<any>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [viewMode, setViewMode] = useState<'all' | 'my-posts'>('all')
    const router = useRouter()

    useEffect(() => {
        const userData = sessionStorage.getItem('user')
        if (!userData) {
            router.push('/login')
        } else {
            setUser(JSON.parse(userData))
        }
    }, [router])

    if (!user) return null

    return (
        <div className="min-h-screen bg-black">
            <nav className="bg-gray-900 shadow-lg">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-bold text-white">Reddit Clone</h1>
                        <button
                            onClick={() => setViewMode('all')}
                            className={`px-3 py-1 rounded-md ${viewMode === 'all' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
                        >
                            All Posts
                        </button>
                        <button
                            onClick={() => setViewMode('my-posts')}
                            className={`px-3 py-1 rounded-md ${viewMode === 'my-posts' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
                        >
                            My Posts
                        </button>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-300">Welcome, {user.username}</span>
                        <div
                            className="relative"
                            onMouseEnter={() => setIsDropdownOpen(true)}
                            onMouseLeave={() => setIsDropdownOpen(false)}
                        >
                            <button className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                                Profile
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10">
                                    <Link
                                        href="/profile"
                                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                    >
                                        View Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            sessionStorage.removeItem('user')
                                            router.push('/login')
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto py-8 px-4">
                <PostForm user={user} />
                <PostList viewMode={viewMode} currentUser={user} />
            </div>
        </div>
    )
}
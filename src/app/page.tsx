'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PostForm from '@/components/PostForm'
import PostList from '@/components/PostList'
import Link from 'next/link'
import type { Drama } from '@/types'

export default function Home() {
    const [user, setUser] = useState<any>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [viewMode, setViewMode] = useState<'all' | 'my-posts'>('all')
    const [dramas, setDramas] = useState<Drama[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const [refreshKey, setRefreshKey] = useState(0)

    const refreshPosts = () => {
        setRefreshKey(prev => prev + 1)
    }

    // Fetch user data
    useEffect(() => {
        const userData = sessionStorage.getItem('user')
        if (!userData) {
            router.push('/login')
        } else {
            setUser(JSON.parse(userData))
        }
    }, [router])

    // Fetch dramas
    useEffect(() => {
        const fetchDramas = async () => {
            try {
                const response = await fetch('/api/dramas')
                const data = await response.json()
                setDramas(data)
            } catch (error) {
                console.error('Error fetching dramas:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDramas()
    }, [])

    // Handle clicking outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (isDropdownOpen && !target.closest('.profile-dropdown')) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [isDropdownOpen])

    if (!user) return null

    return (
        <div className="min-h-screen bg-black">
            {/* Navigation Bar */}
            <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Kooli Logo */}
                        <Link href="/">
                            <img
                                src="/koolilogo.webp"
                                alt="Kooli Logo"
                                className="w-10 h-10 object-contain"
                            />
                        </Link>
                        <Link href="/" className="text-xl font-bold text-white hover:text-blue-400">
                            K-Drama
                        </Link>
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
                        <div className="relative profile-dropdown">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsDropdownOpen(!isDropdownOpen)
                                }}
                                className={`text-gray-300 hover:text-white px-3 py-2 rounded-md ${isDropdownOpen ? 'bg-gray-800' : ''}`}
                            >
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

            {/* Main Content */}
            <div className="max-w-6xl mx-auto py-8 px-4 flex gap-6">
                {/* Drama Subreddits Sidebar */}
                <div className="w-64 flex-shrink-0">
                    <div className="bg-gray-900 rounded-lg p-4 sticky top-20">
                        <h2 className="text-lg font-semibold text-white mb-4">Drama Communities</h2>
                        {isLoading ? (
                            <div className="text-gray-400">Loading dramas...</div>
                        ) : (
                            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                                {dramas.map((drama) => (
                                    <Link
                                        key={drama.slug}
                                        href={`/k/${drama.slug}`}
                                        className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800 group"
                                    >
                                        <img
                                            src={drama.imageUrl}
                                            alt={drama.title}
                                            className="w-8 h-8 rounded object-cover"
                                        />
                                        <div>
                                            <div className="text-gray-300 group-hover:text-white text-sm">
                                                k/{drama.title}
                                            </div>
                                            <div className="text-gray-500 text-xs">
                                                {drama.memberCount?.toLocaleString()} members
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    <PostForm user={user} onPostCreated={refreshPosts}/>
                    <div className="mt-6">
                        <PostList
                            viewMode={viewMode}
                            currentUser={user}
                            refreshKey={refreshKey}
                        />
                    </div>
                </div>

                {/* Trending Dramas Sidebar */}
                <div className="w-64 flex-shrink-0">
                    <div className="bg-gray-900 rounded-lg p-4 sticky top-20">
                        <h2 className="text-lg font-semibold text-white mb-4">Trending Dramas</h2>
                        {isLoading ? (
                            <div className="text-gray-400">Loading trends...</div>
                        ) : (
                            <div className="space-y-3">
                                {dramas.slice(0, 5).map((drama) => (
                                    <Link
                                        key={drama.slug}
                                        href={`/k/${drama.slug}`}
                                        className="block p-2 rounded hover:bg-gray-800"
                                    >
                                        <div className="text-gray-300 hover:text-white">
                                            {drama.title}
                                        </div>
                                        <div className="text-gray-500 text-sm">
                                            {drama.memberCount?.toLocaleString()} active users
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
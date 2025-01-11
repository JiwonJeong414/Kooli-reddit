'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PostForm from '@/components/PostForm'
import PostList from '@/components/PostList'
import Link from 'next/link'
import DramaList from "@/components/DramaList";

export default function Home() {
    const [user, setUser] = useState<any>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [viewMode, setViewMode] = useState<'all' | 'my-posts'>('all')
    const router = useRouter()
    const [refreshKey, setRefreshKey] = useState(0)

    const refreshPosts = () => {
        setRefreshKey(prev => prev + 1)
    }

    useEffect(() => {
        const userData = sessionStorage.getItem('user')
        if (!userData) {
            router.push('/login')
        } else {
            setUser(JSON.parse(userData))
        }
    }, [router])

    // Add click handler for closing dropdown when clicking outside
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

            <div className="max-w-4xl mx-auto py-8 px-4">
                <PostForm user={user} onPostCreated={refreshPosts}/>
                <PostList viewMode={viewMode} currentUser={user} refreshKey={refreshKey}/>
                <DramaList/>
            </div>
        </div>
    )
}
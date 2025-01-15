'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import PostForm from '@/components/PostForm'
import PostList from '@/components/PostList'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Users, LogOut, User, Flame, TrendingUp, ArrowUpCircle } from 'lucide-react'
import type { Drama } from '@/types'

const customScrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgb(31, 41, 55);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgb(55, 65, 81);
    border-radius: 8px;
  }
`

export default function Home() {
    const [user, setUser] = useState<any>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [viewMode, setViewMode] = useState<'all' | 'my-posts'>('all')
    const [dramas, setDramas] = useState<Drama[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentSlide, setCurrentSlide] = useState(0)
    const router = useRouter()
    const [refreshKey, setRefreshKey] = useState(0)

    const top10Dramas = useMemo(() => {
        return [...dramas]
            .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0))
            .slice(0, 10)
    }, [dramas])

    const handleRestrictedAction = (action: Function) => {
        if (!user) {
            router.push('/login')
        } else {
            action()
        }
    }

    useEffect(() => {
        if (top10Dramas.length === 0) return
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % top10Dramas.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [top10Dramas.length])

    useEffect(() => {
        const userData = sessionStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }
    }, [])

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

    const refreshPosts = () => {
        setRefreshKey(prev => prev + 1)
    }

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % top10Dramas.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + top10Dramas.length) % top10Dramas.length)
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <style>{customScrollbarStyle}</style>

            <nav className="bg-gray-900 shadow-lg sticky top-0 z-50 border-b border-gray-800">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center space-x-3">
                                <img
                                    src="/koolilogo.webp"
                                    alt="Kooli Logo"
                                    className="w-10 h-10 object-contain rounded-lg"
                                />
                                <span className="text-xl font-bold text-blue-400">
                                    K-Drama
                                </span>
                            </Link>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleRestrictedAction(() => setViewMode('all'))}
                                    className={`px-6 py-2 rounded-full ${
                                        viewMode === 'all'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    All Posts
                                </button>
                                <button
                                    onClick={() => handleRestrictedAction(() => setViewMode('my-posts'))}
                                    className={`px-6 py-2 rounded-full ${
                                        viewMode === 'my-posts'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    My Posts
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 ml-auto">
                            {user ? (
                                <>
                                    <span className="text-gray-300">Welcome, {user.username}</span>
                                    <div className="relative profile-dropdown">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setIsDropdownOpen(!isDropdownOpen)
                                            }}
                                            className={`px-4 py-2 rounded-md ${
                                                isDropdownOpen ? 'bg-gray-800' : 'text-gray-300 hover:bg-gray-800'
                                            }`}
                                        >
                                            Profile
                                        </button>

                                        {isDropdownOpen && (
                                            <div
                                                className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg">
                                                <Link
                                                    href="/profile"
                                                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                                >
                                                    View Profile
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        sessionStorage.removeItem('user')
                                                        setUser(null)
                                                        setViewMode('all')
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                                >
                                                    Logout
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="relative h-96 mb-8 overflow-hidden">
                <div
                    className="h-full flex transition-transform duration-500"
                    style={{transform: `translateX(-${currentSlide * 100}%)`}}
                >
                    {top10Dramas.map((drama, index) => (
                        <div key={index} className="w-full h-full flex-shrink-0 relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"/>
                            <img
                                src={drama.imageUrl}
                                alt={drama.title}
                                className="w-full h-full object-cover"
                                loading={index === 0 ? 'eager' : 'lazy'}
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-8">
                                <div className="max-w-6xl mx-auto px-4">
                                    <h2 className="text-3xl font-bold text-white mb-2">
                                        {drama.title}
                                    </h2>
                                    <p className="text-gray-200 mb-4">
                                        {drama.memberCount?.toLocaleString()} members • Top {index + 1} Drama
                                    </p>
                                    <button
                                        onClick={() => handleRestrictedAction(() => router.push(`/k/${drama.slug}`))}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Join Community
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                    <ChevronLeft className="w-6 h-6"/>
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                    <ChevronRight className="w-6 h-6"/>
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {top10Dramas.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 rounded-full ${
                                currentSlide === index ? 'bg-white' : 'bg-white/50'
                            }`}
                        />
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 flex gap-8">
                <div className="w-64 flex-shrink-0">
                    <div className="bg-gray-800 rounded-xl p-6 sticky top-20 border border-gray-700">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
                            <Users className="w-5 h-5 mr-2 text-blue-400"/>
                            <span className="text-white">Drama Communities</span>
                        </h2>
                        <div className="space-y-3 custom-scrollbar max-h-[70vh] overflow-y-auto pr-2">
                            {dramas.map((drama) => (
                                <div
                                    key={drama.slug}
                                    onClick={() => handleRestrictedAction(() => router.push(`/k/${drama.slug}`))}
                                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 cursor-pointer"
                                >
                                    <img
                                        src={drama.imageUrl}
                                        alt={drama.title}
                                        className="w-10 h-10 rounded-lg object-cover"
                                        loading="lazy"
                                    />
                                    <div>
                                        <div className="text-gray-200 font-medium">
                                            k/{drama.title}
                                        </div>
                                        <div className="text-gray-400 text-sm">
                                            {drama.memberCount?.toLocaleString()} members
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    {user ? (
                        <PostForm user={user} onPostCreated={refreshPosts}/>
                    ) : (
                        <div className="bg-gray-800 p-6 rounded-xl mb-6 text-center">
                            <p className="text-gray-300 mb-4">Login to share your thoughts and interact with the
                                community</p>
                            <Link
                                href="/login"
                                className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 inline-block"
                            >
                                Login to Post
                            </Link>
                        </div>
                    )}
                    <div className="mt-6">
                        <PostList
                            viewMode={viewMode}
                            currentUser={user}
                            refreshKey={refreshKey}
                            onRestrictedAction={handleRestrictedAction}
                        />
                    </div>
                </div>

                <div className="w-64 flex-shrink-0">
                    <div className="bg-gray-800 rounded-xl p-6 sticky top-20 border border-gray-700">
                        <h2 className="text-lg font-semibold text-blue-400 mb-6">
                            Trending Dramas
                        </h2>
                        <div className="space-y-4">
                            {dramas.slice(0, 5).map((drama, index) => {
                                const TrendIcon = index === 0 ? Flame :
                                    index === 1 ? TrendingUp :
                                        ArrowUpCircle;

                                return (
                                    <div
                                        key={drama.slug}
                                        onClick={() => handleRestrictedAction(() => router.push(`/k/${drama.slug}`))}
                                        className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-700 cursor-pointer"
                                    >
                                        <div className="text-blue-400">
                                            <TrendIcon className="w-5 h-5"/>
                                        </div>
                                        <div>
                                            <div className="text-gray-200 font-medium">
                                                {drama.title}
                                            </div>
                                            <div className="text-gray-400 text-sm">
                                                {drama.memberCount?.toLocaleString()} active users
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
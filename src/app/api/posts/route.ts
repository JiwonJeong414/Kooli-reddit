import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
    try {
        const client = await clientPromise
        const db = client.db("reddit-clone")

        const posts = await db.collection("posts")
            .find({})
            .sort({ createdAt: -1 })
            .toArray()

        return NextResponse.json(posts)
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch posts' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const client = await clientPromise
        const db = client.db("reddit-clone")
        const data = await request.json()

        const post = {
            ...data,
            createdAt: new Date(),
            votes: 0,
            comments: []
        }

        const result = await db.collection("posts").insertOne(post)
        return NextResponse.json({ success: true, post })
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json(
            { error: 'Failed to create post' },
            { status: 500 }
        )
    }
}
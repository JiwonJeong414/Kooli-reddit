import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
    try {
        const client = await clientPromise
        const db = client.db("reddit-clone")

        const posts = await db.collection("posts")
            .find({})
            .sort({ createdAt: -1 })
            .limit(20)
            .toArray()

        return NextResponse.json(posts)
    } catch (error) {
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
        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create post' },
            { status: 500 }
        )
    }
}
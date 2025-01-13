import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
    try {
        const client = await clientPromise
        const db = client.db("reddit-clone")
        const userId = request.nextUrl.searchParams.get('userId')
        const dramaSlug = request.nextUrl.searchParams.get('dramaSlug')

        let query = {}
        if (userId) {
            query = { "author.id": userId }
        } else if (dramaSlug) {
            query = { dramaSlug }
        }

        const posts = await db.collection("posts")
            .find(query)
            .sort({ createdAt: -1 })
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
            votes: 0,
            voters: [],
            createdAt: new Date()
        }

        const result = await db.collection("posts").insertOne(post)
        return NextResponse.json({
            _id: result.insertedId,
            ...post
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create post' },
            { status: 500 }
        )
    }
}
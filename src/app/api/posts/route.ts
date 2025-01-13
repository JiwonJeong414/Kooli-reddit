import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
    try {
        const client = await clientPromise
        const db = client.db("reddit-clone")
        const userId = request.nextUrl.searchParams.get('userId')

        let query = {}
        if (userId) {
            query = { "author.id": userId }
        }

        const posts = await db.collection("posts")
            .find(query)
            .sort({ votes: -1, createdAt: -1 })
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

        // If dramaId is provided, verify the drama exists
        if (data.dramaId) {
            const drama = await db.collection("dramas").findOne({
                _id: new ObjectId(data.dramaId)
            })

            if (!drama) {
                return NextResponse.json(
                    { error: 'Drama not found' },
                    { status: 404 }
                )
            }
        }

        const post = {
            ...data,
            votes: 0,
            voters: [],
            createdAt: new Date()
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

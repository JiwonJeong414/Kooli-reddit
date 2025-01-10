import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
    try {
        const { postId, userId, vote } = await request.json()
        const client = await clientPromise
        const db = client.db("reddit-clone")

        const post = await db.collection("posts").findOne({
            _id: new ObjectId(postId)
        })

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        // Check if user has already voted
        const hasVoted = post.voters?.some((voter: any) => voter.userId === userId)

        if (hasVoted) {
            // Update existing vote
            await db.collection("posts").updateOne(
                { _id: new ObjectId(postId), "voters.userId": userId },
                { $set: { "voters.$.vote": vote } }
            )
        } else {
            // Add new vote
            await db.collection("posts").updateOne(
                { _id: new ObjectId(postId) },
                {
                    $push: { voters: { userId, vote } },
                }
            )
        }

        // Update total votes
        const updatedPost = await db.collection("posts").findOne({
            _id: new ObjectId(postId)
        })

        const totalVotes = updatedPost.voters.reduce(
            (acc: number, curr: any) => acc + curr.vote,
            0
        )

        await db.collection("posts").updateOne(
            { _id: new ObjectId(postId) },
            { $set: { votes: totalVotes } }
        )

        return NextResponse.json({ success: true, votes: totalVotes })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to vote' },
            { status: 500 }
        )
    }
}
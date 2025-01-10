import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData()
        const emailOrUsername = data.get('emailOrUsername')
        const password = data.get('password')

        if (!emailOrUsername || !password) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db("reddit-clone")

        // Find user by email or username
        const user = await db.collection("users").findOne({
            $or: [
                { email: emailOrUsername },
                { username: emailOrUsername }
            ]
        })

        if (user && user.password === password) {
            return NextResponse.json({
                success: true,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            })
        } else {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        )
    }
}
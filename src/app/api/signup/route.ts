import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData()
        const email = data.get('email')
        const username = data.get('username')
        const password = data.get('password')
        const confirmPassword = data.get('confirmPassword')

        // Validate input
        if (!email || !username || !password || !confirmPassword) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            )
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: 'Passwords do not match' },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
        if (!emailRegex.test(email.toString())) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db("reddit-clone")

        // Check if user already exists
        const existingUser = await db.collection("users").findOne({
            $or: [
                { email: email },
                { username: username }
            ]
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email or username already exists' },
                { status: 400 }
            )
        }

        // Create new user
        const result = await db.collection("users").insertOne({
            email,
            username,
            password, // Note: In production, this should be hashed
            createdAt: new Date()
        })

        return NextResponse.json({
            success: true,
            message: 'User created successfully'
        })

    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json(
            { error: 'Signup failed' },
            { status: 500 }
        )
    }
}
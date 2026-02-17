import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const DATABASE_ID = process.env.NOTION_WAITLIST_DATABASE_ID

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { email } = await request.json()

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if Notion is configured
    if (!process.env.NOTION_API_KEY) {
      console.error('❌ NOTION_API_KEY not configured')
      return NextResponse.json(
        { error: 'Notion integration not configured' },
        { status: 500 }
      )
    }

    if (!DATABASE_ID) {
      console.error('❌ NOTION_WAITLIST_DATABASE_ID not configured')
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Add email to Notion database
    const response = await notion.pages.create({
      parent: {
        database_id: DATABASE_ID,
      },
      icon: {
        type: 'emoji',
        emoji: '✉️',
      },
      properties: {
        // Title field (mandatory text field created by Notion)
        title: {
          title: [
            {
              text: {
                content: email,
              },
            },
          ],
        },
        // Email field (type: email)
        Email: {
          email: email,
        },
        // Date field (type: date)
        Date: {
          date: {
            start: new Date().toISOString(),
          },
        },
      },
    })

    console.log('✅ Email added to Notion waitlist:', email)

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully joined waitlist',
        id: response.id,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Error adding to Notion waitlist:', error)

    // Handle duplicate email (if you have unique constraint)
    if (error.code === 'validation_error') {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    )
  }
}

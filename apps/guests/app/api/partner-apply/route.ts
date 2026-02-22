import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const DATABASE_ID = process.env.PARTNER_INTEREST_DB

// E.164: max 15 digits total (dial code + number)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const { businessName, location, email, phone } = await request.json()

    // ── Input validation ────────────────────────────────────────────────────

    if (!businessName?.trim()) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }
    if (!location?.trim()) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 })
    }
    if (!email?.trim() || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 })
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // ── Config check ────────────────────────────────────────────────────────

    if (!process.env.NOTION_API_KEY) {
      console.error('❌ NOTION_API_KEY not configured')
      return NextResponse.json({ error: 'Notion integration not configured' }, { status: 500 })
    }
    if (!DATABASE_ID) {
      console.error('❌ PARTNER_INTEREST_DB not configured')
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // ── Create Notion page ──────────────────────────────────────────────────

    const response = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      icon: { type: 'emoji', emoji: '🤝' },
      properties: {
        // Title / Business Name
        'Business Name': {
          title: [{ text: { content: businessName.trim() } }],
        },
        Location: {
          rich_text: [{ text: { content: location.trim() } }],
        },
        Email: {
          email: email.trim().toLowerCase(),
        },
        'Phone Number': {
          phone_number: phone.trim(),
        },
      },
    })

    console.log('✅ Partner application submitted:', businessName, email)

    return NextResponse.json(
      { success: true, message: 'Application received', id: response.id },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('❌ Error submitting partner application:', error)
    const notionError = error as { code?: string }
    if (notionError.code === 'validation_error') {
      return NextResponse.json(
        { error: 'Submission failed — please check your details and try again.' },
        { status: 422 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    )
  }
}

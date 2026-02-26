/**
 * API route for theme management
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ThemeTokens } from '@/lib/color-utils';

interface ThemeRequestBody {
  primaryColor: string;
  tokens: ThemeTokens;
}

/**
 * POST /api/theme
 * Save theme configuration to backend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ThemeRequestBody;

    const { primaryColor, tokens } = body;

    // Validate input
    if (!primaryColor || !primaryColor.match(/^#[0-9A-F]{6}$/i)) {
      return NextResponse.json(
        { error: 'Invalid primary color format' },
        { status: 400 }
      );
    }

    if (!tokens || !tokens.lightMode || !tokens.darkMode) {
      return NextResponse.json(
        { error: 'Invalid theme tokens' },
        { status: 400 }
      );
    }

    // TODO: Persist to database
    // For now, we'll just validate and return success
    // In a real implementation, you would:
    // 1. Get the current user/restaurant
    // 2. Save or update the theme in the database
    // 3. Return the saved theme

    console.log('[v0] Theme saved:', {
      primaryColor,
      savedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Theme saved successfully',
        primaryColor,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Theme API error:', error);
    return NextResponse.json(
      { error: 'Failed to save theme' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/theme
 * Retrieve saved theme configuration
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Retrieve from database
    // For now, return default theme
    const defaultTheme = {
      primaryColor: '#FF6B6B',
      id: 'default',
      generatedAt: Date.now(),
    };

    return NextResponse.json(defaultTheme);
  } catch (error) {
    console.error('[v0] Theme retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve theme' },
      { status: 500 }
    );
  }
}

# RedFlag Frontend - Product Requirements Document

## Overview
RedFlag is a litigation file intelligence tool that helps legal teams find contradictions in case files before opposing counsel does. This PRD covers the frontend marketing site and interactive playground.

## Tech Stack
- HTML5
- CSS3 (custom properties, grid, flexbox)
- Vanilla JavaScript
- Google Fonts (IBM Plex Mono, Instrument Serif)
- Calendly Widget for demo bookings
- Plausible Analytics

## Features

### 1. Marketing Page (Route: /)
**Description:** Main landing page showcasing RedFlag's value proposition.

**Sections:**
- Hero with animated typewriter headline
- Problem statement (3 cards)
- How It Works (3-step process)
- Findings display (contradiction examples)
- Time comparison (manual vs RedFlag)
- Why RedFlag comparison table
- Trust & Privacy pillars
- Call-to-Action with calendar booking
- Footer

**User Interactions:**
- Scroll through sections
- Click CTA buttons to access configuration
- Click nav links to jump to sections
- Responsive mobile menu

### 2. Configuration View (Route: /configuration)
**Description:** Interface for configuring document analysis parameters.

**Fields:**
- Case Type (dropdown)
- Case Name (text input)
- Case Number (text input)
- Analysis options (checkboxes)

**User Interactions:**
- Fill in configuration fields
- Save configuration (client-side)
- Start analysis (navigates to playground)
- View configuration summary

### 3. Playground / Chat Interface (Route: /playground)
**Description:** Interactive chat UI for uploading documents and querying contradictions.

**Components:**
- Sidebar with chat sessions list
- Chat messages area
- Document upload dropzone
- Query input with send button
- Quick question buttons

**User Interactions:**
- Upload documents (drag-and-drop or click)
- View uploaded file list
- Type and send queries
- Create new chat sessions
- Switch between sessions
- Rename/delete sessions
- Use quick question templates
- View AI responses with citations
- Toggle compact view

### 4. Navigation
**Description:** Fixed top navigation bar present across all views.

**Elements:**
- Logo (clickable, returns to marketing)
- Nav links (scroll to sections or switch views)
- CTA button (navigates to configuration)
- Mobile hamburger menu

**User Interactions:**
- Click logo to go home
- Click links to navigate
- Mobile: toggle hamburger menu

## Known Limitations
- Chat responses are simulated (no real AI backend)
- Configuration not persisted to server
- Document upload is frontend-only (no backend processing)
- Analytics and Calendly require external services

## Success Criteria
- All navigation links work correctly
- Mobile responsive menu functions
- Chat UI renders correctly with all components
- Document upload UI accepts files
- Configuration form accepts input
- Typewriter animation plays on hero
- All sections display correctly at different viewport sizes

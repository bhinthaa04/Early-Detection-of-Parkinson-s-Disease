# Dropdown Navigation Implementation Plan

## Task: Add dropdown menus to navigation in GlobalLayout.tsx

## Current Navigation:
- Home
- Test
- Assessment
- Education
- Dashboard

## New Navigation Structure:
1. **Overview** (with dropdown)
   - Home
   - About Parkinson's
   - Symptoms Guide
   
2. **Diagnostics** (with dropdown)
   - Test
   - Assessment
   - Face Analysis
   - Spiral Drawing
   - Voice Analysis
   
3. **Therapy Hub** (with dropdown)
   - Speech Therapy
   - Hand Therapy
   - Breathing Exercises
   - Physical Therapy
   - Brain Games
   
4. **Provider Portal** (with dropdown)
   - Doctor Login
   - Doctor Dashboard
   - Patient Records
   
5. **Resources** (with dropdown)
   - Education
   - Find Specialist
   - Wearable Integration
   - AI Chatbot

## Implementation Steps:
1. Modify GlobalLayout.tsx to add dropdown functionality
2. Add useState for tracking open dropdowns
3. Add dropdown menu components with sub-items
4. Style dropdowns with hover effects

## Files to Edit:
- client/src/components/GlobalLayout.tsx

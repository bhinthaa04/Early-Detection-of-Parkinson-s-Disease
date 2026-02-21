# Daily Wellness Tasks - Comprehensive Guide

## Overview

The **Daily Wellness Tasks** module is an accessible, voice-guided system that helps users perform simple, safe exercises at home every day. It's designed to be the first thing users engage with when starting their wellness journey, providing objective measurement data that helps identify patterns and track well-being over time.

**Access**: `http://localhost:5000/daily-tasks`

---

## What Are Daily Tasks?

Daily Tasks are 5 simple exercises designed to:
- ✅ Monitor subtle changes in movement, voice, and cognition
- ✅ Provide engaging, accessible wellness activities
- ✅ Build healthy daily habits
- ✅ Create a historical record for pattern analysis
- ✅ Offer encouragement and progress tracking

### Why This Matters

Parkinson's symptoms often develop gradually. By performing these tasks daily:
- **Voice changes** appear as clarity issues or tremor in sustained sounds
- **Hand dexterity** changes show up in tapping speed and accuracy
- **Balance and tremor** patterns become evident from posture data
- **Cognitive alertness** varies with time of day and fatigue

Tracking these over weeks and months helps you:
1. Notice patterns your healthcare provider should know about
2. Understand how treatments affect your function
3. Stay motivated with concrete progress visualization
4. Catch changes early for better outcomes

---

## Task Types

### 1. Voice Sustain
**Purpose**: Measure vocal clarity and breath control

**What you do**:
- Say "Aaah" and hold it for as long as you can
- Task monitors voice consistency and tremor

**How it helps**:
- Detects changes in vocal strength
- Early warning for speech clarity issues
- Useful for swallowing assessments

**Duration**: 10 seconds

---

### 2. Finger Tapping
**Purpose**: Assess hand coordination and speed

**What you do**:
- Tap the screen as rapidly as you can
- System counts taps and measures consistency

**How it helps**:
- Detects fine motor slowing
- Measures tremor in hand movement
- One of the most sensitive early indicators

**Duration**: 10 seconds
**Scoring**: Based on tap count and spacing consistency

---

### 3. Hand Stability
**Purpose**: Measure tremor and postural control

**What you do**:
- Hold your hand steady in front of the camera
- System tracks micro-movements via video or device sensors

**How it helps**:
- Detects resting tremor patterns
- Measures frequency (Parkinson's = 4-6 Hz)
- Assess postural control

**Duration**: 10 seconds

---

### 4. Facial Expression
**Purpose**: Evaluate facial mobility and expression range

**What you do**:
- Smile, blink, and relax your face on command
- System measures range and symmetry of movement

**How it helps**:
- Detects "masked face" (reduced expression)
- Assess blink frequency
- Facial symmetry evaluation

**Duration**: 8 seconds

---

### 5. Cognitive Task
**Purpose**: Quick cognitive assessment

**What you do**:
- Listen to a simple question
- Respond verbally or with gestures

**Example Questions**:
- "What is the capital of France?"
- "How many days are in a week?"
- "Name a red fruit"
- "What color is the sky?"
- "How many fingers on one hand?"

**How it helps**:
- Detects cognitive slowing
- Assess attention and focus
- Measure response time

**Duration**: 15 seconds (includes question)

---

## How Daily Tasks Work

### Daily Task Generation

Each day, the system:
1. **Generates 4-5 tasks** from the full set randomly
2. **Stores them locally** (same tasks all day)
3. **Tracks completion** with timestamps and scores
4. **Persists history** for pattern analysis

```typescript
// Tasks reset daily based on device date
const today = new Date().toDateString();
const cachedDate = localStorage.getItem("daily_tasks_date");

if (cachedDate !== today) {
  // Generate new tasks for today
  const numTasks = Math.random() > 0.5 ? 4 : 5;
  const tasks = selectRandomTasks(numTasks);
}
```

### Voice Guidance System

All instructions are spoken to users:
- ✅ Welcome message with task count
- ✅ Task instructions before starting
- ✅ Encouraging feedback on completion
- ✅ Summary announcement at end of day

Uses **Web Speech API** (SpeechSynthesis):
```typescript
const speakText = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;  // Slightly slower for clarity
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
};
```

### Accessibility Features

**Voice-First Navigation**:
- All instructions provided via audio
- Large, simple buttons (80px+)
- High contrast colors
- Minimal text, maximum visual clarity

**Touch-Based Interaction**:
- No keyboard required
- Large tap targets
- Simple swipe/tap gestures

**Calm, Supportive Design**:
- Soothing colors (blues, purples)
- Smooth animations (not jarring)
- Encouraging messages
- Progress visualization

---

## Scoring System

### Score Calculation

Each task receives a 0-100 score based on:

**Finger Tapping**:
```
score = 50 + (tapCount / 2)
// More taps = higher score
// Capped at 100
```

**Voice Tasks**:
```
score = 80 (baseline for effort)
// Adjusted based on audio quality/tremor detection
```

**Hand Stability**:
```
score = 85 (baseline for completing the test)
// Adjusted based on tremor magnitude
```

**Facial Expression**:
```
score = 85 (baseline for completing the test)
// Adjusted based on range of motion detected
```

**Cognitive Task**:
```
score = 75 (baseline for attempt)
// Adjusted based on response correctness & speed
```

### Feedback Categories

- **85-100**: "Excellent work! Keep it up!" 🌟
- **60-84**: "Good effort! You're doing great!" ✅
- **Below 60**: "Nice try! Every bit helps!" 💪

---

## Progress Tracking

### Daily Streak
Tracks consecutive days of task completion:
```typescript
const getDailyStreak = (): number => {
  let streak = 0;
  let currentDate = new Date();
  
  for (let i = 0; i < 30; i++) {
    const dateStr = currentDate.toDateString();
    const completed = taskHistory.filter(
      h => h.date === dateStr && h.completed
    );
    
    if (completed.length > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;  // Streak broken
    }
  }
  
  return streak;
};
```

### Average Score
Historical average across all attempts:
```typescript
const avgScore = taskHistory.reduce((sum, h) => sum + h.score, 0) / taskHistory.length;
```

### Completion Rate
Percentage of daily tasks completed today:
```typescript
const completionRate = (completedTaskCount / totalTaskCount) * 100;
```

### Task History Storage

Stored in localStorage as JSON:
```json
{
  "task_history": [
    {
      "date": "Fri Jan 12 2024",
      "taskId": "voice_sustain",
      "completed": true,
      "score": 82
    },
    {
      "date": "Fri Jan 12 2024",
      "taskId": "finger_tapping",
      "completed": true,
      "score": 88
    }
  ]
}
```

---

## User Flow

### 1. Welcome & Initialization
```
User visits /daily-tasks
→ System checks today's date
→ If new day: Generate 4-5 random tasks
→ If same day: Load cached tasks
→ Speak welcome message
→ Display task count
```

### 2. Task Loop
```
For each task:
  → Display task card with instructions
  → User clicks "Start Task"
  → Task begins with countdown
  → Visual/audio feedback during task
  → Auto-completion or manual submission
  → Calculate score & provide feedback
  → Move to next task
```

### 3. Daily Summary
```
When all tasks complete:
  → Show completion rate (%)
  → Display daily streak 🔥
  → Show average historical score
  → List today's task breakdown
  → Provide encouraging message
```

### 4. Option to Review
```
User can:
  → Go back home
  → Review tasks again
  → Start new daily session (if date changes)
```

---

## Data Storage

### localStorage Structure

```javascript
// Daily tasks for today
localStorage.setItem("daily_tasks_date", "Fri Jan 12 2024");
localStorage.setItem("daily_tasks", JSON.stringify([...tasks]));

// Historical completion data
localStorage.setItem("task_history", JSON.stringify([...history]));
```

### Data Persistence

- ✅ Tasks persist throughout the day
- ✅ History accumulates indefinitely
- ✅ Survives browser refresh
- ✅ Survives app restart
- ✅ Can be exported for medical review

### Privacy

- ✅ All data stored locally (not sent to servers)
- ✅ No personal identifiable information
- ✅ User has full control
- ✅ Can be deleted anytime

---

## Accessibility Implementation

### WCAG Compliance

**Large Touch Targets**: All buttons ≥ 80px × 44px
```tsx
<Button 
  className="px-12 py-6 text-lg"  // Large enough
>
```

**High Contrast**: 7:1+ contrast ratio
```css
/* White text on dark blue background */
color: #FFFFFF;
background: #0F172A;  /* WCAG AAA compliant */
```

**Voice Guidance**: All critical information spoken
```typescript
speakText("Voice Sustain task. Say 'Aaah' and hold it steady.");
```

**Simple Language**: Non-medical, user-friendly
```
✅ "Hold a steady sound" instead of "Sustain vocalization"
✅ "Tap quickly" instead of "Rapid finger tapping assessment"
```

**Calm Colors**: Reduce cognitive load
```
Primary: Blues (#0F172A to #3B82F6)
Secondary: Purples (#7C3AED)
Accent: Green for success, Yellow for warning
```

---

## Customization Guide

### Adjust Task Duration

```typescript
// In daily-tasks.tsx
const TASK_TEMPLATES: Record<string, DailyTask> = {
  voice_sustain: {
    // ...
    duration: 15,  // Change from 10 to 15 seconds
  }
};
```

### Modify Task Selection

```typescript
// Change number of daily tasks
const numTasks = 3;  // Instead of Math.random() > 0.5 ? 4 : 5
```

### Add New Task Type

```typescript
// Add to TASK_TEMPLATES
gait_analysis: {
  id: "gait_analysis",
  title: "Walk 10 Steps",
  description: "Walk in a straight line",
  instruction: "Walk 10 steps forward while holding the device",
  duration: 12,
  icon: Activity,
  type: "movement",
  difficulty: "medium",
}
```

### Adjust Scoring Thresholds

```typescript
// Change what counts as "high" score
const EXCELLENT_THRESHOLD = 90;  // Instead of 85
const GOOD_THRESHOLD = 70;       // Instead of 60
```

### Customize Feedback Messages

```typescript
const feedback = {
  excellent: "You're a wellness champion! 🏆",
  good: "Fantastic effort today! 💪",
  okay: "Every step counts! 🌱",
};
```

---

## Integration with Health Tracking

### Export Data Format

Can be exported as CSV for healthcare providers:
```
Date,Task,Score,Notes
Fri Jan 12 2024,Voice Sustain,82,Clear voice
Fri Jan 12 2024,Finger Tapping,88,Good speed
```

### Trend Analysis (Future)

Historical data enables:
- Weekly average tracking
- Decline detection (score drop > 10%)
- Performance by time-of-day
- Medication effectiveness correlation

---

## Non-Medical Disclaimer

⚠️ **Important**: This module is for:
- ✅ Wellness support and self-monitoring
- ✅ Building healthy daily habits
- ✅ Creating discussion points with healthcare providers
- ❌ NOT medical diagnosis
- ❌ NOT clinical assessment
- ❌ NOT treatment recommendation

**Always consult your healthcare provider** about concerning changes or declining scores.

---

## Technical Architecture

### Component Structure

```
DailyTasks (main component)
├── TaskHistory (localStorage management)
├── VoiceGuidance (Speech Synthesis API)
├── TaskCard (current task display)
│   ├── FingerTappingZone
│   ├── VoiceIndicator
│   ├── CountdownTimer
│   └── FeedbackDisplay
├── ProgressTracker
│   ├── DailyStreak
│   ├── AverageScore
│   └── CompletionRate
└── SummaryScreen
    ├── PerformanceMetrics
    ├── TaskBreakdown
    └── ActionButtons
```

### Key States

```typescript
interface CompletionState {
  taskId: string;
  started: boolean;
  completed: boolean;
  score: number;
  feedback: string;
}

interface TaskHistory {
  date: string;
  taskId: string;
  completed: boolean;
  score?: number;
}
```

### Hooks Used

- `useState`: Task management, UI state
- `useEffect`: Initialization, speech synthesis setup
- `useRef`: Timer management, audio references
- `useLocation`: Navigation (Wouter routing)

---

## Browser Compatibility

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| Speech Synthesis | ✅ | ✅ | ✅ | ✅ |
| Speech Recognition | ✅ | ⚠️ | ⚠️ | ✅ |
| localStorage | ✅ | ✅ | ✅ | ✅ |
| Touch Events | ✅ | ✅ | ✅ | ✅ |

---

## Troubleshooting

### Issue: No Voice Output
**Solution**: 
- Check browser volume settings
- Grant audio permissions
- Test speaker/headphones
- Check Speech Synthesis API support

### Issue: Tasks Not Saving
**Solution**:
- Check localStorage availability
- Verify not in private/incognito mode
- Clear browser cache and reload
- Check disk space

### Issue: Wrong Task Count
**Solution**:
- Clear localStorage: 
  ```javascript
  localStorage.removeItem("daily_tasks_date");
  localStorage.removeItem("daily_tasks");
  ```
- Reload page to generate new tasks

---

## Future Enhancements

Potential improvements:

1. **Camera-Based Detection**
   - Hand stability via webcam
   - Facial expression analysis
   - Gait analysis with device camera

2. **Advanced Analytics**
   - Trend line visualization
   - ML-based anomaly detection
   - Medication effect correlation

3. **Gamification**
   - Achievement badges
   - Leaderboard (anonymous)
   - Challenge friends

4. **Integration**
   - Export to health apps
   - Sync with wearables
   - Share with healthcare provider

5. **Personalization**
   - Adaptive difficulty
   - Custom task selection
   - Preferred time scheduling

---

## Support & Resources

- **Component**: [daily-tasks.tsx](client/src/pages/daily-tasks.tsx)
- **Route**: `/daily-tasks`
- **Feature**: Wellness tracking & monitoring
- **Updated**: January 12, 2026

For questions or issues, consult the main [README.md](README.md) or [FEATURES_SUMMARY.md](FEATURES_SUMMARY.md).

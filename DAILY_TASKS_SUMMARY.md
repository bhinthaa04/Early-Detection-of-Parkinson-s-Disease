# Daily Wellness Tasks - Quick Summary

## What Is It?

A voice-guided, accessibility-first module that delivers 3-5 simple daily wellness tasks. Users complete them once per day, and the system tracks progress over time.

**Location**: `/daily-tasks`
**Type**: Wellness monitoring tool (not medical diagnosis)
**Access**: Voice-guided, touch-based, no keyboard needed

---

## The 5 Task Types

| Task | What You Do | Duration | What It Measures |
|------|-----------|----------|------------------|
| **Voice Sustain** | Say "Aaah" and hold steady | 10s | Vocal clarity & breath control |
| **Finger Tapping** | Tap screen rapidly | 10s | Hand coordination & speed |
| **Hand Stability** | Hold hand still & steady | 10s | Tremor patterns & motor control |
| **Facial Expression** | Smile, blink, relax | 8s | Facial mobility & expression range |
| **Cognitive Task** | Answer a simple question | 15s | Alertness & response time |

---

## How It Helps Monitor Symptoms

### Why Track Daily?

Parkinson's symptoms develop **gradually**. Daily tracking helps you:

1. **Catch Changes Early**: Small declines become visible over weeks
2. **Understand Patterns**: Which times of day are harder?
3. **Track Treatments**: How do medications affect your score?
4. **Build Data**: Create a record for your healthcare provider
5. **Stay Motivated**: Visual progress keeps you engaged

### What Each Task Reveals

| Task | Detects |
|------|---------|
| **Voice Sustain** | Speech clarity issues, vocal tremor, breath control |
| **Finger Tapping** | Hand slowing, tremor, coordination decline |
| **Hand Stability** | Resting tremor, motor control, postural issues |
| **Facial Expression** | "Masked face" (reduced expression), blink rate |
| **Cognitive Task** | Mental slowing, attention issues, quick thinking |

---

## User Experience Flow

### Step 1: Daily Welcome
```
✓ Opens page
✓ System generates 4-5 random tasks for the day
✓ Speaks: "Welcome! You have 4 tasks today. Let's get started!"
```

### Step 2: Task Loop
For each task:
```
✓ Shows task card with big, simple instructions
✓ User clicks "Start Task"
✓ Task runs with countdown timer
✓ System provides visual/audio feedback
✓ Calculates score and gives encouraging message
✓ Moves to next task
```

### Step 3: Daily Summary
```
✓ Shows completion rate (e.g., 80% complete)
✓ Displays streak count (days in a row) 🔥
✓ Shows average score over time
✓ Lists all tasks with individual scores
✓ Provides encouraging daily message
```

---

## Scoring System

### How Scores Work

Each task gets a **0-100 score** based on performance:

- **Finger Tapping**: 50 + (tap count ÷ 2) = score
  - More taps = higher score
  - Example: 80 taps → 50 + 40 = 90 score

- **Other Tasks**: Base score of 75-85, adjusted up/down based on quality
  - Better performance = higher score
  - Effort counts even if score is lower

### Feedback Tiers

| Score | Feedback |
|-------|----------|
| 85-100 | "Excellent work! Keep it up!" 🌟 |
| 60-84 | "Good effort! You're doing great!" ✅ |
| <60 | "Nice try! Every bit helps!" 💪 |

### Tracking Progress

System tracks:
- **Daily Streak**: Days in a row completed (builds motivation)
- **Average Score**: Historical average (shows trends)
- **Completion Rate**: % of tasks done today

---

## Data Storage

### Where Does Data Go?

All data stored **locally on your device** (not sent anywhere):
- Today's task list
- Completion history
- Scores and timestamps
- Performance metrics

### Why Local Storage?

✅ **Privacy**: Your data stays with you
✅ **Offline**: Works without internet
✅ **Control**: You decide what happens with it
✅ **Export**: Can share with healthcare provider anytime

---

## Accessibility Features

### Voice-First Design
- ✅ All instructions spoken aloud
- ✅ Audio feedback on completion
- ✅ Encouraging voice messages
- ✅ No reading required

### Simple Touch Interface
- ✅ Large buttons (easy to tap)
- ✅ Minimal text (less cognitive load)
- ✅ High contrast colors (easy to see)
- ✅ Smooth, calm animations (not jarring)

### Inclusive for Everyone
- ✅ No keyboard needed
- ✅ No mouse required
- ✅ Voice guidance in background
- ✅ Works on phones and tablets

---

## Example: Daily Wellness Journey

### Monday: Starting Fresh
```
System: "Welcome! Today you have 4 tasks."
User: Completes Voice Sustain (82 score)
User: Completes Finger Tapping (88 score)
User: Skips Hand Stability
User: Completes Facial Expression (85 score)

Results: 75% complete, 85% average score ✅
```

### Week Later: Noticing Patterns
```
Mon: 80% complete, 85 avg score ✅
Tue: 75% complete, 82 avg score ⚠️
Wed: 75% complete, 78 avg score ⚠️ (slight decline)
Thu: 80% complete, 80 avg score 📈 (recovered)
Fri: 100% complete, 87 avg score 🌟 (best day!)

Observation: Scores drop mid-week (maybe fatigue?)
→ Talk to doctor about this pattern
```

### After One Month
```
Day Streak: 23 days 🔥
Average Score: 83%
Best Day: Friday (87%)
Most Consistent: Finger Tapping (85% avg)
Needs Work: Hand Stability (72% avg)

Progress: "You're doing great! Consistent effort!"
```

---

## How Tasks Help Doctors

When you share your data with your healthcare provider, they can:

1. **Track Real Changes**: See objective measurements over time
2. **Adjust Treatments**: Know if medications are working
3. **Predict Patterns**: Identify when symptoms worsen
4. **Celebrate Wins**: Recognize your dedication to wellness
5. **Plan Better**: Make informed decisions about care

---

## Safety & Wellness Reminders

### ✅ This IS Good For:
- Daily wellness monitoring
- Building healthy habits
- Noticing personal trends
- Tracking your wellness journey
- Creating data to discuss with doctor

### ❌ This Is NOT:
- Medical diagnosis
- Clinical assessment tool
- Treatment recommendation
- Replacement for healthcare
- Medical emergency service

### Important:
**Always consult your healthcare provider** if:
- Scores drop significantly
- You notice new symptoms
- You have concerning changes
- You need medical advice

---

## Quick Customization

Want to change something? Easy!

### Make Tasks Longer
Change duration in component settings (default: 10 seconds)

### Add Your Own Task
Add to task templates with your exercise and instructions

### Change Difficulty
Adjust scoring thresholds or task selection logic

### Modify Feedback
Update encouraging messages for your preferences

See [DAILY_TASKS_GUIDE.md](DAILY_TASKS_GUIDE.md) for detailed instructions.

---

## Key Metrics Explained

### Daily Streak 🔥
- **What**: Consecutive days of completing tasks
- **Why**: Motivation and consistency tracking
- **Goal**: Build longer streaks for healthier habits
- **Resets**: If you miss a day (but you can start fresh!)

### Average Score
- **What**: Mean of all task scores over time
- **Why**: Shows overall trend (improving? declining? stable?)
- **Goal**: Maintain or improve baseline
- **Use**: Discuss with healthcare provider for medication tuning

### Completion Rate
- **What**: % of today's tasks you finished
- **Why**: Shows effort and engagement
- **Goal**: 100% (but 75%+ is still great!)
- **Flexibility**: Can skip tasks if needed (no judgment)

---

## Non-Medical Purpose

This is a **wellness support tool**, not a medical device:

✅ **Wellness Support**
- Daily check-in with yourself
- Building healthy habits
- Self-awareness about changes

❌ **NOT Medical Diagnosis**
- Cannot diagnose Parkinson's
- Cannot confirm disease progression
- Cannot recommend treatment changes

**Remember**: Use this as a tool to help discussions with your healthcare provider, not as a replacement for professional medical advice.

---

## Quick Links

- **Component File**: [daily-tasks.tsx](client/src/pages/daily-tasks.tsx)
- **Full Guide**: [DAILY_TASKS_GUIDE.md](DAILY_TASKS_GUIDE.md)
- **Access**: `http://localhost:5000/daily-tasks`
- **Home Page**: Link under "Daily Wellness Tasks" section

---

**Status**: ✅ Production Ready | Fully Accessible | Voice-Guided
**Updated**: January 12, 2026

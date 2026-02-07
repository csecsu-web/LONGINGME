# A Quiet Space

A privacy-first, anonymous mental health support platform for people in the "in-between" stage—when something is wrong, but they're not ready for therapy, diagnosis, or labels.

## Philosophy

This is **not** a healing platform. It is **not** therapy. It is **not** social media.

This is a quiet room where people can:
- Acknowledge thoughts they cannot say out loud
- Feel understood without being seen
- Exist without pressure to fix, perform, or explain

## Core Principles

### Privacy First
- No accounts, emails, or usernames
- Complete anonymity via Firebase anonymous auth
- No IP logging, location tracking, or device fingerprinting
- No data sold, shared, or monetized

### Anti-Social
- No likes, comments, follows, or DMs
- No profiles, popularity metrics, or rankings
- No infinite scrolling or addictive patterns
- No gamification or engagement optimization

### Safety Without Shame
- Automatic filtering of harmful instructions
- Crisis resources shown when needed
- No deletion or punishment for struggling
- Protective, not punitive

### Minimalist by Design
- Soft, neutral color palette
- Generous whitespace
- Slow, intentional interactions
- No bright colors, emojis, or notifications

## Features

### 1. Anonymous Entry
Users enter without creating an account. Firebase handles anonymous authentication silently.

### 2. Emotional State Selection
Optional, non-diagnostic state selection:
- "I feel out of control"
- "I feel empty"
- "I'm scared to let go"
- "I don't feel real"
- "I'm overwhelmed"
- "I don't know what's wrong"

### 3. Fragment Submission
Users can submit short anonymous text fragments (max 500 characters):
- Single sentences
- Unfinished thoughts
- Contradictions
- Feelings without explanation

After submission: "Someone will read this."

### 4. Reading Without Interaction
Users can read others' fragments with:
- No reply option
- No reactions
- No timestamps
- Random/gentle curation
- No popularity sorting

### 5. Gentle Mirroring
System-written reflective statements (not advice):
- "Sometimes control shows up when safety was missing."
- "You can want something to stop and still be afraid of losing it."
- "Not being ready doesn't mean you're failing."

### 6. Safety & Moderation
Automated safeguards that:
- Block content encouraging self-harm
- Filter explicit instructions or numbers
- Detect crisis-level language
- Show crisis resources when needed

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Firebase (Firestore, Anonymous Auth)
- **Hosting**: GitHub Pages
- **Cost**: Entirely free tier

## Setup

See [SETUP.md](SETUP.md) for complete deployment instructions.

Quick start:
1. Create Firebase project
2. Enable anonymous auth
3. Deploy Firestore rules
4. Update `config.js` with your Firebase credentials
5. Deploy to GitHub Pages

## File Structure

```
quiet-space/
├── index.html          # Main HTML structure
├── styles.css          # Minimalist styling
├── app.js             # Application logic
├── config.js          # Firebase configuration (update with your credentials)
├── firestore.rules    # Firestore security rules
├── firestore.indexes.json  # Firestore indexes
├── SETUP.md           # Deployment guide
└── README.md          # This file
```

## Safety Features

### Content Filtering
Blocks content containing:
- Numbers + self-harm terms (e.g., "10 pills")
- Numbers + body metrics (e.g., "90 lbs")
- Explicit instructions for harm
- Detailed methods

### Crisis Detection
Detects phrases like:
- "want to die"
- "suicide plan"
- "can't live anymore"

When detected, shows:
- 988 Suicide & Crisis Lifeline
- Crisis Text Line
- International resources

### Database Security
Firestore rules ensure:
- Only non-flagged content is readable
- Users can only create, not update/delete
- Fragment length limits enforced
- User ID validation

## Usage Limits (Free Tier)

Firebase Spark plan provides:
- 50,000 reads/day (~25,000 fragment views)
- 20,000 writes/day (~2,000 submissions)
- 1 GB storage (hundreds of thousands of fragments)

Sufficient for small-to-medium communities.

## Future Considerations (Not Implemented)

The architecture supports future additions:
- Optional donation links
- Private personal journaling
- Long-form reflections
- Institutional partnerships (schools, nonprofits)

**However**: Do not implement these now. The MVP must prove the core concept first.

## What This Is NOT

- ❌ Therapy or medical advice
- ❌ Crisis intervention service
- ❌ Social network
- ❌ Self-help platform
- ❌ Recovery program
- ❌ Diagnostic tool
- ❌ Monetization opportunity

## What This IS

- ✅ A quiet acknowledgment space
- ✅ Anonymous and private
- ✅ Non-judgmental
- ✅ Emotionally neutral
- ✅ Safe within limits
- ✅ Free and ad-free

## Ethical Commitment

This project prioritizes:
1. **User safety** over engagement
2. **Privacy** over data collection
3. **Minimalism** over feature creep
4. **Dignity** over metrics
5. **Honesty** about limitations

We acknowledge:
- This cannot replace professional help
- This cannot prevent all harm
- This cannot heal or fix
- This is a middle space, not a solution

## License

MIT License - See LICENSE file for details

This is a free, open-source project. No commercial use. No data harvesting. Built with care for those who need a quiet space.

## Contact

For issues or suggestions, please open a GitHub issue. This is a community project maintained with respect for its users' anonymity and dignity.

## Acknowledgments

Built for those in the in-between. For those who know something is wrong but aren't ready for what comes next. For those who need to be heard without being seen.

You are not alone in the quiet.

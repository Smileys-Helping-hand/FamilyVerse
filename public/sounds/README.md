# Audio Assets for Party OS

Place the following MP3 files in this directory:

- **cash-register.mp3** - Plays when placing a bet (betting overlay)
- **success.mp3** - Plays when completing a task (task completion)

## Recommended Sources for Free Sound Effects:

1. **Freesound.org** - Free sound effects library
2. **Zapsplat.com** - Free sound effects for commercial use
3. **Mixkit.co/free-sound-effects** - High-quality free sounds

## Audio Format Requirements:

- Format: MP3
- Sample Rate: 44.1kHz recommended
- Bit Rate: 128kbps or higher
- Duration: 1-3 seconds for UI effects

## Quick Setup:

```bash
# Download free cash register sound effect
# Save as: cash-register.mp3

# Download free success/chime sound
# Save as: success.mp3
```

## Browser Audio Context Initialization:

Audio playback in browsers requires user interaction to initialize. The app handles this automatically on first button click (Join Party, Login, etc.).

---

## 🕵️ SPY GAME SOUNDS (NEW - REQUIRED)

### alarm.mp3
**Purpose:** 10-minute warning alert for spy game rounds  
**Duration:** 3-5 seconds  
**Tone:** Urgent but not jarring  
**Download:** https://pixabay.com/sound-effects/search/alarm/

### emergency.mp3  
**Purpose:** Emergency meeting announcement
**Duration:** 3-5 seconds
**Tone:** Very urgent, dramatic
**Download:** https://pixabay.com/sound-effects/search/emergency/

### Quick Creation with Text-to-Speech (macOS):
```bash
say "Warning! Ten minutes remaining!" -o alarm.aiff
say "Emergency Meeting!" -o emergency.aiff

# Convert to MP3:
ffmpeg -i alarm.aiff alarm.mp3
ffmpeg -i emergency.aiff emergency.mp3
```

**Note:** Visual alerts will still work without audio files!

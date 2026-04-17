# Audio Files

## Background Music

The game expects a background music file at:
- **Path**: `data/gameplay-music.mp3`
- **Type**: MP3 audio file
- **Style**: 1980s retro arcade game music
- **Loop**: Should be seamless (plays on loop during gameplay)
- **Recommended length**: 30-60 seconds

## Where to find retro game music

**Free options:**
1. **OpenGameArt.org** - Search for "8-bit music" or "chiptune"
2. **FreeMusicArchive.org** - Filter by "Video Game" genre
3. **Incompetech.com** - "8-bit" category (attribution required)
4. **Zapsplat.com** - Free with attribution

**Creating your own:**
- Use online chiptune creators like Beepbox.co
- Use DAW software with 8-bit/chiptune plugins

## Placeholder

Until you add music, the game will attempt to play `/gameplay-music.mp3`. If the file doesn't exist, gameplay continues silently (the browser will log a 404 error in the console, which is safe to ignore).

## Adding the file

Simply place your MP3 file in this directory (`data/`) and name it `gameplay-music.mp3`. The dev server will pick it up automatically.

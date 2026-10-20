# Roadmap: Chapter One → full release (15–20 hours)

Chapter One is a vertical slice of every core system with about 1.5–3 hours of content. Later chapters mostly add **data** (rooms, dialogue, clues), so scale comes from content, not engine rewrites.

## Chapters

| # | Title | Phase | New spaces | Est. hours |
|---|---|---|---|---|
| 1 | Homeroom ✅ | 1–3 | 19 rooms: main building, archive, Lost & Found, Stillwell | 2–3 |
| 2 | Extracurricular | 3 | 3F, clock tower, music wing, teachers' lounge, rival investigation | 3–4 |
| 3 | The East Wing | 3–4 | Erased wing (40+ rooms) that rebuilds a little every loop | 4–5 |
| 4 | Endless Hallways | 4 | Memory rooms: each character's grief becomes a dungeon-like space | 4–5 |
| 5 | Final Assembly | 5 | Under the Stillwell, the auditorium, October 14 | 2–3 |

## Room atlas target (200+)

| Area | Rooms | Notes |
|---|---|---|
| Main building 1F–3F | 45 | classrooms, offices, closets, bathrooms, stairwells |
| Grounds | 15 | courtyard, field, parking lot, greenhouse, bus loop, fog edge |
| East Wing (erased) | 40 | assembled from pieces: rooms reappear in a different order each loop |
| Clock tower | 8 | vertical puzzle tower; time-of-day puzzles |
| Archive depths | 20 | stacks that rearrange; Vell's domain |
| Lost & Found realm | 15 | rooms made of unclaimed things |
| Memory rooms | 40 | 8 characters × 5 rooms each |
| Beneath the Stillwell | 15 | the endgame |
| Secret rooms | 10+ | rare events, one-loop-only doors |

## Systems to add (engine)

1. **Mood combat, "Recess Duels":** confrontations with anomalies and stubborn teachers in a bullet-box arena. Instead of HP you protect your *composure*. Each turn you pick a stance (Listen / Argue / Joke / Comfort) and survive a timing pattern built from the opponent's fears. Winning means understanding them, so many fights end with no one hurt. Planned for Chapter 2, with an "assist mode" toggle in Accessibility.
2. **Rare events table:** `data/events.js` with weighted, condition-gated events per room and time (e.g., loop ≥ 3, 1:13 PM, library, 5% chance: a book falls open to a page about you).
3. **Notebook map** drawn from room graph data instead of the text list.
4. **Loop memory UI:** a "what changed this loop" diff on waking.
5. **Localization:** move all strings into `data/lang/en.js`.
6. **Packaging:** Electron or Tauri desktop build, Capacitor Android build (Play Store), GitHub Pages web build.

## Soundtrack concepts (one per major area)

All themes are variations of the C-E-G-E **Bell Motif**.

| Theme | Area | Concept |
|---|---|---|
| Thursday (Music Box) ✅ | Title | Music-box waltz that never fully resolves |
| Homeroom Hum ✅ | Classrooms | Bright square-wave melody, slightly too cheerful |
| Corridor Count ✅ | Halls | Walking bass; footsteps you can count |
| Ink & Hush ✅ | Library | Slow triangle arpeggios |
| Golden Hour Dismissal ✅ | After school | Warm minor key; the day is ending, again |
| Courtyard Weather ✅ | Grounds | Breezy; the same cloud |
| After Hours ✅ | Night | The Homeroom melody in minor |
| Between E and G ✅ | 2-F, anomalies | Whole-tone, unresolved |
| The Stillwell ✅ | Below | Drone; a melody from far away |
| Erased Wing | East Wing | The hall theme with notes missing, each loop restores one |
| Clockwork Stairwell | Clock tower | Polyrhythm 3 against 4 |
| Recess Duel | Combat | Driving 7/8 chiptune; each opponent adds an instrument |
| Bellwether Hymn | Society scenes | Organ-like square chords |
| Final Assembly | Endgame | Every theme stacked; the bell motif finally resolves |

## Achievements and secrets backlog

Pacifist recess duels, saving every kept person, reading every lore book, 100 loops, a loop where you speak to no one, Pip's ghost, the eclipse ending, an extra-short speedrun ending.

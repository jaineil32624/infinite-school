# Content Guide

Most of the game is data. You can add rooms, people, clues and dialogue without touching the engine. Run `node tools/validate.js` after every change.

## Tile legend (`data/rooms.js`)

| Char | Tile | Solid | | Char | Tile | Solid |
|---|---|---|---|---|---|---|
| `#` | wall | ✔ | | `.` | floor (theme) | |
| `K` | chalkboard wall | ✔ | | `,` | carpet | |
| `W` | window wall | ✔ | | `:` | checker tile | |
| `E` | wall that can become a door (`dyn`) | ✔ | | `d` | doorway | |
| `L` | lockers | ✔ | | `S` | stairs | |
| `D` | desk | ✔ | | `C` | chair | |
| `T` | table | ✔ | | `g` | flowerbed | |
| `B` | bookshelf | ✔ | | `p` | stone path | |
| `P` | plant | ✔ | | `m` | gym mat | |
| `=` | counter | ✔ | | `~` | anomaly shimmer floor | |
| `h` | lab bench | ✔ | | `G` | open gate | |
| `q` | sink | ✔ | | `w` | still water | ✔ |
| `o` | easel | ✔ | | `x` | crate / cabinet | ✔ |
| `v` | vending machine | ✔ | | `b` | bench | ✔ |
| `F` | fence | ✔ | | `Y` | tree | ✔ |
| `r` | roof railing | ✔ | | `X` | void | ✔ |

Themes: `school library cafe gym lobby office outdoor roof anomaly sub`.

## A room

```js
R.music_room = {
  name: 'Music Room', floor: '2F', theme: 'school', music: 'homeroom', spawn: [5, 6],
  map: ['########', '#......#', '########'],
  exits: [{ x: 3, y: 2, to: 'hall2f', tx: 4, ty: 2, dir: 0, if: { flag: 'x' }, lock: ['Locked.'] }],
  obj: [{ x: 2, y: 1, d: [{ id: 'piano', hint: true, lines: ['A piano.'], do: { clue: 'c_piano' } }] }],
  npcs: [{ id: 'felix', x: 3, y: 1, if: { phase: 3 } }],      // room-local characters
  enter: [{ scene: 'music_intro', onceEver: true }],         // runs on entering
  triggers: [{ x: 1, y: 1, w: 2, h: 1, scene: 'step_here' }], // runs when stepped on
  dyn: [{ x: 3, y: 0, t: 'd', if: { flag: 'open' } }]        // tiles that change
};
```

## Dialogue entries

A list of entries; the **first** whose conditions pass is used.

```js
{ id: 'mira_lunch', once: true, if: { time: [720, 780], bond: { mira: 1 } },
  lines: ['@mira Hi {name}!', 'Narration has no @speaker.'],
  choices: [{ t: 'Sit down', lines: ['@mira Nice.'], do: { bond: { mira: 1 } }, goto: 'some_scene' }],
  do: { clue: 'c_x' } }
```

- `once`: once per loop. `onceEver`: once per save. `pool: [[...], [...]]`: random lines, reshuffled each loop.
- Speakers: any NPC id, `you`, or an entry in `D.speakers`.

### Conditions (`if`)

`flag`, `not`, `any`, `loop: [min, max]`, `time: [from, to)`, `phase`, `maxPhase`, `room`, `bond: {npc: n}`, `insight: {npc: n}`, `n: {counter: n}`, `clue`, `noclue`, `clues: count`, `item`, `noitem`, `visited`, `allRooms`, `chance` (+ `seed`), `or: [cond, ...]`.

### Effects (`do`)

`set`, `unset`, `inc`, `clue`, `bond`, `item`, `take`, `time`, `timeTo`, `nextBell`, `phase`, `ach`, `sfx`, `shake`, `glitch`, `warp: [room, x, y, dir]`, `ending`, `endDay`, `card: {big, small}`, `toast`, `music`.

**Flags starting with `L.` reset at midnight.** Everything else is permanent. That is the core design rule: knowledge persists, circumstances do not.

## Clues and deductions

Add clues to `D.clues`, then a deduction with every pair of clues that should reveal it. Deductions are how chapters gate progress, so give each one 2–4 valid pairs to reduce frustration.

## Schedules

`sched: [[startMinute, room, x, y, facing, { if, vary, wander }]]`. Minutes are from midnight (465 = 7:45 AM). `vary` picks one location per loop, which makes each loop feel different.

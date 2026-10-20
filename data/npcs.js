// Characters. sched: [startMinute, room, x, y, facing, {if, vary, wander}]
// A null room means "gone home". notes: profile lines that appear in the
// notebook as you learn more (each gated by a condition).
(function (D) {
  D.npcs = {
    mira: {
      name: 'Mira Okafor', short: 'Mira', role: 'Class President, 2-B', voice: 560,
      look: { skin: '#8a5a3c', hair: '#1c1418', hs: 'bun', top: '#2b3a67', bot: '#33334a', acc: 'ribbon', accC: '#c8323c' },
      sched: [[465, 'c2b', 15, 8, 2], [480, 'c2b', 11, 4, 1], [720, 'cafe', 12, 5, 0], [780, 'c2b', 11, 4, 1],
        [900, 'library', 6, 8, 1, { vary: [['library', 6, 8], ['art', 13, 8], ['courtyard', 7, 9]] }],
        [1080, 'rooftop', 11, 3, 0, { if: { bond: { mira: 2 } } }], [1320, null]],
      notes: [
        { text: 'Your seatmate for two years. Runs the student council, the yearbook and, apparently, your life.' },
        { if: { insight: { mira: 2 } }, text: 'She is giving the speech at the Final Assembly. She says it is "basically done."' },
        { if: { clue: 'c_speech' }, text: 'She has written that speech 213 times. Every draft is dated today.' },
        { if: { insight: { mira: 3 } }, text: 'Goes to the roof in the evening "to look at the lights hold still."' },
        { if: { phase: 2 }, text: 'Does not remember any loop. Or says she does not.' }
      ]
    },
    theo: {
      name: 'Theo Vance', short: 'Theo', role: 'A/V Club, Conspiracy Department', voice: 700,
      look: { skin: '#e8c09a', hair: '#7a4a22', hs: 'cap', top: '#d9782e', bot: '#3a4458', accC: '#2f6a8c' },
      absentIf: { flag: 'L.theo_missing' }, awareIf: { flag: 'theo_saved' },
      sched: [[465, 'c2b', 5, 6, 1], [720, 'av', 6, 2, 1], [780, 'c2b', 5, 6, 1], [900, 'av', 6, 2, 1], [1140, 'courtyard', 18, 9, 0], [1260, null]],
      notes: [
        { text: 'Runs the A/V closet, which he calls the Truth Closet. Has a theory about everything.' },
        { if: { clue: 'c_theo_wall' }, text: 'Obsessed with a 1977 fire drill where the head count came up one short.' },
        { if: { flag: 'L.theo_missing' }, text: 'Gone. Nobody remembers him.' },
        { if: { flag: 'theo_saved' }, text: 'You pulled him out of the Lost & Found. Now he remembers every loop too.' }
      ]
    },
    june: {
      name: 'June Sato', short: 'June', role: 'Art Club', voice: 480,
      look: { skin: '#f0cfa8', hair: '#151018', hs: 'long', top: '#6a8a6a', bot: '#2f2f3a', acc: 'apron', accC: '#e6dcc4' },
      sched: [[465, 'art', 8, 3, 2], [1200, null]],
      notes: [
        { text: 'Quiet. Speaks in fragments. Always in the art room.' },
        { if: { clue: 'c_drawing' }, text: 'Keeps drawing a door labelled 2-F without knowing why.' },
        { if: { flag: 'd.2f' }, text: 'Her drawings were right. There was a room 2-F.' }
      ]
    },
    grey: {
      name: 'Mr. Aldous Grey', short: 'Mr. Grey', role: 'History Teacher', voice: 300, aware: true,
      look: { skin: '#e2c2a2', hair: '#b8b4ae', hs: 'bald', top: '#7a6248', bot: '#4a4038', acc: 'tie', accC: '#5a2a2a', acc2: 'glasses' },
      sched: [[465, 'history', 10, 1, 0], [1140, 'lobby', 13, 7, 0], [1260, 'history', 10, 1, 0]],
      notes: [
        { text: 'Teaches history. Seems to know the lesson plan by heart. Maybe too well.' },
        { if: { flag: 'grey_confided' }, text: 'Has lived this Thursday since 1977. Has stopped counting the loops.' },
        { if: { flag: 'k.grey_felix' }, text: 'Was the teacher doing the head count during the 1977 fire drill. Still blames himself.' },
        { if: { flag: 'felix_delivered' }, text: 'Knows now that Felix was only hiding.' }
      ]
    },
    marrow: {
      name: 'Ms. Celeste Marrow', short: 'Ms. Marrow', role: 'Chemistry Teacher', voice: 420,
      look: { skin: '#f2d4c0', hair: '#b4442c', hs: 'long', top: '#e9edf0', bot: '#30303c', acc: 'coat' },
      sched: [[465, 'chem', 10, 1, 0], [1200, 'office', 9, 5, 2, { if: { phase: 2, noclue: 'c_meeting' } }], [1320, null]],
      notes: [
        { text: 'Strict about goggles. Strict about everything.' },
        { if: { clue: 'c_meeting' }, text: 'Meets with the principal after hours. Part of something called the Bellwether.' },
        { if: { flag: 'k.marrow_truth' }, text: 'Keeps the loop going because in it, her cat Pip is still alive.' }
      ]
    },
    coach: {
      name: 'Coach Ray Dunmore', short: 'Coach', role: 'P.E. Teacher', voice: 360,
      look: { skin: '#c88a5e', hair: '#2a2420', hs: 'short', top: '#2f7a4a', bot: '#2f7a4a', acc: 'whistle' },
      sched: [[465, 'gym', 6, 4, 0], [720, 'cafe', 3, 5, 0], [780, 'gym', 6, 4, 0], [1080, null]],
      notes: [
        { text: 'Loud, cheerful, tells one joke.' },
        { if: { clue: 'c_joke' }, text: 'Tells the same joke every loop and believes it is brand new.' },
        { if: { flag: 'k.coach_pain' }, text: 'Gets headaches whenever something new happens. Like the building is flinching.' }
      ]
    },
    vell: {
      name: 'Mrs. Ines Vell', short: 'Mrs. Vell', role: 'Librarian', voice: 380, aware: true,
      look: { skin: '#e8d8cc', hair: '#e8e4ec', hs: 'bun', top: '#6a4a8a', bot: '#3a2a4a', acc2: 'glasses' },
      sched: [[0, 'library', 10, 8, 0]],
      notes: [
        { text: 'The librarian. Never seems to leave the library.' },
        { if: { clue: 'c_welcome' }, text: 'Greeted you like an old regular. She remembers. Somehow.' },
        { if: { flag: 'archive_hint' }, text: '"I am the library, dear. Or what it became after reading itself too many times."' }
      ]
    },
    okon: {
      name: 'Okon', short: 'Okon', role: 'Custodian', voice: 260,
      look: { skin: '#5a3a28', hair: '#2a2a2a', hs: 'cap', top: '#3a5a7a', bot: '#3a5a7a', accC: '#2a3a4a' },
      sched: [[465, 'lobby', 13, 6, 0, { wander: 1 }], [720, 'hall1f', 12, 3, 0, { wander: 1 }], [900, 'hall2f', 18, 3, 0, { wander: 1 }], [1080, 'hall1f', 24, 3, 0, { wander: 1 }], [1320, null]],
      notes: [
        { text: 'The janitor. Hums constantly. Says very little.' },
        { if: { clue: 'c_okon' }, text: 'Carries a brass key tagged STILLWELL.' },
        { if: { flag: 'open_basement' }, text: 'Opened the way under the school for you. "Don\'t drink the water."' }
      ]
    },
    hask: {
      name: 'Principal Hask', short: 'Hask', role: 'Principal', voice: 220, aware: true,
      look: { skin: '#d8d4cc', hair: '#141218', hs: 'short', top: '#1c1a22', bot: '#1c1a22', acc: 'tie', accC: '#3a3446' },
      sched: [[465, 'office', 7, 2, 0], [1200, 'office', 6, 5, 3, { if: { phase: 2, noclue: 'c_meeting' } }], [1320, 'office', 7, 2, 0], [1380, 'courtyard', 12, 10, 1]],
      notes: [
        { text: 'The principal. Formal. Precise. Unsettling.' },
        { if: { clue: 'c_hask' }, text: 'Does not blink. Does not seem to breathe.' },
        { if: { clue: 'c_meeting' }, text: 'Leads the Bellwether. Wants the student who remembers to "be encouraged to forget."' }
      ]
    },
    felix: {
      name: 'Felix Bram', short: 'Felix', role: 'Class 2-F, 1977', voice: 640, aware: true, ghost: true,
      look: { skin: '#e8d0b0', hair: '#6a4a2a', hs: 'short', top: '#8a7a4a', bot: '#5a5040', acc: 'tie', accC: '#4a5a3a' },
      sched: [],
      notes: [
        { text: 'A boy from 1977, waiting in Room 2-F for a head count.' },
        { if: { insight: { felix: 2 } }, text: 'Wants to be an astronomer. Does not want to miss the eclipse "tomorrow."' },
        { if: { flag: 'felix_message' }, text: 'He was hiding in the supply closet during the drill. He meant to jump out and scare Mr. Grey.' }
      ]
    },
    priya: {
      name: 'Priya Nair', short: 'Priya', role: 'Debate Team', voice: 600, profile: true,
      look: { skin: '#b07a52', hair: '#1a1214', hs: 'long', top: '#8a2a4a', bot: '#2a2a3a' },
      sched: [[465, 'hall2f', 12, 3, 0, { wander: 1 }], [720, 'cafe', 19, 8, 2], [780, 'hall2f', 12, 3, 0, { wander: 1 }], [1020, null]],
      notes: [{ text: 'Debate captain. Will argue with a wall. Has argued with this wall.' }]
    },
    dex: {
      name: 'Dex Moreau', short: 'Dex', role: 'Skater, Allegedly', voice: 520,
      look: { skin: '#d4a07a', hair: '#e0c050', hs: 'spiky', top: '#4a4a4a', bot: '#2a3a6a' },
      sched: [[465, 'lobby', 6, 6, 3], [900, 'courtyard', 8, 10, 0, { wander: 1 }], [1140, null]],
      notes: [{ text: 'Tries to kickflip over things. Mostly fails. Very positive about it.' }]
    },
    ama: {
      name: 'Ama Boateng', short: 'Ama', role: 'Professional Gossip', voice: 660,
      look: { skin: '#5e3a26', hair: '#1a1214', hs: 'bun', top: '#c9a24a', bot: '#3a2a2a' },
      sched: [[465, 'c2b', 7, 4, 1], [720, 'cafe', 20, 4, 1], [780, 'c2b', 7, 4, 1], [900, null]],
      notes: [{ text: 'Knows everything about everyone. Except, it turns out, the important things.' }]
    }
  };

  // Voices that are not people
  D.speakers = {
    well: { name: 'The Stillwell', portrait: 'orb', voice: 140 },
    pa: { name: 'Intercom', voice: 300 }
  };
})(window.IS.data);

// Rooms. Maps are ASCII; see docs/CONTENT_GUIDE.md for the tile legend.
// exits: step on (x,y) to travel. obj: inspectable things (dialogue lists).
// dyn: tiles that change when a condition becomes true.
(function (D) {
  const R = D.rooms;
  const say = (...lines) => ({ lines });

  R.c2b = {
    name: 'Classroom 2-B', floor: '2F', theme: 'school', music: 'homeroom', duskMusic: 'twilight', spawn: [13, 8],
    map: [
      '##WW##KKKKKKK##WW###',
      '#.......TT.........#',
      '#..................#',
      '#..D.D.D.D.D.D.....#',
      '#..C.C.C.C.C.C.....#',
      '#..D.D.D.D.D.D.....#',
      '#..C.C.C.C.C.C.....#',
      '#..D.D.D.D.D.D.....#',
      '#..C.C.C.C.C.C...P.#',
      '#..................#',
      '########dd##########'
    ],
    exits: [{ x: 8, y: 10, to: 'hall2f', tx: 10, ty: 2, dir: 0 }, { x: 9, y: 10, to: 'hall2f', tx: 10, ty: 2, dir: 0 }],
    obj: [
      { x: 6, y: 0, w: 7, d: [
        { id: 'board_bell', hint: true, if: { loop: [2], time: [900, 1440] }, lines: ['Chalk, in handwriting you know better than anyone\'s.', 'Yours.', '"DON\'T TRUST THE BELL."', 'You have no memory of writing it. The chalk dust is still fresh.'], do: { clue: 'c_bell', glitch: 0.5 } },
        { id: 'board_day', lines: ['"THURSDAY, OCT. 13 — LAST FULL DAY! Final Assembly tomorrow, 9 AM. Bring tissues. —Mira"', 'Someone has drawn a small frowning clock next to it.'] }
      ] },
      { x: 3, y: 7, d: [{ id: 'desk_fb', hint: true, lines: ['The desk at the back that nobody sits at.', 'Carved deep into the wood: "F.B. WAS HERE."', 'Under it, newer, sharper: "F.B. IS STILL HERE."'], do: { clue: 'c_desk' } }] },
      { x: 13, y: 7, d: [{ id: 'mydesk', lines: ['Your desk. There is a perfect circle of dried drool on it.', 'You have apparently slept here a lot.'] }] },
      { x: 8, y: 1, w: 2, d: [say('The teacher\'s desk. A seating chart: twenty-two names. One square is empty, outlined in pencil so many times the paper is shiny.')] },
      { x: 17, y: 8, d: [say('A potted fern. It has not grown a single leaf since you started here.', 'Neither has anything else.')] },
      { x: 2, y: 0, w: 2, d: [say('Outside, the same cloud is drifting past the same tree.')] },
      { x: 15, y: 0, w: 2, d: [say('From the window you can see the front gate. The street beyond it is lost in fog.')] }
    ]
  };

  R.hall2f = {
    name: 'Second Floor Hall', floor: '2F', theme: 'school', music: 'hall', duskMusic: 'twilight', spawn: [10, 2],
    map: [
      '####d#####d#####d#####E#####d###',
      '#LLL.LLLLL.LLLLL.LLLLL.LLLLL.LL#',
      '#.............................S#',
      '#.............................S#',
      '#.........................P...S#',
      '#L.LLLLLLLLLLLLLLLLL.LLLLLLLLLL#',
      '##d#################d###########'
    ],
    dyn: [{ x: 22, y: 0, t: 'd', if: { flag: 'd.2f' } }],
    exits: [
      { x: 4, y: 0, if: { flag: 'never' }, lock: ['Room 2-A. Locked.', 'A sign: "FIELD TRIP — BACK THURSDAY."'] },
      { x: 10, y: 0, to: 'c2b', tx: 8, ty: 9, dir: 1 },
      { x: 16, y: 0, to: 'art', tx: 9, ty: 9, dir: 1 },
      { x: 22, y: 0, to: 'c2f', tx: 8, ty: 9, dir: 1, if: { flag: 'd.2f' } },
      { x: 28, y: 0, to: 'history', tx: 9, ty: 9, dir: 1 },
      { x: 2, y: 6, to: 'rooftop', tx: 9, ty: 1, dir: 0 },
      { x: 20, y: 6, to: 'av', tx: 2, ty: 1, dir: 0 },
      { x: 30, y: 2, to: 'hall1f', tx: 29, ty: 3, dir: 2 }, { x: 30, y: 3, to: 'hall1f', tx: 29, ty: 3, dir: 2 }, { x: 30, y: 4, to: 'hall1f', tx: 29, ty: 3, dir: 2 }
    ],
    obj: [
      { x: 22, y: 0, d: [
        { id: 'gap2f', hint: true, if: { not: 'd.2f' }, lines: ['Room 2-E. Then a stretch of blank wall. Then Room 2-G.', 'The paint here is a slightly newer shade of beige.', 'If you press your ear to it, you can hear a clock ticking.'], do: { clue: 'c_gap' } },
        { if: { not: 'd.2f' }, lines: ['Blank wall between 2-E and 2-G. Ticking.'] }
      ] },
      { x: 3, y: 1, d: [say('Your locker. Combination: the one you have known all year. Inside, a gym shirt and a note that says "remember."', 'You do not remember leaving it.')] },
      { x: 26, y: 4, d: [say('A tall plant. Someone has hung a hall pass on it like a Christmas ornament.')] },
      { x: 20, y: 5, d: [say('A door marked A/V. Somebody has taped a sign to it: "TRUTH CLOSET. KNOCK FIRST. THE TRUTH IS SHY."')] },
      { x: 2, y: 5, d: [say('A door with a hand-painted sign: ROOF — NO STUDENTS. Under it, smaller: "(but the view is nice)."')] }
    ]
  };

  R.art = {
    name: 'Art Room 2-E', floor: '2F', theme: 'school', music: 'homeroom', duskMusic: 'twilight', spawn: [9, 9],
    map: [
      '##WWW##KKK###WWW####',
      '#=====.........BBB.#',
      '#..................#',
      '#..o...o...o...o...#',
      '#..................#',
      '#..o...o...o...o...#',
      '#..................#',
      '#.....TTTT.........#',
      '#.....C..C.......P.#',
      '#..................#',
      '#########dd#########'
    ],
    exits: [{ x: 9, y: 10, to: 'hall2f', tx: 16, ty: 2, dir: 0 }, { x: 10, y: 10, to: 'hall2f', tx: 16, ty: 2, dir: 0 }],
    obj: [
      { x: 7, y: 3, d: 'june_easel' },
      { x: 3, y: 3, d: [{ id: 'art_clocks', hint: true, lines: ['A still life of a classroom wall full of clocks.', 'Every single clock in the painting reads 11:59.'] }] },
      { x: 11, y: 5, d: [{ id: 'art_wing', hint: true, lines: ['A painting of Halloway from above, like a bird would see it.', 'There is an extra wing on the east side, painted in flat grey, as if the artist was not allowed to look at it directly.'] }] },
      { x: 15, y: 3, d: [say('A self-portrait. The face has been painted over so many times it has become a smooth beige oval.')] },
      { x: 3, y: 5, d: [say('A watercolor of a heron standing in still water. The water is the only part painted with real care.')] },
      { x: 1, y: 1, w: 5, d: [say('Paint tubes. Every single one is squeezed exactly halfway.')] },
      { x: 15, y: 1, w: 3, d: [say('Shelves of drying clay. A row of identical clay cups, each signed "June."', 'There are hundreds.')] }
    ]
  };

  R.c2f = {
    name: 'Room 2-F', floor: '2F', theme: 'anomaly', music: 'anomaly', keepMusic: true, glitch: 0.12, secret: true, spawn: [8, 9],
    map: [
      '##WW##KKKKKKK##WW###',
      '#.......TT.........#',
      '#~.......~.........#',
      '#..D.D.D.D.D.D.....#',
      '#..C.C.C.C.C.C..~..#',
      '#..D.D.D.D.D.D.....#',
      '#..C.C.C.C.C.C.....#',
      '#..D.D.D.D.D.D...x.#',
      '#..C.C.C.C.C.C.....#',
      '#.......~..........#',
      '########dd##########'
    ],
    enter: [{ scene: 'enter2f', onceEver: true }],
    npcs: [{ id: 'felix', x: 13, y: 4, dir: 1 }],
    exits: [{ x: 8, y: 10, to: 'hall2f', tx: 22, ty: 2, dir: 0 }, { x: 9, y: 10, to: 'hall2f', tx: 22, ty: 2, dir: 0 }],
    obj: [
      { x: 6, y: 0, w: 7, d: [{ id: 'board2f', hint: true, lines: ['Chalk, perfectly preserved, as if it was written a minute ago:', '"FIRE DRILL — 2:15 PM. WAIT FOR HEAD COUNT."', 'In the corner: "Thursday, October 13th, 1977."'], do: { clue: 'c_room2f' } }] },
      { x: 4, y: 0, d: [say('A wall clock. 2:14 PM. The second hand trembles against the 12 and never gets past it.')] },
      { x: 17, y: 7, d: [
        { if: { flag: 'felix_message' }, lines: ['The supply closet. Inside the door frame, a tiny star is carved, and the initials F.B.', 'Small enough to hide in. Small enough to be missed in a head count.'] },
        { lines: ['A supply closet. Small enough to hide in. Someone carved a tiny star inside the door frame.'] }
      ] },
      { x: 3, y: 7, d: [say('A desk. Inside: a 1977 bus pass, a pencil sharpened down to a stub, and a note: "Meet at the oak after the drill!"')] },
      { x: 2, y: 0, w: 2, d: [say('Through the window: the same courtyard, but the oak is a sapling and the cars are boxy and brown.')] }
    ]
  };

  R.history = {
    name: 'History Room 2-G', floor: '2F', theme: 'school', music: 'homeroom', duskMusic: 'twilight', spawn: [9, 9],
    map: [
      '##WW##KKKKKKK##BB###',
      '#.......TT.......B.#',
      '#..................#',
      '#..D.D.D.D.D.D.....#',
      '#..C.C.C.C.C.C.....#',
      '#..D.D.D.D.D.D.....#',
      '#..C.C.C.C.C.C.....#',
      '#..................#',
      '#P......x.x.....P..#',
      '#..................#',
      '########dd##########'
    ],
    exits: [{ x: 8, y: 10, to: 'hall2f', tx: 28, ty: 2, dir: 0 }, { x: 9, y: 10, to: 'hall2f', tx: 28, ty: 2, dir: 0 }],
    obj: [
      { x: 8, y: 8, d: [{ id: 'display_found', hint: true, lines: ['A display case: "HALLOWAY ACADEMY, EST. 1921. Built upon the Stillwell Spring."', 'Inside lies a dried yellow flower. It is still bright. It has been in there since 1921.'], do: { clue: 'c_founding' } }] },
      { x: 10, y: 8, d: [say('Trophies: "Regional History Bowl Champions — 1975, 1976, 1977."', 'Then nothing. For almost fifty years.')] },
      { x: 6, y: 0, w: 7, d: [say('Today\'s lesson, underlined three times: "WHY DO EMPIRES REFUSE TO END?"')] },
      { x: 15, y: 0, w: 3, d: [say('History books. One spine reads "A History of Thursday." You decide not to open it.')] },
      { x: 17, y: 1, d: [say('A framed map of the town, 1977. The school is drawn with an east wing. The modern map beside it has none.')] }
    ]
  };

  R.rooftop = {
    name: 'Rooftop', floor: '2F', theme: 'roof', music: 'twilight', outdoor: true, spawn: [9, 1],
    map: [
      'rrrrrrrrrdrrrrrrrrrr',
      'r..................r',
      'r..b.......b.......r',
      'r..................r',
      'r.....xx...........r',
      'r..................r',
      'r.............P....r',
      'r..b...............r',
      'r..................r',
      'r..................r',
      'rrrrrrrrrrrrrrrrrrrr'
    ],
    exits: [{ x: 9, y: 0, to: 'hall2f', tx: 2, ty: 4, dir: 1 }],
    obj: [
      { x: 3, y: 2, d: 'sit_bench' }, { x: 11, y: 2, d: 'sit_bench' }, { x: 3, y: 7, d: 'sit_bench' },
      { x: 0, y: 1, h: 9, d: [
        { if: { phase: 2, time: [1320, 1440] }, lines: ['The sky has seams. Thin pale lines, like stitches pulled too tight.', 'Something on the other side is pulling.'], do: { glitch: 0.6 } },
        { lines: ['Past the railing, the town. Every window is lit exactly the way it was lit last night.'] }
      ] },
      { x: 19, y: 1, h: 9, d: [say('The east side of the roof. Below, where a wing of the building should connect, there is just a smooth wall and a lot of fog.')] },
      { x: 6, y: 4, w: 2, d: [say('An air-conditioning unit. Taped to it: a perfect paper heron, folded from a page of the school handbook.')] }
    ]
  };

  R.av = {
    name: 'A/V Closet', floor: '2F', theme: 'school', music: 'hall', spawn: [2, 1],
    map: [
      '##d#########',
      '#..==xx==BB#',
      '#..........#',
      '#..........#',
      '#x........x#',
      '#..........#',
      '#..........#',
      '############'
    ],
    exits: [{ x: 2, y: 0, to: 'hall2f', tx: 20, ty: 4, dir: 1 }],
    obj: [
      { x: 5, y: 1, w: 2, d: [
        { if: { flag: 'L.theo_missing' }, lines: ['A corkboard. The pins are still there. The red string is still there.', 'But every photo, every clipping, every note is blank. As if the wall forgot what it was about.'] },
        { id: 'theo_wall_obj', hint: true, lines: ['A corkboard webbed with red string. Clippings, maps, a blurry photo of the gym.', 'In the center, in marker: "1977 — WHO WAS MISSING?"'] }
      ] },
      { x: 1, y: 4, d: [say('A box of VHS tapes, all labelled "Final Assembly — Rehearsal." There are dozens. All dated today.')] },
      { x: 10, y: 4, d: [say('A projector, still warm. It is projecting a single frame on the wall: an empty hallway that slowly gets longer if you stare.')] },
      { x: 3, y: 1, w: 1, d: [say('Cables. So many cables. Theo has labelled each one with its emotional state. This one is "anxious."')] }
    ]
  };

  R.hall1f = {
    name: 'First Floor Hall', floor: '1F', theme: 'school', music: 'hall', duskMusic: 'twilight', spawn: [16, 2],
    map: [
      '####d#####d#####d#####d#####d###',
      '#LLL.LLLLL.LLLLL.LLLLL.LLLLL.LL#',
      '#.............................S#',
      '#.............................S#',
      '#...v.....................P...S#',
      '#L.LLLLLLLLLLLLL.LLLLLLLLLLLLLL#',
      '##d#############d###############'
    ],
    exits: [
      { x: 4, y: 0, to: 'library', tx: 11, ty: 11, dir: 1 },
      { x: 10, y: 0, to: 'chem', tx: 8, ty: 9, dir: 1 },
      { x: 16, y: 0, to: 'office', tx: 7, ty: 8, dir: 1 },
      { x: 22, y: 0, to: 'cafe', tx: 11, ty: 11, dir: 1 },
      { x: 28, y: 0, to: 'janitor', tx: 5, ty: 6, dir: 1, if: { flag: 'open_basement' }, lock: ['Janitor\'s closet. Locked.', 'A note: "NO STUDENTS. NO EXCEPTIONS. NO, NOT EVEN YOU. —O."'] },
      { x: 2, y: 6, to: 'gym', tx: 11, ty: 1, dir: 0 },
      { x: 16, y: 6, to: 'lobby', tx: 9, ty: 1, dir: 0 },
      { x: 30, y: 2, to: 'hall2f', tx: 29, ty: 3, dir: 2 }, { x: 30, y: 3, to: 'hall2f', tx: 29, ty: 3, dir: 2 }, { x: 30, y: 4, to: 'hall2f', tx: 29, ty: 3, dir: 2 }
    ],
    obj: [
      { x: 4, y: 4, d: [
        { id: 'vend', lines: ['A vending machine with exactly three bags of chips: Salt, Vinegar, and Salt & Vinegar.', 'They have been in the same slots since September.'], choices: [
          { t: 'Buy Salt & Vinegar', lines: ['Clunk. You eat them. They taste like September.'], do: { inc: 'chips' } },
          { t: 'Leave it', lines: [] }] }
      ] },
      { x: 26, y: 4, d: [say('A plant with a sticky note: "Please water me. —The Plant." The handwriting is Theo\'s.')] }
    ]
  };

  R.library = {
    name: 'Library', floor: '1F', theme: 'library', music: 'library', keepMusic: true, books: true, spawn: [11, 11],
    map: [
      '##BBBBBB##WWWW##BBBBBB##',
      '#......................#',
      '#.BBBB..BBBB..BBBB..BB.#',
      '#......................#',
      '#.BBBB..BBBB..BBBB..BB.#',
      '#......................#',
      '#..TTT....TTT....TTT...#',
      '#..C.C....C.C....C.C...#',
      '#......................#',
      '#.......====...........#',
      '#......................#',
      '#...........P..........#',
      '###########dd###########'
    ],
    exits: [{ x: 11, y: 12, to: 'hall1f', tx: 4, ty: 2, dir: 0 }, { x: 12, y: 12, to: 'hall1f', tx: 4, ty: 2, dir: 0 }],
    obj: [
      { x: 14, y: 4, w: 4, d: [
        { if: { flag: 'archive_hint' }, lines: ['The third shelf of Local History.', 'You push gently. The shelf sighs, like something shy, and swings inward.'], do: { warp: ['archive', 6, 7, 1], sfx: 'door' } },
        { lines: ['Local History. Three shelves of it. The third shelf is suspiciously dust-free.'] }
      ] },
      { x: 10, y: 0, w: 4, d: [say('Outside, the courtyard oak. A leaf has been falling from it since this morning. It still has not landed.')] }
    ]
  };

  R.archive = {
    name: 'The Archive', floor: 'Hidden', theme: 'library', music: 'anomaly', keepMusic: true, glitch: 0.05, secret: true, spawn: [6, 7],
    map: [
      '##############',
      '#BBBB....BBBB#',
      '#............#',
      '#.x..TT...x..#',
      '#....CC......#',
      '#............#',
      '#B..........B#',
      '#............#',
      '######dd######'
    ],
    exits: [{ x: 6, y: 8, to: 'library', tx: 15, ty: 5, dir: 0 }, { x: 7, y: 8, to: 'library', tx: 15, ty: 5, dir: 0 }],
    obj: [
      { x: 5, y: 3, w: 2, d: [{ id: 'yearbook', hint: true, lines: ['The 1977 Halloway Yearbook, lying open as if it has been waiting for you.',
        'Page 41, Faculty: "Mr. Aldous Grey, History." The same face. The same tired eyes. The same tweed.',
        'Page 88, Class 2-F: "Felix Bram. Most Likely to Stay Forever." His photo is blurred, as if he moved.',
        'Page 112: "Next year, Halloway celebrates the Stillwell Centennial!"', 'Next year never came.'], do: { clue: 'c_yearbook' } }] },
      { x: 2, y: 3, d: [{ id: 'closures', hint: true, lines: ['A filing cabinet. Folder: CLOSURE NOTICES.', 'There are dozens. 1977. 1984. 1991. 2003. 2015.', 'Every one announces that the school closes tomorrow. Every one is stamped in red: POSTPONED.'], do: { clue: 'c_closures' } }] },
      { x: 10, y: 3, d: [{ id: 'minutes', hint: true, lines: ['A box marked BELLWETHER — MINUTES.', 'Every page records the same meeting, on the same Thursday.', '"Motion: that the day be kept. Carried." The list of attendees grows by one name every decade.'], do: { clue: 'c_minutes' } }] },
      { x: 1, y: 1, w: 4, d: [{ id: 'blueprints', hint: true, lines: ['Blueprints of the school.', 'An east wing is drawn in pencil, erased, drawn again, erased again, until the paper is nearly see-through.'], do: { clue: 'c_blueprint' } }] },
      { x: 9, y: 1, w: 4, d: [say('Old attendance books. Every page, every year: "Thursday."')] }
    ]
  };

  R.chem = {
    name: 'Chemistry Lab', floor: '1F', theme: 'school', music: 'homeroom', duskMusic: 'twilight', spawn: [8, 9],
    map: [
      '##WW##KKKKKKK##WW###',
      '#qq.....TT.......q.#',
      '#..................#',
      '#..hhh..hhh..hhh...#',
      '#..................#',
      '#..hhh..hhh..hhh...#',
      '#..................#',
      '#..hhh..hhh..hhh...#',
      '#................B.#',
      '#..................#',
      '########dd##########'
    ],
    exits: [{ x: 8, y: 10, to: 'hall1f', tx: 10, ty: 2, dir: 0 }, { x: 9, y: 10, to: 'hall1f', tx: 10, ty: 2, dir: 0 }],
    obj: [
      { x: 6, y: 0, w: 7, d: [say('A periodic table. Someone has penciled in an extra element at the bottom:', '"Hw — Hallowium. Half-life: exactly one day."')] },
      { x: 3, y: 3, w: 3, d: [{ id: 'sample', hint: true, lines: ['A beaker labelled "DO NOT DRINK — STILLWELL SAMPLE #4,117."', 'You tap the glass. The water does not ripple. Not even a little.'], do: { clue: 'c_sample' } }] },
      { x: 17, y: 8, d: [say('Ms. Marrow\'s shelf. A framed photo of a very large orange cat wearing a tiny lab coat.', 'The plaque: "Pip, Lab Assistant, 2009–2015."')] },
      { x: 1, y: 1, w: 2, d: [say('An eyewash station. A sign: "IF YOU CAN READ THIS, YOU ARE NOT WEARING GOGGLES."')] }
    ]
  };

  R.office = {
    name: "Principal's Office", floor: '1F', theme: 'office', music: 'hall', spawn: [7, 8],
    map: [
      '####WWWW########',
      '#BB,,,,,,,,,,BB#',
      '#,,,,,,,,,,,,,,#',
      '#,,,,TTTT,,,,,x#',
      '#,,,,,,C,,,,,,,#',
      '#,,,,,,,,,,,,,,#',
      '#,,P,,,,,,,,,,x#',
      '#,,,,,,,,,,,,,,#',
      '#,,,,,,,,,,,,,,#',
      '#######dd#######'
    ],
    enter: [{ scene: 'meeting', if: { phase: 2, time: [1200, 1320], noclue: 'c_meeting' } }],
    exits: [{ x: 7, y: 9, to: 'hall1f', tx: 16, ty: 2, dir: 0 }, { x: 8, y: 9, to: 'hall1f', tx: 16, ty: 2, dir: 0 }],
    obj: [
      { x: 9, y: 0, w: 3, d: [{ id: 'calendar', hint: true, lines: ['A wall calendar. Every day of October is crossed out except today.', 'Tomorrow is circled in red: "FINAL ASSEMBLY — HALLOWAY ACADEMY CLOSES ITS DOORS."', 'Underneath, in pencil, very small: "again."'], do: { clue: 'c_calendar' } }] },
      { x: 14, y: 3, d: 'bell_panel' },
      { x: 14, y: 6, d: [
        { if: { loop: [5] }, lines: ['Student files. Yours is thicker than it should be.', 'Every page is the same attendance record: "Thursday — PRESENT."', 'You count the pages. There are exactly {loop}.'] },
        { lines: ['Student files. Yours is here. Every page is the same attendance record: "Thursday — PRESENT."'] }
      ] },
      { x: 1, y: 1, w: 2, d: [say('Binders labelled "Contingency Plans." Plan A: Close the school. Plan B: Do not.', 'There are no other plans.')] },
      { x: 13, y: 1, w: 2, d: [say('A shelf of identical trophies: "Halloway Academy — Perfect Attendance." One for every year since 1977.')] }
    ]
  };

  R.cafe = {
    name: 'Cafeteria', floor: '1F', theme: 'cafe', music: 'homeroom', duskMusic: 'twilight', spawn: [11, 11],
    map: [
      '####WWWW########WWWW####',
      '#======::::::::::::::vv#',
      '#::::::::::::::::::::::#',
      '#::TTTT::::TTTT::::TTT:#',
      '#::C:C::::::C:C::::C:C:#',
      '#::::::::::::::::::::::#',
      '#::TTTT::::TTTT::::TTT:#',
      '#::C:C::::::C:C::::C:C:#',
      '#::::::::::::::::::::::#',
      '#P::::::::::::::::::::P#',
      '#::::::::::::::::::::::#',
      '#::::::::::::::::::::::#',
      '###########dd###########'
    ],
    exits: [{ x: 11, y: 12, to: 'hall1f', tx: 22, ty: 2, dir: 0 }, { x: 12, y: 12, to: 'hall1f', tx: 22, ty: 2, dir: 0 }],
    obj: [
      { x: 1, y: 1, w: 6, d: [
        { if: { flag: 'L.ate' }, lines: ['The lunch line. You have already had the Mystery Meat today. Your body would like a word.'] },
        { if: { time: [700, 840] }, lines: ['Today\'s special: MYSTERY MEAT THURSDAY.', 'The menu board has been chalked so many times the letters are carved into it.'], choices: [
          { t: 'Eat the Mystery Meat', lines: ['It is warm. It is brown. It tastes faintly of déjà vu.'], do: { set: 'L.ate', inc: 'meat' } },
          { t: 'Not today', lines: ['The lunch lady nods slowly, like she has seen you decline before.'] }] },
        { lines: ['The serving counter is closed. A sign: "MYSTERY MEAT: SERVED AT LUNCH. ALWAYS. FOREVER."'] }
      ] },
      { x: 21, y: 1, w: 2, d: [say('A vending machine. It only sells one drink: "Thursday Punch." It is the color of a bruise.')] },
      { x: 4, y: 0, w: 4, d: [say('Through the window you can see the courtyard. A bird lands on the oak, takes off, lands again. The same bird. The same branch.')] }
    ]
  };

  R.janitor = {
    name: "Janitor's Closet", floor: '1F', theme: 'school', music: 'anomaly', secret: true, spawn: [5, 6],
    map: [
      '############',
      '#xx..==..qq#',
      '#..........#',
      '#..........#',
      '#x.......x.#',
      '#..........#',
      '#..........#',
      '#####d######'
    ],
    dyn: [{ x: 9, y: 4, t: 'S', if: { flag: 'open_basement' } }],
    exits: [{ x: 5, y: 7, to: 'hall1f', tx: 28, ty: 2, dir: 0 }, { x: 9, y: 4, to: 'sublevel', tx: 9, ty: 10, dir: 1, if: { flag: 'open_basement' } }],
    obj: [
      { x: 1, y: 1, w: 2, d: [say('Mops. Bone dry. They have never been used.')] },
      { x: 9, y: 1, w: 2, d: [say('A sink. The faucet drips. Each drop hangs for a full second before it falls, as if deciding.')] },
      { x: 5, y: 1, w: 2, d: [say('A radio, playing static. Under the static, very faintly, a school bell, slowed down until it sounds like a heartbeat.')] }
    ]
  };

  R.lobby = {
    name: 'Front Lobby', floor: '1F', theme: 'lobby', music: 'hall', duskMusic: 'twilight', spawn: [9, 1],
    map: [
      '####WW###dd###WW####',
      '#P................P#',
      '#..................#',
      '#..x...........x...#',
      '#..................#',
      '#.......bbbb.......#',
      '#..................#',
      '#..................#',
      '#P......====.....P.#',
      '#..................#',
      '########dddd########'
    ],
    exits: [
      { x: 9, y: 0, to: 'hall1f', tx: 16, ty: 4, dir: 1 }, { x: 10, y: 0, to: 'hall1f', tx: 16, ty: 4, dir: 1 },
      { x: 8, y: 10, to: 'courtyard', tx: 11, ty: 1, dir: 0 }, { x: 9, y: 10, to: 'courtyard', tx: 11, ty: 1, dir: 0 },
      { x: 10, y: 10, to: 'courtyard', tx: 12, ty: 1, dir: 0 }, { x: 11, y: 10, to: 'courtyard', tx: 12, ty: 1, dir: 0 }
    ],
    obj: [
      { x: 3, y: 3, d: 'lost_found_box' },
      { x: 15, y: 3, d: [say('A trophy: "HALLOWAY HERONS — STATE CHAMPIONS 1976."', 'In 1977 the heron mascot was replaced with a clock. Nobody remembers voting on it.')] },
      { x: 8, y: 8, w: 4, d: [say('The visitor log. Every line says "Thursday." The last outside visitor signed in during 1977.')] },
      { x: 19, y: 2, h: 7, d: [
        { if: { phase: 3 }, lines: ['The east wall. It is warm, like a forehead with a fever.', 'Through it, faintly, you hear a whole hallway\'s worth of footsteps. Walking. Walking. Never arriving.'] },
        { lines: ['The east wall. The paint is warm to the touch.'] }
      ] },
      { x: 8, y: 5, w: 4, d: 'sit_bench' }
    ]
  };

  R.courtyard = {
    name: 'Courtyard', floor: 'Grounds', theme: 'outdoor', music: 'courtyard', duskMusic: 'twilight', outdoor: true, spawn: [11, 1],
    map: [
      '##########dddd##########',
      'Y......................Y',
      'Y..pppppppppppppppppp..Y',
      'Y..p....gggggggg....p..Y',
      'Y..p..b.gg....gg.b..p..Y',
      'Y..p....gg.YY.gg....p..Y',
      'Y..p....gg....gg....p..Y',
      'Y..p....gggggggg....p..Y',
      'Y..pppppppppppppppppp..Y',
      'Y...........p..........Y',
      'Y.P.........p.......P..Y',
      'Y...........p..........Y',
      'FFFFFFFFFFFFGFFFFFFFFFFF'
    ],
    exits: [
      { x: 10, y: 0, to: 'lobby', tx: 9, ty: 9, dir: 1 }, { x: 11, y: 0, to: 'lobby', tx: 9, ty: 9, dir: 1 },
      { x: 12, y: 0, to: 'lobby', tx: 10, ty: 9, dir: 1 }, { x: 13, y: 0, to: 'lobby', tx: 10, ty: 9, dir: 1 },
      { x: 12, y: 12, scene: 'gate' }
    ],
    obj: [
      { x: 11, y: 5, w: 2, d: [{ id: 'oak', hint: true, lines: ['The old oak. Carved into the bark, at about the height of a fourteen-year-old:', '"F.B. — I\'ll be back for the eclipse."'] }] },
      { x: 8, y: 3, w: 8, d: [say('Yellow flowers. The exact yellow of the dried one in the history room display case.')] },
      { x: 6, y: 4, d: 'sit_bench' }, { x: 17, y: 4, d: 'sit_bench' }
    ]
  };

  R.gym = {
    name: 'Gymnasium', floor: '1F', theme: 'gym', music: 'hall', duskMusic: 'twilight', spawn: [11, 1],
    map: [
      '##WWWW#####dd#####WWWW##',
      '#mmmm..............mmmm#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#==....................#',
      '#==....................#',
      '########################'
    ],
    exits: [{ x: 11, y: 0, to: 'hall1f', tx: 2, ty: 4, dir: 1 }, { x: 12, y: 0, to: 'hall1f', tx: 2, ty: 4, dir: 1 }],
    obj: [
      { x: 1, y: 10, w: 2, h: 2, d: [{ id: 'bleachers', hint: true, lines: ['Under the bleachers: old gum, a lost shoelace, and a folded note.', '"IF YOU\'RE READING THIS, IT\'S STILL THURSDAY. —T.V."', 'The ink is faded, like it was written years ago. Theo is sixteen.'], do: { clue: 'c_note_tv' } }] },
      { x: 1, y: 1, w: 4, d: [say('Gym mats. They smell like 1977.')] },
      { x: 19, y: 1, w: 4, d: [say('More mats. Someone has drawn a hopscotch grid on one, numbered 1 to 13. There is no 14.')] }
    ]
  };

  R.lostfound = {
    name: 'Lost & Found', floor: 'Hidden', theme: 'anomaly', music: 'anomaly', keepMusic: true, glitch: 0.25, secret: true, timeless: true, spawn: [8, 8],
    map: [
      '################',
      '#x..x....x...x.#',
      '#..............#',
      '#.~....x....~..#',
      '#..............#',
      '#x.....~.....x.#',
      '#..............#',
      '#..x.......x...#',
      '#..............#',
      '########d#######'
    ],
    npcs: [{ id: 'theo', talk: 'theo_lost', x: 8, y: 4, dir: 0, ghost: true, if: { flag: 'L.theo_missing' } }],
    enter: [{ scene: 'lf_enter', onceEver: true }],
    exits: [{ x: 8, y: 9, to: 'lobby', tx: 3, ty: 4, dir: 0 }],
    obj: [
      { x: 1, y: 1, d: [say('A 1977 sweater vest. The name tag says F. BRAM.')] },
      { x: 4, y: 1, d: [{ id: 'pip', hint: true, lines: ['A small cat collar with a bell that does not ring.', '"PIP. If found, call C. Marrow."'], do: { clue: 'c_pip' } }] },
      { x: 9, y: 1, d: [say('A whistle on a lanyard, engraved: "R. Dunmore — Best Coach, 1977."', 'Coach Dunmore looks about forty. Today.')] },
      { x: 13, y: 1, d: [say('A stack of letters tied with string, all addressed to "Tomorrow." None of them were ever sent.')] },
      { x: 7, y: 3, d: [say('A box of name tags. Hundreds of them. You do not recognize a single name.', 'That is the point.')] },
      { x: 1, y: 5, d: [say('A bell clapper, the size of your arm. Removed from something very large.')] },
      { x: 13, y: 5, d: [say('A sketchbook. Every page shows the same grey door, labelled 2-F.', 'On the inside cover: "June S." She lost this a long time ago and never knew.')] },
      { x: 3, y: 7, d: [say('Someone\'s first day of school. Just the feeling of it, folded up like a note.')] },
      { x: 11, y: 7, d: [say('A pair of tweed-colored glasses, mended with tape. A tag: "A. GREY — 1977."')] }
    ]
  };

  R.sublevel = {
    name: 'The Stillwell', floor: 'Below', theme: 'sub', music: 'sublevel', keepMusic: true, glitch: 0.1, secret: true, timeless: true, spawn: [9, 10],
    map: [
      '####################',
      '#.....xx....xx.....#',
      '#..................#',
      '#.....wwwwwwww.....#',
      '#....wwwwwwwwww....#',
      '#....wwwwwwwwww....#',
      '#....wwwwwwwwww....#',
      '#.....wwwwwwww.....#',
      '#..................#',
      '#..x..........x....#',
      '#..................#',
      '#........S.........#',
      '####################'
    ],
    triggers: [{ x: 4, y: 8, w: 12, h: 1, scene: 'stillwell', if: { not: 'ch1_done' } }],
    exits: [{ x: 9, y: 11, to: 'janitor', tx: 8, ty: 5, dir: 0 }],
    obj: [
      { x: 3, y: 9, d: [say('Old pipes, with brass labels: "TO: EVERY CLOCK."')] },
      { x: 14, y: 9, d: [{ id: 'ledger', hint: true, lines: ['A ledger titled THINGS KEPT.', 'A heron. A flower. A boy named Felix. A teacher named Aldous. A cat named Pip. A Thursday.', 'The newest entry is in fresh ink. It is your name.', 'Next to it: "Pending."'], do: { clue: 'c_ledger' } }] },
      { x: 6, y: 1, w: 2, d: [say('Crates stamped "HALLOWAY — CENTENNIAL DECORATIONS." Never opened.')] },
      { x: 12, y: 1, w: 2, d: [say('More crates: "TOMORROW." Empty.')] },
      { x: 5, y: 3, w: 10, h: 5, d: [
        { if: { flag: 'ch1_done' }, lines: ['The Stillwell. Perfectly round. Perfectly still.', 'Your reflection is asleep at a desk.'] }
      ] }
    ]
  };
})(window.IS.data);

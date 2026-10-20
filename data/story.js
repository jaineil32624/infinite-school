// Story: every NPC's dialogue (first matching entry wins) and named scenes.
// Line format: "@speaker text" or plain narration. {name} {loop} {time} are substituted.
// Entry keys: id, if, once (per loop), onceEver, lines | pool, do, choices[{t, if, lines, do, goto}], goto
(function (D) {
  const T = D.dialogue, S = D.scenes;

  // ======================= SCENES =======================
  S.intro = {
    lines: [
      'A bell. Somewhere far away, a bell is ringing.',
      'You lift your head off a desk. There is a crease on your cheek and a taste in your mouth like old pennies.',
      '@mira {name}. {name}! Homeroom is almost over. Did you sleep here?',
      '@mira ...Kidding. Mostly. You look like you just saw a ghost.'
    ],
    choices: [
      { t: 'I had the weirdest dream.', lines: ['@mira Tell me at lunch. Today is way too big for dreams.'] },
      { t: 'What day is it?', lines: ['@mira Thursday, October 13th. The last normal Thursday ever. You know that.'] },
      { t: 'Who are you?', lines: ['@mira Wow. Rude! Mira Okafor. Class president. Your seatmate for two years?', '@mira You really hit your head, huh.'] }
    ],
    goto: 'intro2'
  };
  S.intro2 = {
    lines: [
      '@mira Tomorrow is the Final Assembly. Halloway Academy closes its doors, forever, and I have to give the speech.',
      '@mira So today, try to actually enjoy it. Look around. Say goodbye to stuff.',
      '@mira And maybe do not fall asleep in history.',
      'She goes back to her seat. Outside the window, a single cloud is drifting past a single tree.',
      '(Tip: walk with the arrows or WASD. Talk and inspect with Z or Enter. Open your Notebook with N.)'
    ],
    do: { set: 'met.mira' }
  };

  // 'loop_start' is dynamic: picks the right wake-up depending on progress
  D.wakeups = [
    { if: { phase: 3 }, lines: ['The bell. The desk. The pennies.', 'Loop {loop}. Somewhere under your feet, something very old is holding its breath.', '@mira {name}! Homeroom is almost—', '@mira ...Why are you looking at the floor like that?'] },
    { if: { phase: 2 }, lines: ['The bell. The desk. The pennies.', 'Loop {loop}.', '@mira {name}. {name}! Homeroom is almost over. Did you sleep h—'],
      choices: [
        { t: '...here? Yes. Every night, apparently.', lines: ['@mira Okay, psychic. Creepy, but okay.', '@mira Get up. Big day. Last day.'] },
        { t: '(Say nothing. Just watch her.)', lines: ['@mira ...You look like you just saw a ghost.', 'She says it exactly the way she said it the last {loop} times.'] }
      ] },
    { if: { loop: [2] }, lines: ['A bell. The same bell.', 'You lift your head off the desk. The crease on your cheek. The penny taste.', '@mira {name}. {name}! Homeroom is almost over. Did you sleep here?', '@mira ...Kidding. Mostly. You look like you just saw a ghost.'],
      choices: [
        { t: 'You said that yesterday.', lines: ['@mira Yesterday was Wednesday, weirdo. We barely talked. You were drawing turtles.', 'You were not drawing turtles. You were here. It was today.'], do: { clue: 'c_repeat' } },
        { t: 'What day is it?', lines: ['@mira Thursday. October 13th. Did you hit your head again?', 'Again.'], do: { clue: 'c_repeat' } }
      ] }
  ];

  S.enter2f = {
    lines: ['The air inside is cold and smells like pencil shavings and rain from a long time ago.', 'Dust hangs in the light, perfectly still. Your footsteps do not echo.', 'Someone is sitting by the window.'],
    do: { ach: 'room2f', glitch: 0.8, shake: 0.6 }
  };

  S.meeting = {
    id: 'meeting',
    lines: [
      'Voices. You duck behind the filing cabinet before anyone sees you.',
      '@hask The Bellwether holds?',
      '@marrow It holds. The chalk is still chalk. The bell is still the bell.',
      '@marrow But the student in 2-B is remembering, Hask. Asking questions. Mr. Grey looks at them like they are a miracle.',
      '@hask Then the student must be... encouraged to forget.',
      '@marrow Aldous won\'t like it.',
      '@hask Aldous resigned. Again. As he does every afternoon.',
      'They leave through a door behind the bookshelf. When you look, there is no door behind the bookshelf.'
    ],
    do: { clue: 'c_meeting', glitch: 0.7, sfx: 'glitch' }
  };

  D.gateScenes = [
    { if: { n: { gate: 2 } }, lines: ['You step into the fog again. You walk. You do not stop walking.', 'At some point, you realize you have been walking toward the school the whole time.'], do: { inc: 'gate', warp: ['courtyard', 12, 2, 0] } },
    { lines: ['You push the gate open and step into the fog.', 'You walk for a long time. The street is gone. The sound of traffic is gone. There is only white.', 'Then the white thins out, and you are standing at the front of the school.', 'Facing it.'], do: { clue: 'c_fog', inc: 'gate', warp: ['courtyard', 12, 2, 0], glitch: 0.6 } }
  ];

  S.sit_bench = {
    lines: ['A bench. You could sit here a while and let the day go by.'],
    choices: [
      { t: 'Sit until the next bell', if: { time: [0, 900] }, lines: ['You sit. The light moves across the floor at exactly the speed it always does.'], do: { nextBell: true } },
      { t: 'Sit until evening', if: { time: [0, 1080] }, lines: ['You sit, and the afternoon pours past you like honey.'], do: { timeTo: 1080 } },
      { t: 'Sit until midnight', lines: ['You sit and watch the day run out.'], do: { endDay: true } },
      { t: 'Stand up', lines: [] }
    ]
  };

  D.lostFound = [
    { if: { flag: ['L.theo_missing', 'd.forgotten'] }, lines: ['The Lost & Found box. Theo\'s hoodie is on top, still warm.', 'The box is deeper than it looks. Much deeper.'],
      choices: [
        { t: 'Reach inside', lines: ['You reach in. Past the hoodie. Past the elbow. Past the shoulder.', 'Something on the other side takes your hand and pulls.'], do: { warp: ['lostfound', 8, 8, 1], glitch: 1, sfx: 'glitch' } },
        { t: 'Not yet', lines: [] }
      ] },
    { if: { flag: 'L.theo_missing' }, id: 'lf_tag', lines: ['The Lost & Found box. On top of the pile: an orange hoodie. Theo\'s.', 'The tag inside reads: “CLAIMED BY: NO ONE.”'], do: { clue: 'c_tag' } },
    { if: { flag: 'd.forgotten' }, lines: ['The Lost & Found box. It hums, very softly, like a refrigerator full of memories.'],
      choices: [{ t: 'Reach inside', lines: ['Your arm goes in to the shoulder. Something pulls.'], do: { warp: ['lostfound', 8, 8, 1], glitch: 1 } }, { t: 'Leave it', lines: [] }] },
    { lines: ['LOST & FOUND. A sweater. A single glove. A retainer. A mood ring stuck on black.', 'Nobody ever claims anything.'] }
  ];

  S.lf_enter = { lines: ['You are standing in a room made of everything nobody came back for.', 'It is very quiet. Not peaceful quiet. Waiting quiet.'], do: { shake: 0.5 } };

  D.juneEasel = [
    { if: { flag: 'd.2f' }, lines: ['June\'s canvas. The grey door again, but now it is slightly open, and there is light behind it.'] },
    { if: { clue: 'c_drawing' }, lines: ['June\'s canvas: a grey door with a small brass plate. 2-F.'] },
    { lines: ['A canvas turned to face the wall. June has written “NOT DONE” on the back.'] }
  ];

  D.bellPanel = [
    { if: { phase: 2, clue: 'c_bell', time: [1425, 1440] }, lines: ['The school bell control panel. The big brass switch labelled MANUAL is humming.', 'It is 11:5-something. Every clock in the building is leaning toward midnight.'],
      choices: [
        { t: 'Ring the bell yourself.', lines: ['You grab the switch with both hands.'], do: { ending: 'dismissal' } },
        { t: 'Don\'t. (The chalkboard said not to trust it.)', lines: ['You let go. Your hands are shaking.'] }
      ] },
    { if: { phase: 2 }, lines: ['The bell control panel. The MANUAL switch is warm, like something on the other side is holding it.', 'You get the feeling it would only matter at the very end of the day.'] },
    { lines: ['The school bell control panel. A big brass switch labelled MANUAL, and a sticker: “DO NOT TOUCH. THIS MEANS YOU, THEO.”'] }
  ];

  S.stillwell = {
    lines: [
      'The stairs end in a round chamber. In the middle, a spring: perfectly round, perfectly flat, like a coin of black glass.',
      'Your reflection in it is not standing. Your reflection is asleep at a desk.',
      'Something speaks. It does not use sound. It uses the space where sound would go.',
      '@well STUDENT.',
      '@well YOU ARE NOT SUPPOSED TO KEEP THINGS. ONLY I KEEP THINGS.',
      '@well I KEPT A HERON. I KEPT A FLOWER. I KEPT A BOY WHO WAS HIDING. I KEPT A TEACHER WHO WAS COUNTING.',
      '@well I KEPT A THURSDAY.',
      '@well TOMORROW, THEY TEAR ME OUT OF THE GROUND AND POUR CONCRETE OVER THE HOLE.',
      '@well SO THERE WILL BE NO TOMORROW.'
    ],
    choices: [
      { t: 'Why do you keep things?', lines: ['The water does not ripple. But it seems to flinch.', '@well ...NO ONE HAS EVER ASKED ME WHY.', '@well ASK ME AGAIN WHEN YOU UNDERSTAND THE QUESTION.'], do: { set: 'well_why' } },
      { t: 'Let them go.', lines: ['@well YOU ARE ONE OF THEM. SHOULD I LET YOU GO, TOO?', '@well WHERE WOULD YOU GO? THERE IS NOTHING PAST THE FOG. I CHECKED.'] },
      { t: 'You can\'t keep me.', lines: ['@well I ALREADY DO. LOOK AT THE LEDGER.', '@well BUT YOU ARE... DIFFICULT TO HOLD. LIKE WATER IN A HAND.'] }
    ],
    goto: 'stillwell2'
  };
  S.stillwell2 = {
    lines: [
      '@well GO BACK UP, STUDENT. LIVE YOUR THURSDAY. I WILL BE HERE.',
      '@well I AM ALWAYS HERE.',
      'The chamber tilts. The stairs pour you upward like water going the wrong way.'
    ],
    do: { set: 'ch1_done', ach: 'chapter1', clue: 'c_ledger', card: { big: 'END OF CHAPTER ONE', small: 'Homeroom', dur: 4.5, sfx: 'loop' }, warp: ['janitor', 8, 5, 0], glitch: 1.2, shake: 1 }
  };

  // ======================= NPC DIALOGUE =======================
  T.mira = [
    { id: 'mira_roof', if: { room: 'rooftop', time: [1260, 1440], bond: { mira: 3 }, phase: 2, not: 'L.mira_roof' },
      lines: ['@mira You found me. Nobody ever comes up here this late.', '@mira I like it. The town lights look like they are holding still. Like someone pressed pause.',
        '@mira Hey, {name}... do you ever feel like today already happened?', '@mira Like if we just stayed up here, tomorrow could not find us.'],
      choices: [
        { t: 'Let\'s stay here. Forever.', lines: ['@mira ...Okay.', 'She leans her head against your shoulder. Below you, the bell starts to ring, very far away.'], do: { ending: 'forever' } },
        { t: 'Tomorrow has to come eventually.', lines: ['@mira Yeah. I know. I just... don\'t want to be the one who says goodbye.', '@mira Thanks for coming up here. Seriously.'], do: { set: 'L.mira_roof', bond: { mira: 1 } } }
      ] },
    { id: 'mira_theo', if: { flag: 'L.theo_missing', noclue: 'c_theo_gone' },
      lines: ['@mira Theo? Theo who?', '@mira There is no Theo in our class, {name}. Are you okay? You look pale.', 'She means it. There is no flicker of recognition at all.', 'His seat is empty. It has always been empty, according to everyone.'],
      do: { clue: 'c_theo_gone', glitch: 0.4 } },
    { id: 'mira_tell', once: true, if: { phase: 2, insight: { mira: 2 }, not: 'L.mira_ally' },
      lines: ['@mira You have that look again. The one where you know what I am about to say.'],
      choices: [
        { t: 'Tell Mira about the loop.', lines: ['You tell her. All of it. The bell, the desk, the pennies, the {loop} Thursdays.', '@mira ...', '@mira Okay. Say I believe you. Say I am not just humoring you because you look terrified.', '@mira Then what do you need from me?', '@mira Because whatever it is, I can probably organize it. That is my whole thing.'], do: { set: 'L.mira_ally', bond: { mira: 2 } } },
        { t: 'Not today.', lines: ['@mira Okay. Mysterious. I respect it.'] }
      ] },
    { id: 'mira_lunch', once: true, if: { time: [720, 780] },
      lines: ['@mira Mystery Meat Thursday. The final Mystery Meat Thursday. It is almost emotional.', '@mira Sit with me? I need to practice not crying about the cafeteria.'],
      choices: [
        { t: 'Sit with Mira', lines: ['You sit. She tells you about the Final Assembly seating chart, which has four versions, color-coded.', '@mira Thanks. You are easy to be around. Even when you are weird.'], do: { bond: { mira: 1 } } },
        { t: 'Maybe later', lines: ['@mira Your loss. I am delightful at lunch.'] }
      ] },
    { id: 'mira_speech', once: true, if: { time: [900, 1080], bond: { mira: 1 } },
      lines: ['@mira Oh. Hi. I am working on the speech.', 'She has a stack of paper in front of her. A tall stack.'],
      choices: [
        { t: 'How many drafts is that?', lines: ['@mira Uh. Two hundred and thirteen.', '@mira I know. I KNOW. Every time I finish it, it feels wrong, so I start over. Every single one is dated today because I keep doing it today.', '@mira Do not tell anyone.'], do: { clue: 'c_speech', bond: { mira: 1 }, item: 'draft' } },
        { t: 'Want help?', lines: ['@mira From you? ...Actually, yes. Read this line. Does “Today is our last day” sound too sad?', 'You read it. It sounds exactly as sad as it is.', '@mira Yeah. That is what I thought.'], do: { bond: { mira: 1 } } }
      ] },
    { id: 'mira_eve', once: true, if: { time: [1080, 1320], room: 'rooftop' },
      lines: ['@mira Oh! You found my spot.', '@mira I come up here when the student council gets loud. Which is always.', '@mira Stay a while, if you want. The sky does a nice thing around eight.'], do: { bond: { mira: 1 } } },
    { if: { time: [465, 480] }, pool: [
      ['@mira Homeroom attendance: present. Barely.'],
      ['@mira Bell is about to ring. Look alive. Or at least look awake.'],
      ['@mira Did you finish the history reading? ...Me neither. Do not tell anyone. I have a reputation.']
    ] },
    { if: { time: [480, 900] }, pool: [
      ['@mira Shh. Class. Some of us are trying to absorb knowledge for the last time ever.'],
      ['@mira Pass me a note later. Do not make it a turtle again.'],
      ['@mira Grey is going off about empires again. I have heard this lecture before. Like, exactly this lecture.', 'She frowns, as if the thought stung.']
    ] },
    { pool: [
      ['@mira Hey. Last day. Make it count, okay?'],
      ['@mira I have a checklist for tomorrow. It has sub-checklists. I am fine. Everything is fine.'],
      ['@mira If you see Theo, tell him the A/V cables for the assembly need to be labelled with something other than feelings.']
    ] }
  ];

  T.theo = [
    { id: 'theo_saved', if: { flag: 'theo_saved' }, pool: [
      ['@theo Loop {loop}. I remember all of it now. Thanks for that. I think.', '@theo The chips in the vending machine are mocking me.'],
      ['@theo I have started a new wall. It is about the wall. Meta-conspiracy.'],
      ['@theo You know what is weird? Being forgotten felt like being a sock behind a dryer. You know what is weirder? I miss the quiet.']
    ] },
    { id: 'theo_loop', once: true, if: { phase: 2, insight: { theo: 1 }, not: 'theo_hint' },
      lines: ['@theo Okay, you have the face. The face of someone who has seen the Truth.'],
      choices: [
        { t: 'The day is repeating, Theo.', lines: ['@theo A TIME LOOP? {name}. {name}. This is the best day of my life. Which I will apparently have again.',
          '@theo Okay. Okay okay okay. Rule one of loops: things that do not reset are clues. Rule two: if anyone disappears, check the Lost & Found.',
          '@theo Stuff nobody claims ends up there. It is basically physics.', '@theo ...Why are you looking at me like that?'], do: { set: 'theo_hint', bond: { theo: 1 } } },
        { t: 'Never mind.', lines: ['@theo Fine. Keep your Truth. I will find my own.'] }
      ] },
    { id: 'theo_wall', once: true, if: { room: 'av' },
      lines: ['@theo Close the door! ...Oh. It is you. Fine. Welcome to the Truth Closet.', 'He gestures at a corkboard drowning in red string.',
        '@theo Okay so. 1977. Fire drill. Bell rings. Everybody files out. Head count comes up one short.',
        '@theo The missing kid is never found. And the school says it never happened. There is no record. I checked. I checked a LOT.',
        '@theo And now the school is closing tomorrow? Coincidence? I think NOT.',
        '@theo Also, the vending machine on the first floor has had the same three bags of chips since September. Explain that.'],
      do: { clue: 'c_theo_wall', bond: { theo: 1 } } },
    { pool: [
      ['@theo Psst. Do you ever feel like the hallway is longer in the afternoon? I measured it. It is.'],
      ['@theo I have a theory about the cafeteria. I can not tell you yet. The cafeteria might hear.'],
      ['@theo Meet me in the A/V closet sometime. Second floor. Knock first. The Truth is shy.']
    ] }
  ];
  T.theo_lost = [
    { id: 'theo_rescue',
      lines: ['Theo is sitting cross-legged in the middle of the room, see-through at the edges, like a photo left in the sun.',
        '@theo Oh. Hey. Hi. You can see me?', '@theo Nobody could see me. I said hi to Mira and she walked through the place where I was standing.',
        '@theo It is really quiet in here. Like being a sock behind a dryer. Forever.'],
      choices: [
        { t: 'Take his hand.', lines: ['You hold out your hand. He stares at it like it is a magic trick.', '@theo You came back for me. Nobody comes back for socks.',
          'He takes it. His hand is cold, then normal, then just a hand.', 'The room exhales.'],
          do: { set: 'theo_saved', unset: 'L.theo_missing', ach: 'claimed', bond: { theo: 2 }, warp: ['lobby', 3, 4, 0], glitch: 1 } }
      ] }
  ];

  T.june = [
    { id: 'june_2f', once: true, if: { visited: 'c2f' },
      lines: ['@june You went inside.', '@june I can tell. You smell like chalk from a different decade.', '@june ...Was it the right door? The one I draw?'],
      choices: [{ t: 'It was exactly your door.', lines: ['@june Oh.', 'She looks at her hands like they belong to someone braver.', '@june I thought I was just weird. I am still weird. But now I am also right.'], do: { bond: { june: 2 } } }] },
    { id: 'june_count', once: true, if: { phase: 2, bond: { june: 1 } },
      lines: ['@june I have drawn that door three hundred and six times.', '@june I count. Counting is how I stay on the floor.', '@june I think it was a door I walked past every day. Before someone painted over it.'], do: { bond: { june: 1 } } },
    { id: 'june_first', once: true,
      lines: ['@june ...Oh. Hi.', '@june Do not look at it yet. It is not finished.'],
      choices: [
        { t: 'Look anyway.', lines: ['She lets you. On the canvas: a door painted in careful grey. A small brass plate reads 2-F.', '@june I keep drawing it. Every time I close my eyes, it is there.', '@june There is no 2-F. I checked. There is just wall.'], do: { clue: 'c_drawing', bond: { june: 1 } } },
        { t: 'Okay. I\'ll wait.', lines: ['@june ...Thank you.', '@june Most people look anyway.'], do: { bond: { june: 1 } } }
      ] },
    { pool: [
      ['@june The light in here is the same every day. That is good for painting. That is bad for other things.'],
      ['@june I am painting the courtyard. The cloud has not moved since I started.'],
      ['@june Shh. The paint is drying. It is shy.']
    ] }
  ];

  T.grey = [
    { id: 'grey_felix_msg', if: { flag: 'felix_message', not: 'felix_delivered' },
      lines: ['@grey {name}. You have been to 2-F again. I can see it on you.'],
      choices: [{ t: 'Felix says the head count was right.', lines: [
        '@grey ...What?', 'You tell him. The supply closet. The star in the doorframe. A fourteen-year-old who wanted to jump out and scare his teacher.',
        '@grey He was hiding.', '@grey He was hiding, and I counted twenty-one, and I told the fire marshal twenty-one, and they closed the door, and the bell rang, and it never stopped ringing.',
        'Mr. Grey takes off his glasses. He does not put them back on for a long time.', '@grey Thank you. I have waited a very long time for someone to tell me it was not my fault.',
        '@grey I am not sure it is true. But I am grateful someone said it.'], do: { set: 'felix_delivered', ach: 'headcount', bond: { grey: 2 } } }] },
    { id: 'grey_bw', once: true, if: { flag: 'd.bellwether', not: 'k.grey_bw' },
      lines: ['@grey So you have found out about the Bellwether.', '@grey Celeste. Hask. A few others over the decades. Teachers who decided an endless Thursday is a kindness.',
        '@grey No student ever fails. No one ever has to say goodbye. No one ever has to grow old and find out how it ends.', '@grey I was a member once. I resigned.', '@grey I resign every afternoon. It never takes.'],
      do: { set: 'k.grey_bw', bond: { grey: 1 } } },
    { id: 'grey_felix', once: true, if: { clue: 'c_felix', not: 'k.grey_felix' },
      lines: ['@grey Felix Bram.', '@grey You have met him. Of course you have. You are the first person who could.',
        '@grey Second row, by the window. He wanted to be an astronomer. He was very excited about an eclipse on the fourteenth.',
        '@grey I was the one doing the head count, {name}. It was my job to count them. All of them.'],
      do: { set: 'k.grey_felix', bond: { grey: 1 } } },
    { id: 'grey_confide', if: { phase: 2, not: 'grey_confided' },
      lines: ['@grey Sit down, {name}. Close the door.', '@grey How many times has it been for you? ...No. Do not tell me. I stopped counting somewhere past nine thousand.',
        '@grey I have taught this Thursday since 1977. The same lesson plan. The same chalk. The same student asleep in the second row of 2-B.',
        '@grey No. That last part is new. You are new.', '@grey You are the first person in nearly fifty years who has carried a memory across midnight.',
        'He opens a drawer and takes out a brass pocketwatch.', '@grey Take this. The Second Hand. It keeps your time, not the school\'s.',
        '@grey If a day goes wrong, you can wind it and start over. I have not had the heart to use it in a long time.'],
      do: { set: 'grey_confided', item: 'watch', clue: 'c_grey', ach: 'secondhand', bond: { grey: 2 } } },
    { id: 'grey_repeat', once: true, if: { loop: [2], maxPhase: 1 },
      lines: ['@grey Halloway Academy was founded in 1921, over the old Stillwell spring.', '@grey Is this the first time you have heard me say that?', 'He looks at you for a long moment. Too long.', '@grey Hm. Forgive me. An old man\'s question.'] },
    { id: 'grey_lesson', once: true,
      lines: ['@grey Ah. A student who comes to history voluntarily. A rare bird.', '@grey Halloway Academy was founded in 1921, over the old Stillwell spring. The locals said its water could keep a flower fresh for a year.',
        '@grey Superstition, of course. History is mostly superstition that got its paperwork in order.'], do: { bond: { grey: 1 } } },
    { if: { time: [1140, 1260] }, lines: ['@grey I like to stand here in the evening and watch the door. In case someone comes back.'] },
    { pool: [
      ['@grey Empires do not fall, {name}. They refuse to stand up. There is a difference.'],
      ['@grey Read chapter twelve. Or do not. It will still be chapter twelve tomorrow.'],
      ['@grey The bell is always slightly early. Have you noticed? Nobody notices.']
    ] }
  ];

  T.marrow = [
    { id: 'marrow_pip', once: true, if: { clue: 'c_pip', not: 'k.marrow_truth' },
      lines: ['@marrow What do you want. Goggles on, if you are staying.'],
      choices: [
        { t: 'I found Pip\'s collar.', lines: ['The color drains from her face.', '@marrow Where.', 'You tell her. She is quiet for a long time.',
          '@marrow Do you know what happens tomorrow? The school closes. The kids scatter. I go home to an empty apartment.', '@marrow In here, it is always Thursday. Pip is always waiting at the door when I get home. Every night. Every single night.',
          '@marrow So do not you dare judge me for wanting to keep that.'], do: { set: 'k.marrow_truth', bond: { marrow: 1 } } },
        { t: 'Never mind.', lines: ['@marrow Then get out with goggles on.'] }
      ] },
    { id: 'marrow_sus', if: { phase: 2 }, pool: [
      ['@marrow You have been asking questions. Questions are how accidents happen in a lab.'],
      ['@marrow I know that look. Curiosity. I had it once. Then I had tenure.'],
      ['@marrow Whatever you think you know, {name}, put it down slowly and back away.']
    ] },
    { id: 'marrow_first', once: true,
      lines: ['@marrow Goggles on or get out.', '@marrow ...You are not in my class. Then get out with goggles on.'] },
    { pool: [
      ['@marrow The Bunsen burners are for science, not for feelings. Tell Theo.'],
      ['@marrow Last day of chemistry ever. I am planning to explode nothing.'],
      ['@marrow Do not touch the sample on bench one. I mean it.']
    ] }
  ];

  T.coach = [
    { id: 'coach_finish', once: true, if: { clue: 'c_joke', phase: 2 },
      lines: ['@coach Hey, champ! Why did the photocopier quit the team?'],
      choices: [
        { t: '“It kept making the same play over and over.”', lines: ['@coach ...', '@coach How did you know the punchline? I made that up this morning!', 'He rubs his temple.',
          '@coach Weird. Got a headache right behind the eyes. Like déjà vu with a hangover.', '@coach Happens every time somebody does something new around here. Like the building flinches.'], do: { set: 'k.coach_pain', bond: { coach: 1 } } },
        { t: 'Let him tell it.', lines: ['@coach It kept making the same play over and over! HA!', 'Same pause. Same HA.'] }
      ] },
    { id: 'coach_joke2', once: true, if: { loop: [2] },
      lines: ['@coach Hey, champ! Why did the photocopier quit the team?', '@coach It kept making the same play over and over! HA!', 'The same joke as yesterday. The same pause before the punchline. The same HA.',
        '@coach Just came up with that this morning. Comedy gold.'], do: { clue: 'c_joke' } },
    { id: 'coach_joke1', once: true,
      lines: ['@coach Hey, champ! Why did the photocopier quit the team?', '@coach It kept making the same play over and over! HA!', '@coach Made that up this morning. You can have it. Free of charge.'], do: { bond: { coach: 1 } } },
    { if: { time: [720, 780] }, lines: ['@coach Mystery Meat Thursday! Fuel of champions. Probably. Nobody has ever checked.'] },
    { pool: [
      ['@coach Laps! ...Not you. You look tired. Everyone looks tired today.'],
      ['@coach Last gym class ever. I was going to do dodgeball, but it feels too much like a metaphor.'],
      ['@coach Hydrate, champ. Life is long. Well. Days are long.']
    ] }
  ];

  T.vell = [
    { id: 'vell_book_return', once: true, if: { item: 'book', time: [1080, 1440] },
      lines: ['@vell You brought it back. On the same day.', '@vell Nobody returns anything here, dear. Nothing ever leaves.', 'She stamps the card. The stamp says THURSDAY.'], do: { take: 'book', ach: 'overdue', bond: { vell: 1 } } },
    { id: 'vell_archive', if: { phase: 2, not: 'archive_hint' },
      lines: ['@vell You have noticed. Good. Noticing is the first chapter.', '@vell I am the library, dear. Or what the library became after it read itself too many times.',
        '@vell There is a room for the things this school would rather forget. It is behind the third shelf of Local History.', '@vell Push gently. It is shy.'],
      do: { set: 'archive_hint', bond: { vell: 1 } } },
    { id: 'vell_first', onceEver: true,
      lines: ['@vell Welcome back, dear. The same book as last time?'],
      choices: [
        { t: 'I\'ve never been here before.', lines: ['@vell Of course not. My mistake.', '@vell The years blur together. The days, on the other hand, do not blur at all.'], do: { clue: 'c_welcome' } },
        { t: '...Sure?', lines: ['She slides a thin book across the desk without looking: “The Patient Clock.”', '@vell Due back today. Everything is due back today.'], do: { clue: 'c_welcome', item: 'book' } }
      ] },
    { if: { time: [1260, 1440] }, lines: ['@vell Libraries do not close, dear. They only pretend to.'] },
    { pool: [
      ['@vell Shh. The books are sleeping. Some of them for a very long time.'],
      ['@vell Please do not reshelve anything. The shelves remember where things go. They hold grudges.'],
      ['@vell If you cannot find a book, it is usually because it does not want to be found yet.'],
      ['@vell You may borrow anything you like. You will find that it all comes back.']
    ] }
  ];

  T.okon = [
    { id: 'okon_open', if: { phase: 3, not: 'open_basement' },
      lines: ['He stops humming.', '@okon So. You know what is under us.', '@okon The Stillwell. School is built on top of it like a lid on a pot.',
        '@okon Every midnight I hear it. Not water. Breathing.', '@okon Basement stairs are in my closet. First floor, by the stairs. I will leave it open.', '@okon Do not drink the water.'],
      do: { set: 'open_basement', clue: 'c_okon', bond: { okon: 1 } } },
    { id: 'okon_floors', once: true, if: { phase: 2 },
      lines: ['@okon You see it too, huh.', '@okon The floors. Spotless every morning. I have not touched a mop in years.', 'He shows you his key ring. One key is heavier than the rest, brass, tagged STILLWELL.', '@okon Not yet. Not for you. Not yet.'],
      do: { clue: 'c_okon', bond: { okon: 1 } } },
    { pool: [
      ['He is humming. It sounds like the school bell, slowed way, way down.', '@okon Mm. Floors do not mop themselves.', '@okon ...Well. They do here.'],
      ['@okon Mind the wet floor sign. There is no wet floor. There is never a wet floor. I just like the sign.'],
      ['@okon Mm.']
    ] }
  ];

  T.hask = [
    { id: 'hask_night', if: { room: 'courtyard' },
      lines: ['Principal Hask stands perfectly still, staring straight up.', '@hask Do you hear it, student? The day, straining at its stitches.', '@hask Go back inside. Midnight is not for students.'] },
    { id: 'hask_p2', once: true, if: { phase: 2 },
      lines: ['@hask You have been... repeating yourself, student.', '@hask Repetition is how we learn. Repetition is how we stay.', '@hask You would like to stay, would you not? Everyone does, eventually.'] },
    { id: 'hask_first', once: true,
      lines: ['@hask Ah. A student. In my office. Unscheduled.', '@hask Tomorrow is the Final Assembly. Everything must be perfect.', '@hask Everything IS perfect. Thursday is perfect.',
        'He does not blink. You realize you have not seen him breathe, either.'], do: { clue: 'c_hask' } },
    { pool: [
      ['@hask Your attendance is exemplary, student. It always will be.'],
      ['@hask Run along. The bell will tell you where to be.'],
      ['@hask I have been principal here for a long time. I intend to remain principal for exactly as long.']
    ] }
  ];

  T.felix = [
    { id: 'felix_msg', once: true, if: { flag: 'k.grey_felix', not: 'felix_message' },
      lines: ['@felix Did you find Mr. Grey? Is he coming to count us?'],
      choices: [{ t: 'Mr. Grey still remembers you.', lines: ['@felix He does?', 'Felix flickers, brighter for a second.',
        '@felix Then tell him the head count was right. Tell him I was just hiding in the supply closet. I was going to jump out and scare him. It was going to be so funny.',
        '@felix And then the bell rang, and everyone left, and it never stopped ringing.', '@felix Tell him it is not his fault. Okay? Promise.'], do: { set: 'felix_message', bond: { felix: 1 } } }] },
    { id: 'felix_stars', once: true, if: { clue: 'c_felix', bond: { felix: 1 } },
      lines: ['@felix Do you like stars? I am going to be an astronomer.', '@felix There is an eclipse tomorrow. A total one. The moon walks right in front of the sun and everything goes quiet.',
        '@felix I have been waiting for tomorrow for a really long time. It feels like a really long time.', '@felix That is silly. It has only been one day.'], do: { bond: { felix: 1 } } },
    { id: 'felix_meet', onceEver: true,
      lines: ['A boy sits at the desk by the window. Sweater vest. Hair parted with a ruler. He is slightly see-through, like a photo left in the sun.',
        '@felix Oh! Hello. Is it time for the drill?', '@felix I am supposed to wait here. Mr. Grey said wait here and he would come back and count us.', '@felix He has not come back yet. What day is it?'],
      choices: [
        { t: 'Thursday.', lines: ['@felix Oh good. Still Thursday. I would hate to miss the eclipse tomorrow.'], do: { clue: 'c_felix' } },
        { t: 'It\'s a lot later than you think.', lines: ['He flickers, like a bad TV channel.', '@felix That is not funny. It is Thursday. It is always Thursday.', '@felix ...It is always Thursday, isn\'t it.'], do: { clue: 'c_felix', glitch: 0.6 } }
      ] },
    { pool: [
      ['@felix I counted the ceiling tiles. There are 214. Yesterday there were 214. That is good. That is consistent.'],
      ['@felix Do you think Mr. Grey forgot about us?'],
      ['@felix The window shows a different courtyard than it used to. I do not like looking anymore.']
    ] }
  ];

  T.priya = [{ pool: [
    ['@priya Did you know Halloway\'s mascot was a heron until 1977, and then it was just... a clock? Nobody voted on that. I checked the minutes.'],
    ['@priya I am preparing a formal argument against tomorrow. Resolved: Thursday should continue. I am arguing the affirmative.', '@priya I always win.'],
    ['@priya I have debated Mira on whether the Final Assembly needs a slideshow. She won. She always wins. Do not tell her I said that.']
  ] }];
  T.dex = [{ pool: [
    ['@dex Bro. I tried to kickflip over the front gate and landed back on the same side. Twice. The fog is undefeated.'],
    ['@dex Last day, huh? I am gonna ride the stair rail on the second floor. Mira said if I do she will personally end me.'],
    ['@dex You ever notice the lobby smells like rain even when it is sunny? It is sick. I love it.']
  ] }];
  T.ama = [{ pool: [
    ['@ama Supposedly the principal does not have a car. Or a house. Or a first name.'],
    ['@ama Okay, gossip: Ms. Marrow buys cat food every Friday. She does not have a cat. Think about it.'],
    ['@ama Theo says the vending machine is haunted. Theo also says the moon is a hologram, so.']
  ] }];

  // Scenes that delegate to dynamic lists (evaluated when the scene starts)
  const dyn = { loop_start: 'wakeups', gate: 'gateScenes', lost_found_box: 'lostFound', june_easel: 'juneEasel', bell_panel: 'bellPanel' };
  D.dynamicScenes = dyn;
})(window.IS.data);

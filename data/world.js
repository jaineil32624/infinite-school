// World rules & knowledge: clues, deductions, items, phases, clock, objectives.
(function (D) {
  D.phases = { 1: 'Normal School Life', 2: 'Strange Events', 3: 'Conspiracy', 4: 'Reality Collapse', 5: 'Final Truth' };
  D.periods = [[0, 'Night'], [465, 'Homeroom'], [480, 'Morning Classes'], [720, 'Lunch'], [780, 'Afternoon Classes'], [900, 'After School'], [1080, 'Evening'], [1260, 'Night']];
  D.bells = [[480, 'First bell'], [720, 'Lunch bell'], [780, 'Afternoon bell'], [900, 'Dismissal bell']];

  // Rules evaluated every time a new loop begins
  D.loopRules = [
    { if: { loop: [3], phase: 2, not: 'theo_saved' }, do: { set: 'L.theo_missing' } }
  ];

  D.items = {
    watch: { name: 'The Second Hand', desc: "Mr. Grey's pocketwatch. It keeps your time, not the school's. From the pause menu (Wait…) you can wind it to restart the day early.", anchored: true },
    book: { name: 'The Patient Clock', desc: 'A library book. Chapter One is about a clock that refused to strike midnight. Due back today.' },
    draft: { name: "Mira's Draft #213", desc: '"Good morning, Halloway. Today is our last day. Today is our last day. Today is—" It stops there.' }
  };

  const C = (cat, title, text) => ({ cat, title, text });
  D.clues = {
    c_repeat: C('anomaly', "Mira's Words", 'Mira woke you with the exact same words as yesterday. Same pause. Same joke about ghosts.'),
    c_desk: C('anomaly', 'The Scratched Desk', "Back row of 2-B, the desk nobody uses. Carved deep: 'F.B. WAS HERE.' Below it, newer: 'F.B. IS STILL HERE.'"),
    c_welcome: C('people', 'Welcome Back', "Mrs. Vell, the librarian, greeted you with 'Welcome back, dear. The same book as last time?' You have never been in the library."),
    c_joke: C('anomaly', 'The Photocopier Joke', 'Coach Dunmore told you the same joke as yesterday, word for word. He swears he made it up this morning.'),
    c_drawing: C('places', "June's Door", 'June Sato keeps drawing a grey door with a brass plate that reads 2-F. She sees it whenever she closes her eyes.'),
    c_gap: C('places', 'The Missing Number', 'Second floor: 2-E, then a stretch of blank wall, then 2-G. The paint between them is a slightly newer shade of beige.'),
    c_calendar: C('history', 'Final Assembly', "The principal's calendar: October 14 — FINAL ASSEMBLY. HALLOWAY ACADEMY CLOSES ITS DOORS. Penciled underneath: 'again.'"),
    c_fog: C('anomaly', 'The Gate', 'Walk out the front gate and the fog walks you straight back to the front of the school.'),
    c_bell: C('anomaly', 'Chalkboard Warning', "After school, on the 2-B chalkboard, in YOUR handwriting: 'DON'T TRUST THE BELL.' You don't remember writing it."),
    c_grey: C('people', 'Mr. Grey Remembers', 'Mr. Grey has lived this Thursday since 1977. He remembers every loop. Until you, no one else did.'),
    c_meeting: C('people', 'After-Hours Meeting', "Principal Hask and Ms. Marrow, after hours: 'The Bellwether holds.' They are worried about the student who remembers."),
    c_theo_wall: C('history', "Theo's Theory Wall", "Theo's red-string wall: a 1977 fire drill where the head count came up one short. Officially, it never happened."),
    c_theo_gone: C('people', 'Nobody Remembers Theo', 'Theo Vance is gone. His seat is empty, and nobody, not even Mira, remembers he ever existed.'),
    c_tag: C('anomaly', 'Claimed by No One', "Theo's orange hoodie is in the Lost & Found box. The tag reads: 'CLAIMED BY: NO ONE.'"),
    c_room2f: C('places', 'Room 2-F', "A classroom sealed since 1977. The board says 'FIRE DRILL — 2:15 PM. WAIT FOR HEAD COUNT.' The clock is stuck at 2:14."),
    c_felix: C('people', 'Felix Bram', 'A see-through boy in a sweater vest, waiting in 2-F for a head count that never came. He thinks it is still 1977.'),
    c_yearbook: C('history', 'The 1977 Yearbook', "Mr. Grey is on the faculty page with the same face at the same age. Felix Bram, voted 'Most Likely to Stay Forever.'"),
    c_closures: C('history', 'Postponed', 'Closure notices from 1977, 1984, 1991, 2003, 2015... Each says the school closes tomorrow. Each is stamped POSTPONED.'),
    c_minutes: C('history', 'Bellwether Minutes', 'Minutes of the Bellwether Society. Every page records the same meeting. Attendance grows by one name every decade.'),
    c_founding: C('history', 'Built on the Stillwell', 'Halloway Academy, est. 1921, was built over the Stillwell spring. Locals said its water could keep a flower fresh for a year.'),
    c_note_tv: C('anomaly', 'Note Under the Bleachers', "'IF YOU'RE READING THIS, IT'S STILL THURSDAY. —T.V.' Theo's initials, in faded ink that looks years old."),
    c_speech: C('people', "Mira's Speech", 'Mira has written the Final Assembly speech 213 times. Every draft is dated today.'),
    c_okon: C('people', "The Janitor's Key", 'Okon carries a heavy brass key tagged STILLWELL. He says the floors clean themselves every midnight.'),
    c_pip: C('people', "Pip's Collar", "A cat collar in the Lost & Found: 'PIP. If found, call C. Marrow.' The cat in Ms. Marrow's photo died in 2015."),
    c_sample: C('anomaly', 'Sample #4,117', 'A beaker in the chem lab: STILLWELL SAMPLE #4,117. The water stays perfectly flat even when you tap the glass.'),
    c_blueprint: C('places', 'The Erased Wing', 'Old blueprints. An east wing is drawn, erased and drawn again, over and over until the paper is nearly transparent.'),
    c_hask: C('people', "The Principal Doesn't Blink", 'Principal Hask has not blinked once. Or breathed, as far as you can tell.'),
    c_ledger: C('anomaly', 'Things Kept', "A ledger under the school lists everything the Stillwell has kept. Your name is the newest entry, marked 'Pending.'")
  };

  D.deductions = [
    { id: 'loop', title: 'The Day Repeats',
      pairs: [['c_repeat', 'c_welcome'], ['c_joke', 'c_welcome'], ['c_repeat', 'c_joke'], ['c_bell', 'c_repeat'], ['c_bell', 'c_joke'], ['c_bell', 'c_welcome'], ['c_fog', 'c_repeat'], ['c_fog', 'c_joke'], ['c_fog', 'c_welcome']],
      text: 'Every midnight, Thursday starts over. Everyone forgets except you, and a few people who know more than they are saying.',
      do: { phase: 2 } },
    { id: '2f', title: 'There Was a Room 2-F',
      pairs: [['c_drawing', 'c_gap'], ['c_desk', 'c_gap'], ['c_blueprint', 'c_gap']],
      text: 'Someone painted over a classroom between 2-E and 2-G. June has been drawing its door from memory. The wall should be easier to see through now.',
      do: { shake: 1.2, sfx: 'glitch', toast: 'Something shifted on the second floor.' } },
    { id: 'felix', title: 'F.B. Is Still Here',
      pairs: [['c_desk', 'c_felix'], ['c_theo_wall', 'c_felix'], ['c_yearbook', 'c_felix']],
      text: 'Felix Bram is the student missing from the 1977 head count. He never left the building. The building never let him go.',
      do: { bond: { felix: 1 } } },
    { id: 'forgotten', title: 'The Forgotten Are Kept',
      pairs: [['c_theo_gone', 'c_tag'], ['c_tag', 'c_felix'], ['c_theo_gone', 'c_note_tv']],
      text: "When the school takes someone, it doesn't erase them. It files them away like a lost glove. Reach into the Lost & Found.",
      do: { toast: 'The Lost & Found box hums faintly.' } },
    { id: 'bellwether', title: 'The Bellwether Society',
      pairs: [['c_meeting', 'c_grey'], ['c_minutes', 'c_meeting'], ['c_minutes', 'c_grey'], ['c_sample', 'c_meeting']],
      text: 'A secret society of teachers keeps the loop running on purpose. To them, an endless Thursday is a mercy.',
      do: { ach: 'bellwether' } },
    { id: 'closing', title: 'The School Refuses to Close',
      pairs: [['c_calendar', 'c_yearbook'], ['c_calendar', 'c_closures'], ['c_closures', 'c_founding'], ['c_yearbook', 'c_founding']],
      text: 'Halloway was supposed to close in 1977. It has postponed its last day ever since, and the Stillwell spring beneath it is doing the postponing.',
      do: { phase: 3 } }
  ];

  // The notebook shows the first objective whose condition passes
  D.objectives = [
    { if: { flag: 'ch1_done' }, text: 'Chapter One is complete. Keep looping to find every clue, secret, achievement and ending. Chapter Two opens the east wing.' },
    { if: { phase: 3, not: 'open_basement' }, text: 'The school is refusing to close, and something under it is responsible. The janitor, Okon, has a key nobody else has. Find him.' },
    { if: { phase: 3 }, text: "Okon unlocked the way down. The stairs are in the janitor's closet on the first floor." },
    { if: { flag: 'L.theo_missing', not: 'd.forgotten' }, text: 'Theo is gone and nobody remembers him. Where do things end up when nobody claims them?' },
    { if: { flag: ['L.theo_missing', 'd.forgotten'] }, text: 'Reach into the Lost & Found box in the lobby. Bring Theo back.' },
    { if: { phase: 2, not: 'grey_confided' }, text: 'The day repeats. Someone at Halloway must remember too. Who would know the most about the past? Try the history classroom, 2-G.' },
    { if: { phase: 2, not: 'd.2f' }, text: 'The second-floor rooms skip a number. Look at the wall between 2-E and 2-G, and ask June what she keeps drawing.' },
    { if: { flag: 'd.2f', noclue: 'c_felix' }, text: 'Room 2-F is open. Go inside.' },
    { if: { phase: 2, noclue: 'c_yearbook' }, text: 'The library holds more history than it shows. Ask Mrs. Vell about it, then look for what is hidden behind the shelves.' },
    { if: { phase: 2 }, text: 'Connect what the calendar says about tomorrow with what the archive says about the past.' },
    { if: { clues: 3 }, text: 'Open the Notebook (N), go to the Board, and connect two clues that feel related. Deductions unlock new places and people.' },
    { if: {}, text: 'Something is off about today. Explore Halloway, talk to everyone, and inspect anything that sparkles. Clues go in your Notebook (N).' }
  ];

  // Library shelves: random lore, rotates every loop
  D.books = [
    ['"A History of Thursday." Every page is blank except the first: "It was a Thursday."'],
    ['"Herons of the Northern Marsh." Someone has pressed a heron feather between pages 40 and 41. It is still soft.'],
    ['"Springs, Wells & Folk Belief." A paragraph is underlined: "Water that will not move will not let anything else move either."'],
    ['"The Patient Clock," a children\'s book. The clock refuses to strike midnight because it loves the day too much.', 'The last page has been torn out.'],
    ['A yearbook from 2015. Every senior photo has the same background: the courtyard oak, the same cloud above it.'],
    ['"Grief: A Field Guide." The checkout card has one name on it, over and over: C. Marrow.'],
    ['"So You\'re Closing a School: A Practical Handbook." It has never been opened. The spine cracks loudly.'],
    ['"Stars for Beginners." A pencil note in the margin: "Eclipse — Oct 14! Don\'t miss it. —F.B."'],
    ['A cookbook. Recipe 12: "Mystery Meat (Traditional)." The instructions just say: "You know."'],
    ['"Halloway Ghost Stories." Story 3: The Boy in 2-F. Story 4: The Janitor Who Hums the Bell. Story 5 is just your name.', 'You look again. It is not your name. It is a blank line.'],
    ['A dictionary. The word "tomorrow" has been neatly cut out with a razor.'],
    ['"Knots for Sailors." Someone practiced a knot on a bookmark ribbon. It has been tied and untied thousands of times.'],
    ['"Local Architecture, 1920–1930." A photo of Halloway under construction. Workers stand around a perfectly round pool in the foundations.'],
    ['A library record card for "The Patient Clock." Borrowed: Thursday. Returned: Thursday. Borrowed: Thursday. The column runs off the bottom of the card.'],
    ['"How to Say Goodbye." It is shelved upside down, as if someone wanted to make it harder to read.'],
    ['A poetry anthology, open to a page that has been read so often the words are smudged into grey.']
  ];
})(window.IS.data);

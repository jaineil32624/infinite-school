// Achievements & endings. "auto" achievements unlock when their condition passes.
(function (D) {
  D.achievements = [
    { id: 'dejavu', title: 'Déjà Vu', desc: 'Wake up on Thursday. Again.', auto: { loop: [2] } },
    { id: 'red_string', title: 'Red String', desc: 'Make your first deduction on the evidence board.' },
    { id: 'conspiracy', title: 'Conspiracy Board', desc: 'Make every deduction in Chapter One.' },
    { id: 'room2f', title: 'Between E and G', desc: 'Step inside a classroom that should not exist.' },
    { id: 'secondhand', title: 'The Second Hand', desc: 'Earn the trust of someone who has been waiting fifty years.' },
    { id: 'claimed', title: 'Claimed', desc: 'Bring back someone the world forgot.', secret: true },
    { id: 'headcount', title: 'Head Count', desc: 'Deliver a message fifty years late.', secret: true },
    { id: 'bellwether', title: 'Secret Handshake', desc: 'Uncover the society that keeps the day alive.' },
    { id: 'chapter1', title: 'Beneath the Lid', desc: 'Complete Chapter One: Homeroom.' },
    { id: 'archive', title: 'Shy Shelf', desc: 'Find the archive behind the library.', auto: { visited: 'archive' } },
    { id: 'meat', title: 'Mystery Solved?', desc: 'Eat the Mystery Meat in three different loops.', auto: { n: { meat: 3 } } },
    { id: 'gate', title: 'Long Walk Home', desc: 'Try to leave through the front gate three times.', auto: { n: { gate: 3 } } },
    { id: 'overdue', title: 'Overdue', desc: 'Return a library book on the day it is due.' },
    { id: 'night', title: 'Night Owl', desc: 'Still be at school at 11 PM.', auto: { time: [1380, 1440] } },
    { id: 'monitor', title: 'Hall Monitor', desc: 'Visit every ordinary room in Halloway.', auto: { allRooms: true } },
    { id: 'friend', title: 'Best Friends (Again)', desc: "Max out Mira's friendship in a single loop.", auto: { bond: { mira: 5 } } },
    { id: 'loop10', title: 'Groundhog Scholar', desc: 'Live through ten Thursdays.', auto: { loop: [10] } },
    { id: 'notebook', title: 'Full Notebook', desc: 'Collect 20 clues.', auto: { clues: 20 } },
    { id: 'chips', title: 'Salt & Vinegar & Salt', desc: 'Buy the same chips five times.', auto: { n: { chips: 5 } }, secret: true },
    { id: 'end_perfect', title: 'Perfect Attendance', desc: 'Reach the Perfect Attendance ending.', secret: true },
    { id: 'end_forever', title: 'Thursday Forever', desc: 'Reach the Thursday Forever ending.', secret: true },
    { id: 'end_dismissal', title: 'Early Dismissal', desc: 'Reach the Early Dismissal ending.', secret: true }
  ];

  // onLoop: checked when a new loop begins. future: endings planned for later chapters.
  D.endings = {
    perfect: {
      title: 'Perfect Attendance', music: 'title',
      onLoop: { loop: [7], maxPhase: 1 },
      hint: 'What happens if you never ask why?',
      blurb: 'You never connected the clues. Halloway was happy to keep you.',
      lines: ['You stopped asking questions somewhere around the sixth Thursday.', 'Every morning: the bell. Every morning: Mira. Every morning, the same good day.',
        'It is a nice day. It really is. The light is warm, and the cafeteria smells like Mystery Meat, and nobody ever has to say goodbye.',
        'You will never be late again.', 'You will never be anything again.']
    },
    forever: {
      title: 'Thursday Forever', music: 'twilight',
      hint: 'Some friendships want the night to never end.',
      blurb: 'You chose to stay on the roof with Mira while the world stood still.',
      lines: ['You and Mira stay on the roof until the stars stop moving.', 'Midnight comes and does not take you. It just... forgets to.',
        'Tomorrow cannot find you up here. Nobody can.', 'Somewhere below, a bell rings, very softly, for no one.', 'Some loops are kinder than endings. Some are not. You decide not to ask which one this is.']
    },
    dismissal: {
      title: 'Early Dismissal', music: 'sublevel',
      hint: 'The chalkboard told you not to trust it. What if you did it anyway, at the very last minute?',
      blurb: 'You ended the day without understanding it. The school did not forgive you.',
      lines: ['You throw the switch at 11:59.', 'The bell rings once, too early, and every clock in the building flinches.', 'In the morning there is no morning. The doors are open. The halls are empty. Even the dust is gone.',
        'You walk out the front gate, and this time the fog lets you through.', 'Halloway is closed. Everyone went home.', 'You never find out whether "home" was somewhere they could still reach.']
    },
    graduation: { title: 'Graduation', future: true, blurb: 'Everyone the Stillwell kept walks out together.' },
    keeper: { title: 'Keeper of Thursday', future: true, blurb: 'You take the Stillwell\'s place.' },
    tomorrow: { title: 'Tomorrow', future: true, blurb: 'The loop ends. Halloway closes. Life goes on, painfully and properly.' },
    eclipse: { title: 'Eclipse', future: true, blurb: 'A secret ending. Someone finally gets to see it.' }
  };
})(window.IS.data);

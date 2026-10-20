// Soundtrack. Every theme is a variation on one four-note "Bell Motif"
// (C-E-G-E), so the music itself loops the way the day does.
// Tokens: note+octave (C5, F#4, Bb3), '.' rest, '-' hold. 8th-note steps.
(function (D) {
  D.music = {
    title: { name: 'Thursday (Music Box)', bpm: 84, wave: 'triangle', leadVol: 0.2, bassWave: 'sine', bassVol: 0.22,
      lead: 'E5 . B4 . G5 . F#5 . E5 . B4 . D5 . C5 . B4 - - . A4 . G4 . A4 . B4 - - .',
      bass: 'E3 - - . B2 - - . C3 - - . G2 - - . A2 - - . E2 - - . A2 - - . B2 - - .' },
    homeroom: { name: 'Homeroom Hum', bpm: 112, wave: 'square', leadVol: 0.13,
      lead: 'C5 . E5 G5 . E5 D5 . C5 . A4 . G4 - - . F4 . A4 C5 . A4 G4 . E4 . G4 . C5 - - .',
      bass: 'C3 . G2 . C3 . G2 . A2 . E2 . A2 . E2 . F2 . C3 . F2 . C3 . G2 . D3 . G2 . B2 .' },
    hall: { name: 'Corridor Count', bpm: 100, wave: 'square', leadVol: 0.1,
      lead: 'A4 . . C5 . . E5 . D5 . . C5 . . B4 . A4 . . C5 . . E5 . G5 . F5 . E5 - - .',
      bass: 'A2 A2 . A2 E2 . A2 . F2 F2 . F2 C3 . F2 . D2 D2 . D2 A2 . D2 . E2 E2 . E2 B2 . E2 .' },
    library: { name: 'Ink & Hush', bpm: 70, wave: 'triangle', leadVol: 0.16, bassWave: 'sine',
      lead: 'D5 F5 A5 F5 C5 E5 G5 E5 Bb4 D5 F5 D5 A4 C#5 E5 . D5 F5 A5 F5 C5 E5 G5 C6 Bb5 A5 G5 F5 E5 - - .',
      bass: 'D3 - - . C3 - - . Bb2 - - . A2 - - . D3 - - . C3 - - . Bb2 - - . A2 - - .' },
    twilight: { name: 'Golden Hour Dismissal', bpm: 88, wave: 'triangle', leadVol: 0.18,
      lead: 'D5 . . A4 . . F5 . E5 . D5 . C5 . A4 . Bb4 . . F4 . . D5 . C5 - - . A4 - - .',
      bass: 'D3 . A2 . D3 . A2 . Bb2 . F2 . Bb2 . F2 . G2 . D3 . G2 . D3 . A2 . E3 . A2 . C#3 .' },
    courtyard: { name: 'Courtyard Weather', bpm: 104, wave: 'square', leadVol: 0.11,
      lead: 'G4 . B4 D5 . B4 . G4 . A4 . B4 - - . . E5 . D5 B4 . G4 . A4 - - . G4 - - .',
      bass: 'G2 . D3 . G2 . D3 . E2 . B2 . E2 . B2 . C3 . G2 . C3 . G2 . D3 . A2 . D3 . F#2 .' },
    night: { name: 'After Hours', bpm: 76, wave: 'triangle', leadVol: 0.16,
      lead: 'C5 . Eb5 G5 . Eb5 D5 . C5 . Ab4 . G4 - - . F4 . Ab4 C5 . Ab4 G4 . Eb4 . G4 . C5 - - .',
      bass: 'C3 . G2 . C3 . G2 . Ab2 . Eb2 . Ab2 . Eb2 . F2 . C3 . F2 . C3 . G2 . D3 . G2 . B2 .' },
    anomaly: { name: 'Between E and G', bpm: 60, wave: 'sawtooth', leadVol: 0.06, bassWave: 'sine', bassVol: 0.25,
      lead: 'C5 . . D5 . . E5 . . F#5 . . G#5 . . A#5 - - - . . G#5 . . E5 . . C5 - - - .',
      bass: 'C2 - - - - - - . F#2 - - - - - - .' },
    sublevel: { name: 'The Stillwell', bpm: 50, wave: 'sine', leadVol: 0.12, bassWave: 'sawtooth', bassVol: 0.1,
      lead: 'B4 . . . . . . . C5 . . . . . . . E5 . . . G4 . . . B4 - - - - - - .',
      bass: 'E1 - - - - - - - F1 - - - - - - -' }
  };
})(window.IS.data);

// Every secret on the site in one list: its name, a riddle-style hint and its codes.
// The Secrets panel shows only the hint until a secret has been found, and only then reveals the name and the codes.
// `arrows` is U / D / L / R (up, down, left, right). Keep every combo the same length so none can end another.
// Easter eggs have no code: they carry `how` instead (shown once found).
export const ARROW_GLYPH = { U: "↑", D: "↓", L: "←", R: "→" };

export const SECRETS = [
  { id: "cyberpunk", name: "The neon side", word: "cyberpunk", also: "override", arrows: "UUDDLRLR", hint: "Four keys, eight presses, and a door with no handle." },
  { id: "overdrive", name: "Overdrive", word: "cyberpunk", also: "override", arrows: "UUDDLRLR", hint: "Already in the neon? Do it again.", note: "the same code, once you are in Cyberpunk" },
  { id: "iddqd", name: "God mode", word: "iddqd", arrows: "UDUDLLRR", hint: "Invincibility, the old-school way." },
  { id: "idkfa", name: "All keys", word: "idkfa", arrows: "LRLRDDUU", hint: "Every key, and your whole stack." },
  { id: "hadouken", name: "Hadouken", word: "hadouken", arrows: "DRDRLULU", hint: "A fighter’s signature move." },
  { id: "party", name: "Party time", word: "party", arrows: "RRUULLDD", hint: "Bring the confetti." },
  { id: "disco", name: "Disco", word: "disco", arrows: "LDRULDRU", hint: "Strobes and spotlights." },
  { id: "snake", name: "Snake", word: "snake", arrows: "RDLURDLU", hint: "A classic that fit on a tiny phone." },
  { id: "hesoyam", name: "Money rain", word: "hesoyam", arrows: "UURRDDLL", hint: "Health, armor and a lot of cash." },
  { id: "bullettime", name: "Bullet time", word: "bullettime", arrows: "DDLLUURR", hint: "Dodge it like in a famous 1999 film." },
  { id: "crt", name: "CRT", word: "crt", arrows: "ULDRULDR", hint: "Back when screens had curves." },
  { id: "warp", name: "Warp speed", word: "warp", arrows: "UDLRUDLR", hint: "Punch it." },
  { id: "flashlight", name: "Lights out", word: "flashlight", arrows: "RLRLUUDD", hint: "Somebody turned the lights off." },
  { id: "fireworks", name: "Fireworks", word: "fireworks", arrows: "ULULDRDR", hint: "Celebrate in the sky." },
  { id: "storm", name: "Storm", word: "storm", arrows: "DLDLURUR", hint: "Check the forecast." },
  { id: "snow", name: "Snowfall", word: "snow", arrows: "DDRRUULL", hint: "Winter, on demand." },
  { id: "glitch", name: "Glitch", word: "glitch", arrows: "URURDLDL", hint: "The screen is having a bad day." },
  { id: "pong", name: "Pong", word: "pong", arrows: "LLRRUDUD", hint: "Two paddles, one ball." },
  { id: "sudo", name: "sudo", word: "sudo", arrows: "DUDULRLR", hint: "Ask nicely, or try for root." },
  { id: "hireme", name: "Hire me", word: "hireme", arrows: "RUULDDRL", hint: "The most useful one of all." },
  { id: "matrix", name: "Matrix", word: "matrix", arrows: "UULLDDRR", hint: "The code is falling." },
  { id: "hello", name: "Hello", word: "hello", arrows: "LUDRLUDR", hint: "Be polite." },
  { id: "coffee", name: "Coffee", word: "coffee", arrows: "DRUDDRUD", hint: "Fuel for the code." },
  // easter eggs
  { id: "logo", name: "Logo fan", how: "Click the AS. logo five times, fast.", hint: "The logo likes attention." },
  { id: "console", name: "Console cowboy", how: "Open the browser console and run hireMe().", hint: "For people who read the console." },
  { id: "tabs", name: "Tab hopper", how: "Switch to another tab, then come back.", hint: "It notices when you leave." },
  { id: "lost", name: "Lost", how: "Land on a page that does not exist.", hint: "Not every path leads somewhere." },
  { id: "xray", name: "X-ray", how: "Hold Shift while hovering a project card (default theme).", hint: "Hold a key, look closer." },
  { id: "dizzy", name: "Dizzy", how: "Drag across the rotating badge in the hero.", hint: "Give it a spin." },
  { id: "name", name: "Name game", how: "Triple-click the big name in the hero.", hint: "Click that name. Again. Again." },
  { id: "bottom", name: "Rock bottom", how: "Keep scrolling when you are already at the very bottom.", hint: "Keep going when there is nothing left." },
  { id: "owl", name: "Night owl", how: "Visit between 2 and 4 in the morning.", hint: "Some people are up late." },
  { id: "copy", name: "Copycat", how: "Copy a longer piece of text from the page.", hint: "Take something with you." },
  { id: "tiny", name: "Tiny", how: "Make the window really small.", hint: "Squeeze it." },
  { id: "patient", name: "Patient one", how: "Stay idle for a minute.", hint: "Good things come to those who wait." },
];

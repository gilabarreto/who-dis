// Game logic, no DOM: index.html renders it, test.js checks it.

// hair: black, brown, blonde, red or white. Missing traits are false.
const CHARACTERS = [
  { name: 'Alex', hair: 'black', mustache: true },
  { name: 'Alfred', hair: 'red', long: true, mustache: true, blueEyes: true },
  { name: 'Anita', woman: true, hair: 'blonde', long: true, blueEyes: true, rosy: true },
  { name: 'Anne', woman: true, hair: 'black', long: true, bigNose: true },
  { name: 'Bernard', hair: 'brown', hat: true, bigNose: true },
  { name: 'Bill', hair: 'red', bald: true, beard: true, rosy: true },
  { name: 'Charles', hair: 'blonde', mustache: true },
  { name: 'Claire', woman: true, hair: 'red', long: true, glasses: true, hat: true },
  { name: 'David', hair: 'blonde', beard: true },
  { name: 'Eric', hair: 'blonde', hat: true },
  { name: 'Frans', hair: 'red' },
  { name: 'George', hair: 'white', hat: true },
  { name: 'Herman', hair: 'red', bald: true, bigNose: true },
  { name: 'Joe', hair: 'blonde', glasses: true },
  { name: 'Maria', woman: true, hair: 'brown', long: true, hat: true },
  { name: 'Max', hair: 'black', mustache: true, bigNose: true },
  { name: 'Paul', hair: 'white', glasses: true },
  { name: 'Peter', hair: 'white', bigNose: true, blueEyes: true },
  { name: 'Philip', hair: 'black', beard: true, rosy: true },
  { name: 'Richard', hair: 'brown', bald: true, beard: true, mustache: true },
  { name: 'Robert', hair: 'brown', bigNose: true, blueEyes: true, rosy: true },
  { name: 'Sam', hair: 'white', bald: true, glasses: true },
  { name: 'Susan', woman: true, hair: 'white', long: true, rosy: true },
  { name: 'Tom', hair: 'black', bald: true, glasses: true, blueEyes: true }
];

// Questions the player can ask about Mark's person, each once.
const QUESTIONS = [
  ['Is it a woman?', c => !!c.woman],
  ['Does your person have black hair?', c => c.hair === 'black'],
  ['Does your person have brown hair?', c => c.hair === 'brown'],
  ['Does your person have blonde hair?', c => c.hair === 'blonde'],
  ['Does your person have red hair?', c => c.hair === 'red'],
  ['Does your person have white hair?', c => c.hair === 'white'],
  ['Is your person bald?', c => !!c.bald],
  ['Does your person wear glasses?', c => !!c.glasses],
  ['Does your person wear a hat?', c => !!c.hat],
  ['Does your person have a beard?', c => !!c.beard],
  ['Does your person have a mustache?', c => !!c.mustache],
  ['Does your person have a big nose?', c => !!c.bigNose],
  ['Does your person have rosy cheeks?', c => !!c.rosy],
  ['Does your person have blue eyes?', c => !!c.blueEyes]
].map(([text, test]) => ({ text, test }));

// Mark asks one of these per round, picked at random.
const MARK_QUESTIONS = [
  'Has your person ever unfriended someone?',
  'Does your person check their ex’s profile?',
  'Does your person use a fake account to stalk people?',
  'Has your person ever searched for themselves online?',
  'Does your person check who viewed their Stories?',
  'Has your person ever blocked someone?',
  'Does your person still follow their ex?',
  'Has your person muted one of their close friends?',
  'Does your person have an embarrassing old Facebook photo?',
  'Does your person spend more than three hours a day on social media?',
  'Does your person regularly stalk people without following them?',
  'Does your person have screenshots of other people’s conversations?',
  'Has your person ever screenshotted someone’s Story?',
  'Has your person complained about their boss on WhatsApp?',
  'Does your person listen to voice messages at 2× speed?'
];

function shuffle(list, rand) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Each round the player asks first, then Mark. One round per player question:
// after the last round Mark wins, so one of Mark's questions is always left unasked.
const ROUNDS = QUESTIONS.length;

// phase: 'pick' (player picks their person), 'ask' (player's turn),
// 'answer' (player answers Mark), then 'won' or 'lost'.
function makeGame(rand = Math.random) {
  return {
    secret: Math.floor(rand() * CHARACTERS.length),
    markQuestions: shuffle(MARK_QUESTIONS, rand),
    asked: new Set(),
    yes: 0,
    round: 1,
    mine: null,
    phase: 'pick'
  };
}

const markQuestion = g => g.markQuestions[g.round - 1];

function pick(g, i) {
  if (g.phase !== 'pick') return;
  g.mine = i;
  g.phase = 'ask';
}

// Returns Mark's truthful answer, or undefined if the question can't be asked now.
function ask(g, q) {
  if (g.phase !== 'ask' || g.asked.has(q) || !QUESTIONS[q]) return;
  g.asked.add(q);
  g.phase = 'answer';
  return QUESTIONS[q].test(CHARACTERS[g.secret]);
}

function answerMark(g, yes) {
  if (g.phase !== 'answer') return;
  if (yes) g.yes++;
  if (g.round === ROUNDS) {
    g.phase = 'lost';
    return;
  }
  g.round++;
  g.phase = 'ask';
}

// Allowed any time during play. A wrong guess loses, like the classic game.
function guess(g, i) {
  if (g.phase !== 'ask' && g.phase !== 'answer') return;
  g.guess = i;
  g.phase = i === g.secret ? 'won' : 'lost';
}

if (typeof module !== 'undefined') {
  module.exports = { CHARACTERS, QUESTIONS, MARK_QUESTIONS, ROUNDS, makeGame, markQuestion, pick, ask, answerMark, guess };
}

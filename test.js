const assert = require('assert');
const { CHARACTERS, QUESTIONS, MARK_QUESTIONS, ROUNDS, makeGame, markQuestion, pick, ask, answerMark, guess } = require('./who.js');

// Seeded rand so failures reproduce.
let s = 42; const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;

// Board: 24 unique names, every hair color is one of the five.
assert.strictEqual(CHARACTERS.length, 24);
assert.strictEqual(new Set(CHARACTERS.map(c => c.name)).size, 24);
assert.ok(CHARACTERS.every(c => ['black', 'brown', 'blonde', 'red', 'white'].includes(c.hair)));
// Every question splits the board, so none is useless.
QUESTIONS.forEach(q => {
  const yes = CHARACTERS.filter(q.test).length;
  assert.ok(yes > 0 && yes < 24, q.text);
});
// Every character can be told apart by the questions.
const sig = c => QUESTIONS.map(q => q.test(c) ? 1 : 0).join('');
assert.strictEqual(new Set(CHARACTERS.map(sig)).size, 24, 'all characters distinguishable');
// One round per player question, and Mark always has a question left for each round.
assert.strictEqual(ROUNDS, QUESTIONS.length);
assert.ok(ROUNDS < MARK_QUESTIONS.length);

// Mark's questions come in a random order, each once.
const g = makeGame(rand);
assert.deepStrictEqual([...g.markQuestions].sort(), [...MARK_QUESTIONS].sort());
assert.ok(g.secret >= 0 && g.secret < 24);

// Nothing happens before the player picks their person.
assert.strictEqual(ask(g, 0), undefined);
guess(g, g.secret);
assert.strictEqual(g.phase, 'pick');
pick(g, 3);
assert.strictEqual(g.mine, 3);

// The player asks first; Mark answers truthfully, then asks his question.
assert.strictEqual(g.phase, 'ask');
answerMark(g, true);
assert.strictEqual(g.yes, 0, 'Mark waits his turn');
assert.strictEqual(ask(g, 0), QUESTIONS[0].test(CHARACTERS[g.secret]));
assert.strictEqual(g.phase, 'answer');
assert.strictEqual(ask(g, 1), undefined, 'must answer Mark first');
const first = markQuestion(g);
answerMark(g, true);
assert.strictEqual(g.yes, 1);
assert.strictEqual(g.round, 2);
assert.notStrictEqual(markQuestion(g), first);
assert.strictEqual(ask(g, 0), undefined, 'same question twice');

// Right guess wins, even right after getting an answer.
ask(g, 1);
assert.strictEqual(g.phase, 'answer');
guess(g, g.secret);
assert.strictEqual(g.phase, 'won');
answerMark(g, true);
assert.strictEqual(g.phase, 'won', 'game over stays over');

// Wrong guess loses.
const w = makeGame(rand);
pick(w, 0);
guess(w, (w.secret + 1) % 24);
assert.strictEqual(w.phase, 'lost');
assert.strictEqual(w.guess, (w.secret + 1) % 24);

// Asking everything and never guessing: Mark wins after the last round.
const out = makeGame(rand);
pick(out, 0);
QUESTIONS.forEach((_, q) => {
  assert.strictEqual(out.phase, 'ask');
  assert.notStrictEqual(ask(out, q), undefined);
  answerMark(out, true);
});
assert.strictEqual(out.phase, 'lost');
assert.strictEqual(out.round, ROUNDS);
assert.strictEqual(out.guess, undefined, 'lost without guessing');
assert.strictEqual(out.yes, ROUNDS);

// The last answer can still be used for a guess before answering Mark's last question.
const last = makeGame(rand);
pick(last, 0);
QUESTIONS.forEach((_, q) => { ask(last, q); if (q < ROUNDS - 1) answerMark(last, false); });
assert.strictEqual(last.phase, 'answer');
guess(last, last.secret);
assert.strictEqual(last.phase, 'won');
console.log('ok');

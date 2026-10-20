# Mon Vocabulaire 🇫🇷

A simple French vocab flashcard web app — built for B1 practice.

- Organize words by unit
- Flip cards: French word → translation + example sentence
- Simple spaced repetition (box system: Again / Good / Easy), much simpler than Anki
- Add your own words anytime from the "Manage" tab
- Everything is stored locally in your browser (localStorage) — no account needed
- Export/Import JSON backup so you don't lose your progress

## Use it
Open the deployed GitHub Pages link (see repo settings) on your phone or desktop — add it to your home screen for an app-like feel.

## How the spaced repetition works
Every card starts at level 0 (due today). Grading a card:
- **Again** → stays due, you'll see it again this session
- **Good** → next review in 1 → 3 → 7 → 16 → 30 days (doubles each time you get it right)
- **Easy** → skips ahead two levels

## Local development
Just open `index.html` in a browser — no build step, no dependencies.

# Campaign Hub

A phone-first D&D campaign hub. Players browse character options, build a level 1 character, and see exactly what to roll. The DM decides what players can see. It works offline at the table and syncs when a connection comes back.

## How it works

- **Installable app.** Open the link once on good internet and use "Add to Home Screen". After that it opens like an app and runs with no connection.
- **Demo mode.** While `src/lib/firebaseConfig.js` is `null`, everything is saved on one device. Good for trying it out.
- **Synced mode.** With a Firebase config filled in, the DM signs in with Google, creates a campaign, and gets a join code. Players type the code once; no accounts for them. Firestore keeps a copy on every phone, so reads work offline and the DM's edits queue up until there's internet.

## Setup checklist

1. **Firebase project** (console.firebase.google.com): create a project, add a **Web app**, and paste its config object into `src/lib/firebaseConfig.js`.
2. **Firestore**: create a database (production mode), then paste `firestore.rules` into the Rules tab and publish.
3. **Sign-in**: Authentication > Sign-in method > enable **Google**. Under Settings > Authorized domains, add your GitHub Pages domain (`<username>.github.io`).
4. **GitHub Pages**: push to `main`, then Settings > Pages > Source: **GitHub Actions**. The workflow in `.github/workflows/deploy.yml` builds and publishes.

## Development

```
npm install
npm run dev      # local preview
npm run build    # production build in dist/
```

## Where things live

- `src/lib/seed.js`: starting races, backgrounds and classes (all editable in DM mode)
- `src/lib/character.js`: character math and the "What do I roll?" cards
- `src/lib/rules.js`: abilities, skills, weapons
- `src/lib/store.jsx`: demo and Firebase data, offline sync status
- `src/pages/`: screens
- `src/styles.css`: the four themes and text sizes

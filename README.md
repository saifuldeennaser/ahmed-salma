# Salma & Ahmed Wedding Invitation

This is a mobile-first wedding invitation website with a reply form backed by a Node.js/Express server.

## What is included

- `index.html` — landing page with invitation prompt
- `invitation.html` — mobile-only invitation page
- `admin.html` — admin page for viewing saved replies
- `style.css` — shared site styling
- `script.js` — countdown, modal, mobile-blocking logic, reply form submit
- `server.js` — Express server serving static files and `/api/replies`
- `responses.json` — stored reply data
- `package.json` — Node dependency manifest

## Run locally

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

## Published deployment

This app works best on a platform that supports Node.js apps, such as Render, Railway, or Fly.io.

### Deploy on Render

1. Create a GitHub repository and push this project.
2. Sign in at `https://render.com`.
3. Create a new **Web Service**.
4. Connect your GitHub repository.
5. Set the root directory to the repo root.
6. Use these commands:
   - Build command: `npm install`
   - Start command: `npm start`
7. Deploy.

Render will provide a public URL where the app can be accessed.

### Notes

- `admin.html` is available on any device.
- `invitation.html` is optimized for mobile only.
- Replies are stored in `responses.json`, so redeploying may reset reply data depending on your host.

## Git setup

If the project is not yet a git repo, initialize it:

```bash
git init
git add .
git commit -m "Initial commit"
```

Then push to GitHub and deploy from there.

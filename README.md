# Birthday Wish (MERN-lite)

A tiny full-stack birthday wishing website:

- **Client:** React + Vite (creative animations + confetti canvas)
- **Server:** Express API (`/api/message`)
- **MongoDB:** not used yet (easy to add later)

## Quick start

1) Install deps:

```bash
npm install
```

2) Run both client + server:

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:5174

## Customize names/message

Server reads env vars:

```bash
FRIEND_NAME="Her Name" FROM_NAME="Your Name" npm run dev:server
```

If you want to customize the wish text, edit:

- `server/src/routes.js`

## Add photos later

- Put images in `client/src/assets/`
- Update UI in `client/src/ui/App.jsx`

## Add music (optional)

If you want the **Music** button to work, add a file:

- `client/public/happy-birthday.ogg`


# Ocean Professional Game Frontend (React)

Modern, lightweight game UI implemented in React with a clean layout and blue/amber accents.

## Quick Start

- Install dependencies: `npm install`
- Start dev server: `npm start` (default http://localhost:3000)
- Build production: `npm run build`

Ensure required environment variables are set (see `.env.example`).

## Theme

The Ocean Professional theme is defined in `src/styles/theme.css`:
- Primary: `#2563EB` (blue)
- Secondary: `#F59E0B` (amber)
- Background/Surface/Text variables with dark mode support via `html[data-theme]`.

Toggle theme using the header button.

## App Structure

```
src/
  components/
    common/
      Button.jsx
      Icon.jsx
    game/
      Cell.jsx
      GameBoard.jsx
      HUD.jsx
      Controls.jsx
      ScorePanel.jsx
      Timer.jsx
    layout/
      Header.jsx
      Sidebar.jsx
      Footer.jsx
      PageContainer.jsx
  hooks/
    useTheme.js
    useWebSocket.js
  pages/
    Home.jsx
    Game.jsx
    Settings.jsx
    HowToPlay.jsx
  utils/
    env.js
  styles/
    theme.css
  App.js
  index.js
```

## Routing

Implemented using `react-router-dom`:
- `/` Home
- `/game` Game
- `/settings` Settings
- `/how-to-play` How To Play

## WebSocket

Hook `useWebSocket(path, options)` builds the URL from `REACT_APP_WS_URL` and auto-reconnects.
- Use `send(payload)` to publish messages.
- Subscribe with `onMessage` option.

## Environment Variables

See `.env.example`. Do not commit real values. At minimum:
- `REACT_APP_API_BASE` or `REACT_APP_BACKEND_URL`
- `REACT_APP_WS_URL`
- `REACT_APP_FRONTEND_URL`

## Accessibility

- Buttons and interactive components include proper ARIA where applicable.
- Color contrast maintained with theme choices.

## Notes

This is a scaffold following the Figma theme. Wire up actual game logic and server events as backend contracts are defined.

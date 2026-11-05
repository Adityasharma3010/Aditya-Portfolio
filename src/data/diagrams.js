/*
  Case study diagrams, written from each project's README (nothing here is invented detail).
  nodes: x/y are the CENTRE of the box on a 1000 x h canvas. type picks the colour:
         client = accent, api = accent2, data = accent3, service = neutral
  edges: [fromId, toId, "label", { dashed: true }?]
  flows: numbered step lists (auth flows, sharing flows)
*/
export const diagrams = {
  ordly: {
    architecture: {
      h: 420,
      nodes: [
        { id: "client", label: "React app", sub: "Vite · Tailwind · Motion", x: 100, y: 210, type: "client" },
        { id: "queue", label: "Write queue", sub: "ordered · retry", x: 365, y: 90, type: "api" },
        { id: "auth", label: "Supabase Auth", sub: "accounts + sessions", x: 365, y: 330, type: "service" },
        { id: "db", label: "Postgres + RLS", sub: "private by default", x: 640, y: 90, type: "data" },
        { id: "rt", label: "Realtime", sub: "row changes", x: 640, y: 330, type: "service" },
        { id: "peers", label: "Other editors", sub: "live updates", x: 895, y: 210, type: "client" },
      ],
      edges: [
        ["client", "queue", "edits"],
        ["queue", "db", "writes"],
        ["client", "auth", "sign in"],
        ["auth", "db", "identity", { dashed: true }],
        ["db", "rt", "changes"],
        ["rt", "peers", "push"],
      ],
    },
    flows: [
      {
        title: "Share links",
        steps: [
          { actor: "Owner", text: "Creates a view link or an edit link for a list." },
          { actor: "Visitor", text: "Opens the link. A view link needs no account." },
          { actor: "Visitor", text: "An edit link asks them to sign in, then adds them as an editor." },
          { actor: "Owner", text: "Revokes the link at any time and everyone who joined through it loses access." },
        ],
      },
    ],
  },

  "free-games-tracker": {
    architecture: {
      h: 440,
      nodes: [
        { id: "app", label: "React PWA", sub: "installable PWA", x: 125, y: 220, type: "client" },
        { id: "gp", label: "GamerPower API", sub: "free giveaways", x: 460, y: 80, type: "service" },
        { id: "fn", label: "Vercel Functions", sub: "Steam proxy · OpenID", x: 460, y: 220, type: "api" },
        { id: "steam", label: "Steam Web API", sub: "wishlist · library", x: 810, y: 150, type: "data" },
        { id: "rss", label: "Publisher RSS", sub: "Xbox · PS · Ubisoft", x: 810, y: 350, type: "service" },
      ],
      edges: [
        ["app", "gp", "giveaways"],
        ["app", "fn", "Steam + news"],
        ["fn", "steam", "key on server"],
        ["fn", "rss", "free-trial news"],
      ],
    },
  },

  binkeyit: {
    architecture: {
      h: 440,
      nodes: [
        { id: "client", label: "React 19 + Redux", sub: "Vite · Tailwind", x: 100, y: 220, type: "client" },
        { id: "axios", label: "Axios interceptor", sub: "token + refresh", x: 385, y: 90, type: "api" },
        { id: "api", label: "Express 5 API", sub: "JWT · roles · helmet", x: 640, y: 220, type: "api" },
        { id: "db", label: "MongoDB", sub: "Mongoose models", x: 890, y: 90, type: "data" },
        { id: "cld", label: "Cloudinary", sub: "category images", x: 890, y: 220, type: "service" },
        { id: "mail", label: "Resend", sub: "verify + OTP emails", x: 890, y: 350, type: "service" },
      ],
      edges: [
        ["client", "axios", "requests"],
        ["axios", "api", "REST"],
        ["api", "db", "queries"],
        ["api", "cld", "uploads"],
        ["api", "mail", "emails"],
      ],
    },
    flows: [
      {
        title: "Authentication flow",
        steps: [
          { actor: "Register", text: "A verification email is sent through Resend before the account is active." },
          { actor: "Login", text: "The server issues an access token and a refresh token stored in an httpOnly cookie." },
          { actor: "Request", text: "The Axios interceptor attaches the access token to every call." },
          { actor: "Expired", text: "On a 401 the interceptor silently asks for a new access token with the refresh cookie and retries." },
          { actor: "Forgot password", text: "An OTP is emailed, verified, then the new password is saved hashed with bcrypt." },
        ],
      },
    ],
  },

  "book-store-app": {
    architecture: {
      h: 280,
      nodes: [
        { id: "client", label: "React + Vite", sub: "protected Course route", x: 150, y: 140, type: "client" },
        { id: "api", label: "Express REST API", sub: "controllers · bcrypt auth", x: 500, y: 140, type: "api" },
        { id: "db", label: "MongoDB Atlas", sub: "Mongoose models", x: 850, y: 140, type: "data" },
      ],
      edges: [
        ["client", "api", "Axios"],
        ["api", "db", "Mongoose"],
      ],
    },
  },

  "game-deal-alerts": {
    architecture: {
      h: 440,
      nodes: [
        { id: "app", label: "React dashboard", sub: "wishlist · GSAP", x: 115, y: 150, type: "client" },
        { id: "sb", label: "Supabase", sub: "Auth + database", x: 430, y: 150, type: "data" },
        { id: "gha", label: "GitHub Actions", sub: "runs every 6 hours", x: 430, y: 340, type: "api" },
        { id: "stores", label: "Steam + GMG", sub: "price checks", x: 780, y: 340, type: "service" },
        { id: "mail", label: "Resend", sub: "alert emails", x: 850, y: 150, type: "service" },
      ],
      edges: [
        ["app", "sb", "wishlist + auth"],
        ["gha", "sb", "reads wishlist", { dashed: true }],
        ["gha", "stores", "prices"],
        ["gha", "mail", "alerts"],
      ],
    },
  },

  "games-listing": {
    architecture: {
      h: 260,
      nodes: [
        { id: "client", label: "React + Router", sub: "search · filters", x: 220, y: 130, type: "client" },
        { id: "rawg", label: "RAWG API", sub: "games, stores, ratings", x: 780, y: 130, type: "service" },
      ],
      edges: [["client", "rawg", "fetch"]],
    },
  },

  "weather-app": {
    architecture: {
      h: 260,
      nodes: [
        { id: "client", label: "React app", sub: "city search", x: 220, y: 130, type: "client" },
        { id: "owm", label: "OpenWeather API", sub: "live conditions", x: 780, y: 130, type: "service" },
      ],
      edges: [["client", "owm", "fetch by city"]],
    },
  },
};

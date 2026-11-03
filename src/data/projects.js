import { laslesvpn, weatherapp, gameslisting } from "../assets";
import repos from "./repos.json";
import gh from "./github.json"; // filled by `npm run sync:github`, safe to leave empty

/*
  Project content is written from each repo's README.
  - repos.json   : repo name + live url per project (also used by the sync/screenshot scripts)
  - github.json  : real created date, last push, stars, languages (npm run sync:github)
  - screenshots  : src/assets/projects/<slug>.(jpg|png|webp), made by `npm run shots`
  createdAt below = first commit, replaced by the real repo creation date once github.json exists.
*/
const raw = [
  {
    slug: "game-deal-alerts",
    name: "GamePulse",
    createdAt: "2026-10-30", // replaced by sync:github
    category: "Web app",
    status: "Active",
    summary: "A game wishlist and price-alert dashboard that emails you when a deal lands.",
    overview:
      "GamePulse is a game wishlist and price-alert dashboard built with React, Vite, Supabase and GSAP. Add the games you want, choose which store to watch, and a scheduled monitor checks prices every six hours and emails you through Resend the moment an alert triggers.",
    features: [
      { title: "Wishlist dashboard", desc: "A React + Vite dashboard with Supabase Auth and database tables, animated with GSAP on both the landing page and the dashboard." },
      { title: "Per-game store selection", desc: "Choose Steam only, Green Man Gaming only, or both for every game you add." },
      { title: "Regional GMG tracking", desc: "Green Man Gaming listings are mapped explicitly with the exact official product URL and a two-letter region code, so prices match your region." },
      { title: "Scheduled monitoring", desc: "A GitHub Actions workflow checks Steam and the mapped GMG listings every six hours, with Vercel API routes and secrets kept off the client." },
      { title: "Email alerts", desc: "Triggered alert events are emailed through Resend to the address on your Supabase Auth account." },
    ],
    stack: [
      { label: "Frontend", items: ["React", "Vite", "Tailwind CSS v4", "GSAP"] },
      { label: "Backend", items: ["Supabase Auth", "Supabase Database", "Vercel API routes", "GitHub Actions"] },
      { label: "Services", items: ["Resend", "Steam", "Green Man Gaming"] },
    ],
  },
  {
    slug: "ordly",
    name: "Ordly",
    createdAt: "2026-10-14",
    category: "Web app",
    status: "In development",
    summary: "Lists that stay put: a checklist app with accounts, auto-save and secure sharing.",
    overview:
      "A checklist app with accounts, automatic saving and secure list sharing. Lists are private by default, can be shared through view or edit links that you can revoke at any time, and keep syncing live between everyone who has access. Without Supabase keys it even runs in a local dev mode so the UI can be built offline.",
    features: [
      { title: "Private by default", desc: "Row Level Security in Postgres means a list is only visible to its owner and the people added to it. The browser only ever holds the public anon key." },
      { title: "View and edit share links", desc: "Anyone can open a view link without an account. Edit links add you as an editor once you sign in, and revoking a link removes everyone who joined through it." },
      { title: "Saving that never loses work", desc: "Every write goes through one ordered queue with debounced text edits, automatic retry when you come back online, and client-generated IDs so retries can't create duplicates." },
      { title: "Live collaboration", desc: "Supabase Realtime pushes changes to everyone on the list, and writes are field-level patches so nobody overwrites anybody else." },
      { title: "Drag to reorder", desc: "Fractional positions mean a drag rewrites a single row. Works with mouse, touch handles and the keyboard." },
    ],
    stack: [
      { label: "Frontend", items: ["React", "Vite", "Tailwind CSS v4", "Motion", "dnd-kit", "React Router", "Lucide"] },
      { label: "Backend", items: ["Supabase", "Postgres", "Row Level Security", "Realtime"] },
    ],
  },
  {
    slug: "clam-generator",
    name: "Clamp Generator",
    createdAt: "2026-08-07",
    category: "Developer tool",
    status: "Live tool",
    summary: "Fluid CSS clamp() values between two viewports, with % unit support.",
    overview:
      "A small developer tool that generates fluid CSS clamp() values between two viewports. Pick your minimum and maximum sizes and the viewport range and copy the result straight into your stylesheet. Built with React, Tailwind and GSAP.",
    features: [
      { title: "Fluid values between two viewports", desc: "Define the smallest and largest size plus the viewport range and get a ready-to-paste clamp()." },
      { title: "Six unit types", desc: "Works with px, rem, em, vw, vh and %, including mixed use." },
      { title: "Deploys in one click", desc: "A plain Vite build that Vercel picks up with zero config." },
    ],
    stack: [{ label: "Built with", items: ["React", "Tailwind CSS", "GSAP", "Vite", "Vercel"] }],
  },
  {
    slug: "free-games-tracker",
    name: "Free Games Tracker",
    createdAt: "2026-08-24",
    category: "PWA",
    status: "Production",
    summary: "Free game giveaways across stores, plus deep Steam integration.",
    overview:
      "A gaming web app that tracks free game giveaways across PC and console stores and connects to your Steam account to show your wishlist, library, profile and friend comparisons. Giveaway data comes live from the GamerPower API, while Steam features run through small Vercel serverless functions so the Steam API key never reaches the browser.",
    features: [
      { title: "Live giveaways", desc: "Free games and DLC from GamerPower with platform and type filters, sorting, a favourites list and a 10-minute client cache." },
      { title: "Spotted in publisher news", desc: "Scans Xbox Wire, PlayStation Blog and Ubisoft News feeds for free-trial and free-weekend announcements." },
      { title: "Sign in with Steam", desc: "Steam OpenID verified on the server, or just enter a Steam ID. Wishlist, library, profile and stats pages." },
      { title: "Game detail pages", desc: "Screenshots, HLS trailers with a quality menu, reviews and achievement lists with rarity." },
      { title: "Compare with friends", desc: "One-on-one and group compare with overlap, a match score, shareable public links and a downloadable share card." },
      { title: "Installable PWA", desc: "Network-first service worker, dark and light themes with per-platform accent colours." },
    ],
    stack: [
      { label: "Frontend", items: ["React 18", "Vite", "React Router", "Tailwind CSS 4", "Framer Motion", "hls.js"] },
      { label: "Backend", items: ["Vercel Functions", "Node.js", "Steam Web API", "Steam OpenID", "fast-xml-parser"] },
      { label: "Data", items: ["GamerPower API", "Steam Store", "Publisher RSS"] },
    ],
  },
  {
    slug: "binkeyit",
    name: "Binkeyit",
    createdAt: "2026-01-20",
    category: "MERN stack",
    status: "In progress",
    summary: "A Blinkit-inspired quick-commerce app with real auth and an admin dashboard.",
    overview:
      "A full-stack grocery and quick-commerce app inspired by Blinkit, built on the MERN stack. Users can register, verify their account, log in, manage their profile and avatar, and reset a forgotten password with an OTP. Admins get a protected dashboard to manage product categories with image uploads. Product listing, cart and orders are scaffolded and next on the roadmap.",
    features: [
      { title: "Production-style auth", desc: "JWT access tokens plus refresh tokens in httpOnly cookies, with automatic refresh through an Axios interceptor and bcrypt password hashing." },
      { title: "Email verification and OTP reset", desc: "Transactional emails through Resend for account verification and the forgot-password flow." },
      { title: "Role-based access", desc: "USER and ADMIN roles with an admin-only route guard on the client and protected endpoints on the server." },
      { title: "Category management", desc: "Admins add, edit and delete categories with image uploads to Cloudinary." },
      { title: "Profile and avatar", desc: "Update details and upload or remove an avatar, with global user state in Redux Toolkit." },
    ],
    stack: [
      { label: "Frontend", items: ["React 19", "Vite 7", "React Router 7", "Redux Toolkit", "Tailwind CSS 4", "Axios"] },
      { label: "Backend", items: ["Node.js", "Express 5", "MongoDB", "Mongoose", "JWT", "bcryptjs", "helmet"] },
      { label: "Services", items: ["Cloudinary", "Resend", "multer"] },
    ],
  },
  {
    slug: "book-store-app",
    name: "Book Store App",
    createdAt: "2025-12-03",
    category: "MERN stack",
    status: "Live",
    summary: "A MERN book store with auth, protected routes and a free-courses slider.",
    overview:
      "A full-stack book store built with MongoDB, Express, React and Node.js. Users can sign up, log in, browse books and courses and see the free offerings. Passwords are hashed, the Course page sits behind a protected route, and all data lives in MongoDB Atlas behind a REST API.",
    features: [
      { title: "Signup, login and logout", desc: "Passwords hashed with bcrypt and validated forms with React Hook Form." },
      { title: "Protected routes", desc: "The Course page is only reachable when you are logged in." },
      { title: "Free courses slider", desc: "A responsive carousel for the free offerings built with React Slick." },
      { title: "Dark and light theme", desc: "A DaisyUI-powered theme toggle, with toast notifications for feedback." },
      { title: "REST API on Atlas", desc: "Express controllers and Mongoose models serving books and users from MongoDB Atlas." },
    ],
    stack: [
      { label: "Frontend", items: ["React", "Vite", "React Router", "Tailwind CSS", "DaisyUI", "Axios", "React Hook Form"] },
      { label: "Backend", items: ["Node.js", "Express", "MongoDB Atlas", "Mongoose", "bcryptjs"] },
    ],
  },
  {
    slug: "games-listing",
    name: "Games Listing",
    createdAt: "2025-07-26",
    category: "Web app",
    status: "Live",
    summary: "A video game discovery platform powered by the RAWG API.",
    overview:
      "A sleek, responsive game discovery platform built with React, Vite, Tailwind CSS and React Router on top of the RAWG API. Browse what's trending, see what's coming next, search by name, filter by genre or platform and open a detail page for any game with its description, platforms, stores and ratings.",
    features: [
      { title: "Trending and upcoming", desc: "The latest popular games and the next big releases in one place." },
      { title: "Search and filters", desc: "Find games by name and narrow them down by genre or platform." },
      { title: "Game detail pages", desc: "Description, platforms, stores and ratings on clean per-game routes." },
      { title: "Fast and responsive", desc: "Vite-built and tuned for desktop, tablet and mobile." },
    ],
    stack: [{ label: "Built with", items: ["React", "Vite", "Tailwind CSS", "React Router", "RAWG API", "Vercel"] }],
    image: gameslisting,
  },
  {
    slug: "weather-app",
    name: "Weather App",
    createdAt: "2025-07-21",
    category: "Web app",
    status: "Live",
    summary: "Real-time weather for any city in a clean, responsive UI.",
    overview:
      "A clean, modern weather app built with React and the OpenWeather API. Search any city in the world and see live temperature, humidity, wind speed and conditions with matching icons, with graceful handling for cities that can't be found.",
    features: [
      { title: "City search", desc: "Instant results for any city worldwide." },
      { title: "Real-time data", desc: "Temperature, humidity, wind speed and conditions fetched live from OpenWeather." },
      { title: "Friendly errors", desc: "Invalid city names and failed requests are handled without breaking the UI." },
      { title: "Responsive", desc: "Works across desktop, tablet and mobile." },
    ],
    stack: [{ label: "Built with", items: ["React", "OpenWeather API", "Tailwind CSS", "Vercel"] }],
    image: weatherapp,
  },
  {
    slug: "laslesvpn",
    name: "LaslesVPN",
    createdAt: "2025-07-01",
    category: "Landing page",
    status: "Live",
    summary: "A responsive VPN landing page built with Tailwind CSS.",
    overview:
      "A modern, fully responsive one-page site for a fictional VPN brand, highlighting features, pricing plans, testimonials and global connectivity. Built with plain HTML, Tailwind CSS and a little JavaScript, with a clean input.css to output.css build.",
    features: [
      { title: "Fully responsive", desc: "Optimised for mobile, tablet and desktop with flexbox and grid utilities." },
      { title: "Reusable sections", desc: "Features, pricing, testimonials and a global network section." },
      { title: "Lightweight", desc: "No frameworks and minimal scripts, deployed on Vercel." },
    ],
    stack: [{ label: "Built with", items: ["HTML5", "Tailwind CSS", "JavaScript", "Vercel"] }],
    image: laslesvpn,
  },
];

// screenshots made by `npm run shots` (or dropped in by hand)
const dropped = import.meta.glob("../assets/projects/*.{png,jpg,jpeg,webp}", { eager: true, import: "default" });
const droppedBySlug = Object.fromEntries(
  Object.entries(dropped).map(([path, url]) => [path.split("/").pop().replace(/\.\w+$/, ""), url])
);

const flatTags = (p) => p.stack.flatMap((g) => g.items).slice(0, 4);

export const projects = raw
  .map((p) => {
    const meta = repos[p.slug] || {};
    const g = gh[p.slug] || {};
    return {
      ...p,
      createdAt: g.createdAt || p.createdAt,
      tags: flatTags(p),
      image: droppedBySlug[p.slug] || p.image || null,
      source: `https://github.com/${meta.repo}`,
      site: meta.live || g.homepage || null,
      github: g.repo ? g : null, // { pushedAt, stars, forks, languages }
    };
  })
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .map((p, i, arr) => ({ ...p, index: String(arr.length - i).padStart(2, "0") }));

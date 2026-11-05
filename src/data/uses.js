/*
  The /uses page. Groups with no items are hidden, so add your own hardware and editor lines
  to the last group and they appear automatically.
*/
export const uses = [
  {
    title: "Front end",
    items: [
      { name: "React", note: "Vite builds, React Router for pages" },
      { name: "Tailwind CSS", note: "design tokens as CSS variables, so themes are cheap" },
      { name: "GSAP", note: "ScrollTrigger, SplitText, Flip, ScrambleText, DrawSVG, MotionPath" },
      { name: "Lenis", note: "smooth scroll, switched off for reduced motion" },
      { name: "Three.js", note: "only for the star field, loaded on demand" },
    ],
  },
  {
    title: "Back end and data",
    items: [
      { name: "Node.js + Express", note: "REST APIs, JWT auth, role based access" },
      { name: "MongoDB + Mongoose", note: "MERN projects" },
      { name: "Supabase", note: "Postgres, Auth, Row Level Security, Realtime" },
      { name: "Vercel Functions", note: "contact form, GitHub activity, Steam proxy" },
      { name: "Resend", note: "transactional email" },
      { name: "Cloudinary", note: "image uploads" },
    ],
  },
  {
    title: "WordPress",
    items: [
      { name: "Bricks Builder", note: "client sites and affiliate listings" },
      { name: "WPCode", note: "custom CSS and JS without touching theme files" },
      { name: "Elementor, Oxygen, Kadence", note: "earlier client work" },
    ],
  },
  {
    title: "Build and ship",
    items: [
      { name: "Vite", note: "dev server and production builds" },
      { name: "Vercel", note: "hosting, preview deploys, serverless functions" },
      { name: "Git + GitHub", note: "GitHub Actions for scheduled jobs" },
      { name: "ESLint", note: "kept clean on every change" },
      { name: "Playwright", note: "project screenshots and smoke tests" },
    ],
  },
  {
    title: "Languages",
    items: [
      { name: "JavaScript", note: "daily driver" },
      { name: "HTML, CSS", note: "" },
      { name: "C, C++, Python", note: "college and side projects" },
      { name: "Unreal Engine", note: "games, when I need a break from the browser" },
    ],
  },
  // Add your editor, terminal, hardware, fonts and so on here:
  // { title: "Hardware and editor", items: [{ name: "VS Code", note: "theme, extensions" }] },
];

/*
  What changed on this site, newest first. Add an entry at the top whenever you ship something:
  { date: "YYYY-MM-DD", title: "Short headline", items: ["What changed", "..."] }
*/
export const changelog = [
  {
    date: "2026-11-10",
    title: "Work with me, guestbook and an installable site",
    items: [
      "New Work with me page: what I build, how I work and how to get in touch.",
      "A guestbook where visitors can leave a message. Every message is approved before it shows up.",
      "The site can now be installed as an app and opens offline.",
      "A real resume.pdf to download, replacing print-to-PDF.",
      "Projects can be filtered by type and by tech.",
      "A quiet corner of the site with write-ups got new entries and some housekeeping. It is not signposted, on purpose.",
      "Accessibility pass: a skip link, clear keyboard focus, labelled forms and better contrast.",
      "Smaller images (the biggest screenshot went from 1.8 MB to about 100 KB) and a CI check that lints, builds and smoke-tests every push.",
      "Project cards can play short looping clips, and this changelog is new too.",
    ],
  },
  {
    date: null,
    title: "The first version",
    items: [
      "Portfolio built with React, GSAP and Tailwind: animated hero, pinned project scroller and case studies with drawn architecture diagrams.",
      "Real contact form with spam protection, live GitHub activity, a command palette (Ctrl or Cmd + K) and a light and dark theme.",
      "Per-page SEO with a sitemap and share images, /uses, /notes and /resume pages, and a reduced-motion switch.",
    ],
  },
];

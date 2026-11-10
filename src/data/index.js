import {
  html,
  css,
  javascript,
  reactjs,
  tailwind,
  nodejs,
  git,
  mysql,
  wordpress,
  cplusplus,
  python,
  unreal,
  threejs,
  gsapLogo,
  expressLogo,
  mongodbLogo,
  supabaseLogo,
  bricksLogo,
  bcit,
  si,
} from "../assets";

export const profile = {
  name: "Aditya Sharma",
  short: "Aditya",
  email: "nakul.adi@gmail.com",
  github: "https://github.com/Adityasharma3010",
  // paste your cal.com / Calendly link here (e.g. "https://cal.com/yourname/intro"). Empty = every "Book a call" button stays hidden.
  booking: "",
  roles: ["Full Stack Developer", "React / MERN", "WordPress & Bricks", "Motion nerd"],
};

export const navLinks = [
  { id: "about", title: "About" },
  { id: "work", title: "Work" },
  { id: "experience", title: "Experience" },
  { id: "contact", title: "Contact" },
];

export const stats = [
  { value: 3, suffix: "+", label: "Years shipping" },
  { value: 9, suffix: "", label: "Projects built" },
  { value: 2, suffix: "", label: "Stacks: MERN & WP" },
];

export const about =
  "I build fast, good looking websites and web apps. React and the MERN stack for products, WordPress with Bricks Builder for client sites, and a lot of care for the small motion details that make an interface feel alive. I also write C, C++ and Python, and I make games in Unreal Engine when I need a break from the browser.";

// icon is optional, chips without one get a dot
export const stack = [
  { name: "React", icon: reactjs },
  { name: "JavaScript", icon: javascript },
  { name: "Tailwind CSS", icon: tailwind },
  { name: "GSAP", icon: gsapLogo, wide: true },
  { name: "Node.js", icon: nodejs },
  { name: "Express", icon: expressLogo, mono: true },
  { name: "MongoDB", icon: mongodbLogo },
  { name: "Supabase", icon: supabaseLogo },
  { name: "Three.js", icon: threejs, mono: true },
  { name: "HTML 5", icon: html },
  { name: "CSS 3", icon: css },
  { name: "WordPress", icon: wordpress },
  { name: "Bricks Builder", icon: bricksLogo },
  { name: "MySQL", icon: mysql },
  { name: "Git", icon: git },
  { name: "Python", icon: python },
  { name: "C++", icon: cplusplus },
  { name: "Unreal Engine", icon: unreal, mono: true },
];

// newest first. Each role is its own row so the timeline reads clearly.
export const experiences = [
  {
    title: "Web Developer",
    company: "Black Cap IT",
    icon: bcit,
    date: "May 2026 - Present",
    points: [
      "Promoted from Junior Web Developer after taking on React work end to end.",
      "Built a dynamic client dashboard in React with better interactivity and data visualisation.",
      "Ship custom React + Tailwind tools and sites, plus WordPress builds with Bricks Builder.",
    ],
  },
  {
    title: "Junior Web Developer",
    company: "Black Cap IT",
    icon: bcit,
    date: "May 2024 - May 2026",
    points: [
      "Designed and developed full websites with HTML, CSS, Bootstrap, WordPress, Elementor, Oxygen, Kadence, JavaScript and jQuery.",
      "Moved into React.js from Aug 2025 and built a Weather App and a Games Listing site with React and Tailwind.",
      "Contributed custom solutions and enhancements across client projects.",
    ],
  },
  {
    title: "Trainee Web Developer",
    company: "Black Cap IT",
    icon: bcit,
    date: "Dec 2023 - May 2024",
    points: [
      "Worked on the front end of a management system, improving the UI and experience.",
      "Helped make the system more efficient and user friendly.",
      "Built a solid base in front end development and client focused delivery.",
    ],
  },
  {
    title: "Software Development",
    company: "Solitaire Infosys",
    icon: si,
    date: "Jan 2022 - Jun 2022",
    points: [
      "Worked on the front end of a management system, improving the UI and experience.",
      "Helped make the system more efficient and user friendly.",
    ],
  },
];

export { projects } from "./projects";

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });

import {
  mobile,
  backend,
  creator,
  web,
  javascript,
  typescript,
  html,
  css,
  reactjs,
  redux,
  tailwind,
  nodejs,
  mongodb,
  git,
  figma,
  docker,
  meta,
  starbucks,
  bcit,
  si,
  tesla,
  shopify,
  carrent,
  jobit,
  tripguide,
  threejs,
} from "../assets";

export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "work",
    title: "Work",
  },
  {
    id: "contact",
    title: "Contact",
  },
];

const services = [
  {
    title: "Web Developer",
    icon: web,
  },
  {
    title: "Software Developer",
    icon: mobile,
  },
  {
    title: "Wordpress Developer",
    icon: backend,
  },
  {
    title: "Game Developer",
    icon: creator,
  },
];

const technologies = [
  {
    name: "HTML 5",
    icon: html,
  },
  {
    name: "CSS 3",
    icon: css,
  },
  {
    name: "JavaScript",
    icon: javascript,
  },
  {
    name: "TypeScript",
    icon: typescript,
  },
  {
    name: "React JS",
    icon: reactjs,
  },
  {
    name: "Redux Toolkit",
    icon: redux,
  },
  {
    name: "Tailwind CSS",
    icon: tailwind,
  },
  {
    name: "Node JS",
    icon: nodejs,
  },
  {
    name: "MongoDB",
    icon: mongodb,
  },
  {
    name: "Three JS",
    icon: threejs,
  },
  {
    name: "git",
    icon: git,
  },
  {
    name: "figma",
    icon: figma,
  },
  {
    name: "docker",
    icon: docker,
  },
];

const experiences = [
  {
    title: "Junior Web Developer (React)",
    company_name: "Black Cap It",
    icon: bcit,
    iconBg: "#383E56",
    date: "Aug 2025 - Present",
    points: [
      "Shifted focus to React.js, deepening skills in modern JavaScript frameworks.",
      "Played a key role in creating a dynamic client dashboard with React, improving user interactivity and data visualization.",
      "Created custom solutions such as a Weather App and a Game Listing site using React and Tailwind CSS, ensuring modern, responsive designs.",
      "Expanded technical expertise in building responsive and efficient web applications.",
    ],
  },
  {
    title: "Junior Web Developer",
    company_name: "Black Cap It",
    icon: bcit,
    iconBg: "#E6DEDD",
    date: "May 2024 - Present",
    points: [
      "Design and develop full websites using HTML, CSS, Bootstrap, WordPress, Elementor, Oxygen Builder, JavaScript, jQuery, and Kadence WP based on client needs..",
      "Design and develop full websites using HTML, CSS, Bootstrap, WordPress, Elementor, Oxygen Builder, JavaScript, jQuery, and Kadence WP based on client needs.",
      "Contributed to custom solutions and enhancements for various client projects.",
    ],
  },
  {
    title: "Trainee Web Developer",
    company_name: "Black Cap It",
    icon: bcit,
    iconBg: "#383E56",
    date: "Dec 2023 - May 2024",
    points: [
      "Worked primarily on the front end of a management system, focusing on improving the user interface and experience.",
      "Contributed to making the system more efficient and user-friendly.",
      "Gained a solid foundation in front-end development and enhanced coding, design, and client-focused project skills.",
    ],
  },
  {
    title: "Software Development",
    company_name: "Solitaire Infosys",
    icon: si,
    iconBg: "#383E56",
    date: "Jan 2022 - June 2022",
    points: [
      "Worked primarily on the front end of a management system, focusing on improving the user interface and experience.",
      "Contributed to making the system more efficient and user-friendly.",
      "Gained a solid foundation in front-end development and enhanced coding, design, and client-focused project skills.",
    ],
  },
];

const testimonials = [
  {
    testimonial:
      "I thought it was impossible to make a website as beautiful as our product, but Rick proved me wrong.",
    name: "Sara Lee",
    designation: "CFO",
    company: "Acme Co",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    testimonial:
      "I've never met a web developer who truly cares about their clients' success like Rick does.",
    name: "Chris Brown",
    designation: "COO",
    company: "DEF Corp",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    testimonial:
      "After Rick optimized our website, our traffic increased by 50%. We can't thank them enough!",
    name: "Lisa Wang",
    designation: "CTO",
    company: "456 Enterprises",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
  },
];

const projects = [
  {
    name: "Car Rent",
    description:
      "Web-based platform that allows users to search, book, and manage car rentals from various providers, providing a convenient and efficient solution for transportation needs.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "mongodb",
        color: "green-text-gradient",
      },
      {
        name: "tailwind",
        color: "pink-text-gradient",
      },
    ],
    image: carrent,
    source_code_link: "https://github.com/",
  },
  {
    name: "Job IT",
    description:
      "Web application that enables users to search for job openings, view estimated salary ranges for positions, and locate available jobs based on their current location.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "restapi",
        color: "green-text-gradient",
      },
      {
        name: "scss",
        color: "pink-text-gradient",
      },
    ],
    image: jobit,
    source_code_link: "https://github.com/",
  },
  {
    name: "Trip Guide",
    description:
      "A comprehensive travel booking platform that allows users to book flights, hotels, and rental cars, and offers curated recommendations for popular destinations.",
    tags: [
      {
        name: "nextjs",
        color: "blue-text-gradient",
      },
      {
        name: "supabase",
        color: "green-text-gradient",
      },
      {
        name: "css",
        color: "pink-text-gradient",
      },
    ],
    image: tripguide,
    source_code_link: "https://github.com/",
  },
];

export { services, technologies, experiences, testimonials, projects };

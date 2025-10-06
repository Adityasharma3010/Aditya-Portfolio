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
  unreal,
  cplusplus,
  python,
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
  laslesvpn,
  weatherapp,
  gameslisting,
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
    name: "React JS",
    icon: reactjs,
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
    name: "Three JS",
    icon: threejs,
  },
  // {
  //   name: "git",
  //   icon: git,
  // },
  // {
  //   name: "C++",
  //   icon: cplusplus,
  // },
  // {
  //   name: "Python",
  //   icon: python,
  // },
  // {
  //   name: "Unreal Engine",
  //   icon: unreal,
  // },
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
    name: "LaslesVPN",
    description:
      "LaslesVPN is a sleek, modern landing page built using Tailwind CSS. It presents a fictional VPN service, showcasing features, pricing tiers, and testimonials in a clean, user-friendly layout. The site is responsive (i.e. adapts to desktop, tablet, and mobile views) and demonstrates how a simple marketing / product landing site for a VPN service might look. It includes sections for features, pricing plans, user testimonials, and a call-to-action to encourage sign-ups.",
    tags: [
      {
        name: "html",
        color: "blue-text-gradient",
      },
      {
        name: "css",
        color: "green-text-gradient",
      },
      {
        name: "tailwind",
        color: "pink-text-gradient",
      },
    ],
    image: laslesvpn,
    source_code_link: "https://github.com/Adityasharma3010/Tailwind-css-vpn",
  },
  {
    name: "WeatherApp",
    description:
      "WeatherApp is a modern, intuitive web application that lets users view current weather conditions for any city. It fetches live data (temperature, humidity, wind speed, weather description, icons) from a weather API, and displays it in a clean, responsive interface. The goal is to build a polished user interface for a practical, real-world utility while demonstrating front-end skills and handling asynchronous data.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "js",
        color: "green-text-gradient",
      },
      {
        name: "tailwind",
        color: "pink-text-gradient",
      },
    ],
    image: weatherapp,
    source_code_link: "https://github.com/Adityasharma3010/React-WeatherApp",
  },
  {
    name: "Games Listing",
    description:
      "The Games Listing App is a modern, responsive web application that showcases a curated list of video games. Designed with a focus on user experience and performance, the app provides an intuitive interface for browsing games across various genres. It features dynamic search and filtering capabilities, allowing users to easily find games based on their preferences. Each game entry includes essential details such as title, genre, release date, and a brief description.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "react-router",
        color: "green-text-gradient",
      },
      {
        name: "tailwind",
        color: "pink-text-gradient",
      },
    ],
    image: gameslisting,
    source_code_link: "https://github.com/Adityasharma3010/Games-Listing",
  },
];

export { services, technologies, experiences, testimonials, projects };

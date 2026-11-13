// site/config.js
// Portfolio Configuration for Pranav Mali

window.CONFIG = {
  // 1 & 2: Name and Role
  name: "Pranav Mali",
  firstName: "PRANAV",
  lastName: "MALI",
  role: "Data Analyst / AI Enthusiast",
  
  // 3: City and Status Line
  location: "Pune, India",
  status: "Pune · Open to Work",
  statusDot: true,

  // 13: Accent Colour (Warm amber matching the rim light)
  accentColor: "#ff9a4d",
  mutedColor: "#a39b91",
  textColor: "#f5efe7",
  bgColor: "#000000",

  // 4 & 5: About Section
  about: {
    eyebrow: "01 — ABOUT",
    title: "Creating Business intelligence using AI intelligence",
    paragraph: "Exploring the world where data meets curiosity and insights drive decisions. I specialize in designing executive BI dashboards, predictive machine learning pipelines, and automating complex workflows into intuitive visual stories.",
    // 6: Key Stats
    stats: [
      { value: "4+", label: "Projects Completed" },
      { value: "2+", label: "Years Data Work" },
      { value: "4", label: "Certifications" }
    ]
  },

  // 7: Projects (title, tech, one-line summary, metrics, links)
  projects: [
    {
      title: "Hospital ICU Management Dashboard",
      category: "Analysis using Excel",
      tech: ["Data Cleaning", "Pivot Charts", "Data modeling", "Advanced Formulas", "Requirement Gathering"],
      description: "Designed an operational model to track patient admissions, discharge workflows, and medical inventory levels.",
      metric: "99.8% Requirement Adherence",
      link: "https://youtu.be/Ivqvg5NiCuo?si=IA7scKjYKA9cIatH",
      live: "https://youtu.be/Ivqvg5NiCuo?si=IA7scKjYKA9cIatH"
    },
    {
      title: "Ecom Sales Analytics",
      category: "Analysis using PowerBI",
      tech: ["KPI", "Slicers", "DAX & Calculations", "Data Transformation & PowerQuery", "Data Visualization",],
      description: "Developed interactive dashboards to track business KPIs and performance metrics, Transformed data from multiple sources, Delivered insights to support business decision-making.",
      metric: "89% Accuracy on Churn",
      link: "https://youtu.be/EzL9qds2UZo?si=l5ofWYsWayCnpyI6",
      live: "https://youtu.be/EzL9qds2UZo?si=l5ofWYsWayCnpyI6"
    },
    {
      title: "Movieverse - SQL Project",
      category: "Analysis using SQL",
      tech: ["Aggregate Functions", "Joins", "CTEs", "Window Functions", "Subquery"],
      description: "End-to-end automated data ingestion, schema validation, and cleansing engine slashing manual reporting turnaround from days to minutes.",
      metric: "10x Turnaround Speedup",
      link: "https://github.com/Carrypranav/Moviverse---SQL-Project",
      live: "https://github.com/Carrypranav/Moviverse---SQL-Project"
    }
  ],

  // 8: Core Skills
  skills: [
    { name: "HTML-CSS-Gscript", level: "Advanced", icon: "git-merge" },
    { name: "UIUX Design", level: "Proficient", icon: "activity" },
    { name: "Gen AI proficiency ", level: "Expert", icon: "cpu" },
    { name: "Advanced Excel", level: "Expert", icon: "table" },
    { name: "PowerBI", level: "Advanced", icon: "bar-chart-2" },
    { name: "SQL", level: "Advanced", icon: "database" },
    { name: "Python", level: "Intermediate", icon: "code" },
    { name: "Data Visualization", level: "Advanced", icon: "pie-chart" },
    { name: "Business Intelligence", level: "Advanced", icon: "trending-up" },
  ],

  // 9 & 10: Experience and Education
  resume: {
    eyebrow: "04 — RESUME",
    title: "Experience & Education",
    summary: "Proven track record in optimizing enterprise data processes, architecting automated business intelligence frameworks, and translating data into strategic outcomes.",
    experience: [
      {
        role: "Senior Process Executive",
        company: "Infosys",
        period: "2024 — 2026",
        location: "Pune, India",
        points: [
          "Spearheaded business intelligence reporting and process optimization across international client accounts.",
          "Automated mission-critical analytics dashboards, eliminating manual reporting overhead.",
          "Collaborated with cross-functional leadership to deliver data-backed strategic recommendations."
        ]
      }
    ],
    education: [
      {
        degree: "Bachelor of Computer Applications (BCA)",
        institution: "Shivaji University",
        period: "2020 — 2023",
        location: "Maharashtra, India",
        points: [
          "Specialization in Database Management Systems, Data Structures, and Software Development.",
          "Graduated with distinction and completed hands-on capstone analytics projects."
        ]
      }
    ],
    downloadUrl: "#resume-download"
  },

  // 11: Email & Social Links
  contact: {
    eyebrow: "05 — CONNECT",
    title: "Let's Build Something Intelligent",
    subtitle: "Always open to collaborating on high-impact data analytics projects, AI solutions, or full-time opportunities.",
    email: "malipranav1501@gmail.com",
    socials: [
      { name: "LinkedIn", url: "https://www.linkedin.com/in/pranav-mali-ba902a2b6/", handle: "PranavMali" },
      { name: "GitHub", url: "https://github.com/Carrypranav", handle: "Carrypranav" },
      { name: "Instagram", url: "https://www.instagram.com/mrpronow/", handle: "@Mrpronow" }
    ]
  },

  // Navigation Links
  nav: [
    { id: "intro", label: "Home" },
    { id: "about", label: "About" },
    { id: "work", label: "Work" },
    { id: "skills", label: "Skills" },
    { id: "resume", label: "Resume" },
    { id: "contact", label: "Contact" }
  ],

  // Timeline Segments & Holds (mapped to video.currentTime in seconds)
  // Perfectly proportioned for responsive, natural scrolling without long pauses or dead zones
  timeline: [
    // 0.0s - 7.0s: Turns around, faces camera, smiles
    { t: [0.0, 7.0], h: 0.8, id: "intro-motion" },
    // 7.0s: INTRO HOLD (Pranav standing full height smiling)
    { t: [7.0, 7.0], h: 0.8, id: "intro", section: "intro" },
    // 7.0s - 14.5s: Steps forward toward camera
    { t: [7.0, 14.5], h: 0.9, id: "about-motion" },
    // 14.5s: ABOUT HOLD (Close-up portrait)
    { t: [14.5, 14.5], h: 0.8, id: "about", section: "about" },
    // 14.5s - 27.5s: Sits down on chair, desk slides in
    { t: [14.5, 27.5], h: 1.0, id: "work-motion" },
    // 27.5s: WORK HOLD (Typing at laptop)
    { t: [27.5, 27.5], h: 0.9, id: "work", section: "work" },
    // 27.5s - 37.0s: Stands up and walks past
    { t: [27.5, 37.0], h: 1.0, id: "skills", section: "skills" },
    // 37.0s - 41.5s: Stops walking, reaches up with both hands
    { t: [37.0, 41.5], h: 0.6, id: "resume-motion" },
    // 41.5s: RESUME HOLD (Hands pull down screen)
    { t: [41.5, 41.5], h: 0.8, id: "resume", section: "resume" },
    // 41.5s - 43.5s: Raises hand to wave
    { t: [41.5, 43.5], h: 0.5, id: "contact-motion" },
    // 43.5s - 46.33s: CONTACT HOLD (Waving goodbye)
    { t: [43.5, 46.33], h: 0.9, id: "contact", section: "contact" }
  ]
};

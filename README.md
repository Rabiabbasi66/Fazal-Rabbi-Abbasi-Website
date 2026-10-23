# Fazal-E-Rabbi Abbasi

**Backend Developer & Aspiring Platform Engineer**

<p align="left">
  <a href="https://fazal-rabbi-abbasi-website.vercel.app/"><img src="https://img.shields.io/badge/Portfolio-Live-0f766e?style=flat-square&logo=vercel&logoColor=white" alt="Live portfolio"></a>
  <a href="https://github.com/Rabiabbasi66"><img src="https://img.shields.io/badge/GitHub-Rabiabbasi66-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
  <a href="https://www.linkedin.com/in/fazal-e-rabbi-abbasi-a0200a443/"><img src="https://img.shields.io/badge/LinkedIn-Fazal--E--Rabbi%20Abbasi-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="mailto:rabif1820@gmail.com"><img src="https://img.shields.io/badge/Email-rabif1820%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>
</p>

I am a full-stack engineer with a backend focus, currently completing a BS in Software Engineering at Sarhad University of Science and Information Technology, Peshawar. I build APIs and data layers with Python, FastAPI, MongoDB and MySQL, and I am moving toward platform engineering through Linux, Docker, CI/CD and observability. I am open to internships and early-career backend or platform engineering opportunities.

Based in Abbottabad, Pakistan.

---

## About

Most of my work sits behind the interface: designing APIs that behave predictably, modelling data so it stays consistent as an application grows, and writing code another developer can read without a walkthrough. I also care about the operational side of software: how a service is containerised, deployed, observed and kept healthy.

My strongest tools are Python and FastAPI, with MongoDB and MySQL for persistence. I am currently deepening my platform engineering skills across Kubernetes, Helm, infrastructure as code, monitoring and GitOps, while continuing to build and ship full-stack projects.

### Quick facts

| | |
|---|---|
| **Education** | BS Software Engineering, Sarhad University of Science and Information Technology, Peshawar |
| **Study period** | 2023 to 2027 |
| **Current stage** | 7th semester, final year |
| **Focus** | Backend APIs and databases, Linux, Docker, CI/CD, platform engineering |
| **Location** | Abbottabad, Pakistan |

---

## Featured projects

### DevOps Monitor Pro

**Infrastructure monitoring and alerting for Windows servers.**

A production-oriented monitoring platform built around a packaged Windows agent. The agent reports CPU, memory, disk, network, uptime and top-process metrics every 30 seconds to a FastAPI and MongoDB backend. A Streamlit dashboard provides live charts, server health states, threshold alerts, incident management and email notifications, with JWT authentication and WebSocket updates.

- Windows agent with one-time enrollment, automatic reconnection and an installer
- Alert lifecycle with acknowledge, resolve and reopen actions, plus offline detection
- Email notifications with verified recipients and configurable severity filters
- Docker Compose setup and GitHub Actions CI, including an 83-test backend suite

**Stack:** Python, FastAPI, MongoDB, Streamlit, WebSockets, JWT, Docker, GitHub Actions, psutil, PyInstaller, Inno Setup.

**Links:** [Live dashboard](https://devops-monitor-pro-ncfzbp7999gwequkrpd4ad.streamlit.app/) · [API health](https://devops-monitor-pro.vercel.app/health) · [GitHub repository](https://github.com/Rabiabbasi66/devops-monitor-pro) · [Windows agent](https://github.com/Rabiabbasi66/devops-monitor-pro/releases/latest/download/DevOpsMonitorAgent-Setup.exe)

The Streamlit dashboard may ask you to sign in. The API health endpoint is public.

---

### AgriScan 3D

**AI-assisted drone crop surveying in an interactive 3D field.**

A full-stack final-year project that models a drone crop survey. A user uploads a crop image, a YOLOv8 classifier returns the detected crop, disease and confidence, and the result is projected onto a Three.js farm as a marker tied to the drone's capture position. Signed-in users get persisted prediction history and field analytics; anonymous scans still work.

- React and Vite frontend with a Three.js farm, virtual drone and scan report
- YOLOv8 classification through a FastAPI backend and a remote classifier service
- MongoDB persistence, JWT authentication and owner-scoped prediction history
- Docker-based backend and Vercel frontend deployment

**Stack:** React 18, Vite, Three.js, Tailwind CSS, JavaScript, FastAPI, Python, YOLOv8, MongoDB, JWT, Docker, Vercel.

**Links:** [Live demo](https://agriscan-3d.vercel.app/) · [Frontend repository](https://github.com/Rabiabbasi66/Agriscan-3D-frontend) · [Backend repository](https://github.com/Rabiabbasi66/agriscan-backend)

The 3D scene is rendered with Three.js and WebGL. WebGPU availability is detected and shown as a capability badge; it is not the current renderer.

---

### AI Chat Application

**Real-time chat with accounts, conversation history and a mock AI reply service.**

A full-stack chat application with a vanilla JavaScript frontend and a FastAPI backend. Users can register, sign in, create chat sessions and exchange messages in real time over WebSockets. Messages and sessions are stored in MongoDB, and JWT authentication protects user data.

The AI response layer is currently a mock implementation, designed as a replaceable service rather than a production LLM integration.

- Account registration and login with JWT authentication
- Real-time messaging over WebSockets with reconnect handling
- Chat sessions and message history stored in MongoDB
- Mock AI reply service ready to be replaced with a hosted model

**Stack:** HTML, CSS, JavaScript, FastAPI, Python, WebSockets, MongoDB, JWT.

**Links:** [Live demo](https://chat-app-steel-alpha.vercel.app/) · [GitHub repository](https://github.com/Rabiabbasi66/Chat-app)

The live demo uses the mock AI response service included in the repository.

---

### 3D Portfolio Website

**This site: a hand-built portfolio with a warm editorial design and a small Three.js layer.**

A single-page portfolio written in plain HTML, CSS and JavaScript, with no frontend framework or build step. The visual system uses a warm white and beige palette with terracotta accents, self-hosted Inter, a typewriter hero, subtle Three.js shapes and a responsive project grid.

- Responsive layout at phone, tablet and desktop widths, with a mobile navigation menu
- Accessible skills view with two toggle buttons, keyboard controls and focus states
- Contact form with client-side validation and a FastAPI and MongoDB backend
- Email address assembled on click rather than exposed as a plain `mailto:` link in the HTML
- Three.js background paused when the hero is off-screen or the tab is hidden

**Stack:** HTML, CSS, JavaScript, Three.js, FastAPI, Python, MongoDB, Vercel.

**Links:** [Live site](https://fazal-rabbi-abbasi-website.vercel.app/) · [GitHub repository](https://github.com/Rabiabbasi66/Fazal-Rabbi-Abbasi-Website)

---

## Technical skills

The portfolio renders these from one `SKILLS` array in `main.js`, grouped into two views.

### Comfortable with (20)

- **Languages:** HTML, CSS, JavaScript, Python
- **Backend and databases:** FastAPI, MongoDB, SQL, MySQL, REST APIs, APIs
- **DevOps and Linux:** Linux, Docker, Git, GitHub
- **Tools and deployment:** Vercel, Netlify, Render, Postman
- **AI and 3D:** YOLOv8 (AI), Three.js (basic)

### Currently learning (18)

- **CI/CD and automation:** CI/CD Pipelines, GitHub Actions, Jenkins, Bash Scripting
- **Containers and orchestration:** Kubernetes, Helm, Docker Compose
- **Infrastructure as code:** Terraform, Ansible
- **Monitoring and observability:** Prometheus, Grafana
- **GitOps and platform engineering:** GitOps, ArgoCD, Internal Developer Platforms
- **Cloud and networking:** AWS (basics), Nginx
- **Data:** Redis, GraphQL

---

## Education

**BS Software Engineering**

Sarhad University of Science and Information Technology, Peshawar

2023 to 2027 · Currently 7th semester (final year)

Coursework and projects have focused on backend development, databases, Linux, containerisation and software delivery. My final-year work includes AgriScan 3D, an AI-assisted crop surveying platform.

---

## Repository layout

```text
.
├── index.html          # Single-page portfolio
├── style.css           # Design tokens, layout and responsive styles
├── main.js             # Typing hero, skills rendering, navigation and form logic
├── three-scene.js      # Subtle Three.js hero background
├── images/             # Portrait, project and social preview images
├── fonts/              # Self-hosted Inter font files
└── backend/            # FastAPI service: contact, projects, skills, services and auth
```

The frontend is intentionally static. The contact form posts to the FastAPI service in `backend/`, which stores submissions in MongoDB and sends an SMTP notification.

---

## Contact

- **Email:** [rabif1820@gmail.com](mailto:rabif1820@gmail.com)
- **LinkedIn:** [fazal-e-rabbi-abbasi-a0200a443](https://www.linkedin.com/in/fazal-e-rabbi-abbasi-a0200a443/)
- **GitHub:** [Rabiabbasi66](https://github.com/Rabiabbasi66)
- **Portfolio:** [fazal-rabbi-abbasi-website.vercel.app](https://fazal-rabbi-abbasi-website.vercel.app/)
- **WhatsApp:** [Chat on WhatsApp](https://wa.me/923110853195)
- **Upwork:** [Freelance profile](https://www.upwork.com/freelancers/~014851cdad1612d7e5)
- **Instagram:** [@fazal_rabbi2816](https://www.instagram.com/fazal_rabbi2816/)
- **Location:** Abbottabad, Pakistan

---

## Notes

This repository contains a personal portfolio and its supporting backend. The live site is deployed on Vercel; project demos and repositories are linked above. The Windows agent download and API health endpoint belong to DevOps Monitor Pro and are hosted separately.

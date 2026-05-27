"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "framer-motion";
import GitHubGraph from "../components/GitHubGraph";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type ThemeTransition = {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
};

type ThemeTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => ThemeTransition;
};

const facts = [
  ["4+", "Projects shipped", "Real builds, not tutorial clones"],
  ["100%", "Built from scratch", "No templates"],
  ["1", "Production deployment", "Deployed inside a company"],
  ["21", "Age", "Still early, already shipping"],
];

const projects = [
  {
    num: "01",
    category: "AI / Production",
    tagline: "01 / AI / Fullstack",
    title: "ClearFlow",
    description: "A bank statement intelligence system that turns messy PDFs and scans into categorized, validated Excel output for real finance operations.",
    why: "Manual statement reviews were slow and error-prone. A real SME finance company needed something faster and auditable.",
    tags: ["FastAPI", "Gemini Vision", "Claude Haiku", "PyMuPDF", "React", "Supabase"],
    cardStatus: "Internal live",
    status: "Live / deployed for Phoenix Commercial Finance",
    githubText: "Private Repo",
    githubUrl: null,
    demoText: "Live (Internal)",
    demoUrl: null,
    impact: "Replaced hours of manual review with a single upload",
    architectureSrc: "/architectures/clearflow-architecture.png",
    summary: "Document ingestion, extraction, validation, and export layered into one dependable internal workflow.",
    role: "Owned product shape, backend pipeline, extraction logic, and the internal frontend surface.",
    facts: [["Role", "End-to-end build"], ["Client", "UK finance"], ["Surface", "Internal ops tool"]],
    workflow: ["Upload", "Extract", "Normalize", "Validate", "Export"],
    cardMetrics: ["Finance ops", "OCR + LLM", "Audit-ready"],
    layout: "featured",
    style: "normal"
  },
  {
    num: "02",
    category: "ML / Finance",
    tagline: "02 / ML / Finance",
    title: "CryptoQuant",
    description: "A live crypto forecasting workspace combining streaming market data, sequence models, and visual backtesting in one product surface.",
    why: "Everyone learns ML on dead CSV files. I wanted to see how forecasting actually works in production with live data.",
    tags: ["TensorFlow", "FastAPI", "React", "Supabase", "CCXT", "Framer Motion"],
    cardStatus: "Public live",
    status: "Live / cryptoquant.vercel.app",
    githubText: "GitHub ->",
    githubUrl: "https://github.com/AaravKashyap12/CryptoQuant",
    demoText: "Live Demo ->",
    demoUrl: "https://cryptoquant.vercel.app",
    impact: "Hybrid LSTM + 1D-CNN with sentiment-aware Fear and Greed Index integration",
    architectureSrc: "/architectures/cryptoquant-architecture.png",
    summary: "Market streams, forecasting models, confidence intervals, and clean charting tied into a single analysis loop.",
    role: "Built the prediction pipeline, data flow, and dashboard layer from scratch.",
    facts: [["Model", "LSTM + 1D-CNN"], ["Data", "Live websockets"], ["Mode", "Forecast + backtest"]],
    workflow: ["Stream", "Forecast", "Score", "Compare"],
    cardMetrics: ["Realtime", "Sequence model", "Backtesting"],
    layout: "compact",
    style: "normal"
  },
  {
    num: "03",
    category: "NLP / SaaS",
    tagline: "03 / NLP / SaaS",
    title: "TalentMatch",
    description: "A resume screening platform that scores candidates semantically instead of relying on brittle keyword filters.",
    why: "Someone qualified did not get shortlisted because their resume lacked the right keywords. Resume screening is broken.",
    tags: ["FastAPI", "spaCy", "ONNX Runtime", "Sentence-Transformers", "React", "PostgreSQL"],
    cardStatus: "Public live",
    status: "Live / talentmatch-v1.vercel.app",
    githubText: "GitHub ->",
    githubUrl: "https://github.com/AaravKashyap12/TalentMatch",
    demoText: "Live Demo ->",
    demoUrl: "https://talentmatch-v1.vercel.app",
    impact: "90%+ test coverage with a production-ready ML pipeline",
    architectureSrc: "/architectures/talentmatch-architecture.png",
    summary: "Resume parsing, semantic scoring, and recruiter-facing analysis views built for better hiring decisions.",
    role: "Designed the ranking logic, evaluation flow, and hiring-facing interface.",
    facts: [["Focus", "Semantic ranking"], ["Pipeline", "NLP + embeddings"], ["Testing", "90%+ coverage"]],
    workflow: ["Parse", "Embed", "Score", "Compare"],
    cardMetrics: ["Hiring", "Semantic match", "Explainable"],
    layout: "compact",
    style: "normal"
  },
  {
    num: "04",
    category: "AI / TBD",
    tagline: "04 / In Progress",
    title: "[Redacted]",
    description: "A more ambitious system is underway. Not ready to show yet, but the direction is bigger, sharper, and more product-heavy.",
    why: "",
    tags: ["hidden"],
    cardStatus: "Building",
    status: "Building",
    githubText: null,
    githubUrl: null,
    demoText: null,
    demoUrl: null,
    impact: "",
    architectureSrc: null,
    summary: "The next build is intentionally quiet for now.",
    role: "Still shaping the architecture and surface.",
    facts: [["State", "Private"], ["Stage", "Research + build"], ["Reveal", "Soon"]],
    workflow: ["Research", "Model", "Build", "Ship"],
    cardMetrics: ["Private", "In progress", "Soon"],
    layout: "tease",
    style: "in-progress"
  }
];
const expertiseBands = [
  {
    num: "01",
    title: "Core Languages",
    summary: "The languages I reach for when I need performance, product speed, or a backend that stays readable under pressure.",
    highlight: "Python anchors most of the AI and backend work. TypeScript and SQL carry product and data contracts cleanly.",
    tools: [
      { name: "Python", icon: "python" },
      { name: "JavaScript", icon: "javascript" },
      { name: "TypeScript", icon: "typescript" },
      { name: "Java", icon: "data:image/svg+xml,%3Csvg viewBox='0 0 384 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M277.74 312.9c9.8-6.7 23.4-12.5 23.4-12.5s-38.7 7-77.2 10.2c-47.1 3.9-97.7 4.7-123.1 1.3-60.1-8 33-30.1 33-30.1s-36.1-2.4-80.6 19c-52.5 25.4 130 37 224.5 12.1zm-85.4-32.1c-19-42.7-83.1-80.2 0-145.8C296 53.2 242.84 0 242.84 0c21.5 84.5-75.6 110.1-110.7 162.6-23.9 35.9 11.7 74.4 60.2 118.2zm114.6-176.2c.1 0-175.2 43.8-91.5 140.2 24.7 28.4-6.5 54-6.5 54s62.7-32.4 33.9-72.9c-26.9-37.8-47.5-56.6 64.1-121.3zm-6.1 270.5a12.19 12.19 0 0 1-2 2.6c128.3-33.7 81.1-118.9 19.8-97.3a17.33 17.33 0 0 0-8.2 6.3 70.45 70.45 0 0 1 11-3c31-6.5 75.5 41.5-20.6 91.4zM348 437.4s14.5 11.9-15.9 21.2c-57.9 17.5-240.8 22.8-291.6.7-18.3-7.9 16-19 26.8-21.3 11.2-2.4 17.7-2 17.7-2-20.3-14.3-131.3 28.1-56.4 40.2C232.84 509.4 401 461.3 348 437.4zM124.44 396c-78.7 22 47.9 67.4 148.1 24.5a185.89 185.89 0 0 1-28.2-13.8c-44.7 8.5-65.4 9.1-106 4.5-33.5-3.8-13.9-15.2-13.9-15.2zm179.8 97.2c-78.7 14.8-175.8 13.1-233.3 3.6 0-.1 11.8 9.7 72.4 13.6 92.2 5.9 233.8-3.3 237.1-46.9 0 0-6.4 16.5-76.2 29.7zM260.64 353c-59.2 11.4-93.5 11.1-136.8 6.6-33.5-3.5-11.6-19.7-11.6-19.7-86.8 28.8 48.2 61.4 169.5 25.9a60.37 60.37 0 0 1-21.1-12.8z' fill='white'/%3E%3C/svg%3E" },
      { name: "C++", icon: "cplusplus" },
      { name: "SQL", icon: "mysql" }
    ]
  },
  {
    num: "02",
    title: "Frontend + Product",
    summary: "Interfaces that feel considered, move cleanly, and stay connected to the backend contract instead of floating above it.",
    highlight: "I care about the final surface as much as the system underneath it, especially when product clarity and motion matter.",
    tools: [
      { name: "React", icon: "react" },
      { name: "Next.js", icon: "nextdotjs" },
      { name: "Vite", icon: "vite" },
      { name: "Tailwind CSS", icon: "tailwindcss" },
      { name: "Framer Motion", icon: "framer" },
      { name: "Streamlit", icon: "streamlit" }
    ]
  },
  {
    num: "03",
    title: "Backend + Data",
    summary: "APIs, queues, databases, and infra choices built around reliability, speed, and not painting the product into a corner.",
    highlight: "This is the layer that makes shipping fast possible: clean data models, sane service boundaries, and deployment that behaves.",
    tools: [
      { name: "FastAPI", icon: "fastapi" },
      { name: "Node.js", icon: "nodedotjs" },
      { name: "Docker", icon: "docker" },
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "MongoDB", icon: "mongodb" },
      { name: "Supabase", icon: "supabase" },
      { name: "SQLAlchemy", icon: "sqlalchemy" },
      { name: "SQLite", icon: "sqlite" },
      { name: "AWS", icon: "data:image/svg+xml,%3Csvg viewBox='0 0 640 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M180.41 203.01c-.72 22.65 10.6 32.68 10.88 39.05a8.164 8.164 0 0 1-4.1 6.27l-12.8 8.96a10.66 10.66 0 0 1-5.63 1.92c-.43-.02-8.19 1.83-20.48-25.61a78.608 78.608 0 0 1-62.61 29.45c-16.28.89-60.4-9.24-58.13-56.21-1.59-38.28 34.06-62.06 70.93-60.05 7.1.02 21.6.37 46.99 6.27v-15.62c2.69-26.46-14.7-46.99-44.81-43.91-2.4.01-19.4-.5-45.84 10.11-7.36 3.38-8.3 2.82-10.75 2.82-7.41 0-4.36-21.48-2.94-24.2 5.21-6.4 35.86-18.35 65.94-18.18a76.857 76.857 0 0 1 55.69 17.28 70.285 70.285 0 0 1 17.67 52.36l-.01 69.29zM93.99 235.4c32.43-.47 46.16-19.97 49.29-30.47 2.46-10.05 2.05-16.41 2.05-27.4-9.67-2.32-23.59-4.85-39.56-4.87-15.15-1.14-42.82 5.63-41.74 32.26-1.24 16.79 11.12 31.4 29.96 30.48zm170.92 23.05c-7.86.72-11.52-4.86-12.68-10.37l-49.8-164.65c-.97-2.78-1.61-5.65-1.92-8.58a4.61 4.61 0 0 1 3.86-5.25c.24-.04-2.13 0 22.25 0 8.78-.88 11.64 6.03 12.55 10.37l35.72 140.83 33.16-140.83c.53-3.22 2.94-11.07 12.8-10.24h17.16c2.17-.18 11.11-.5 12.68 10.37l33.42 142.63L420.98 80.1c.48-2.18 2.72-11.37 12.68-10.37h19.72c.85-.13 6.15-.81 5.25 8.58-.43 1.85 3.41-10.66-52.75 169.9-1.15 5.51-4.82 11.09-12.68 10.37h-18.69c-10.94 1.15-12.51-9.66-12.68-10.75L328.67 110.7l-32.78 136.99c-.16 1.09-1.73 11.9-12.68 10.75h-18.3zm273.48 5.63c-5.88.01-33.92-.3-57.36-12.29a12.802 12.802 0 0 1-7.81-11.91v-10.75c0-8.45 6.2-6.9 8.83-5.89 10.04 4.06 16.48 7.14 28.81 9.6 36.65 7.53 52.77-2.3 56.72-4.48 13.15-7.81 14.19-25.68 5.25-34.95-10.48-8.79-15.48-9.12-53.13-21-4.64-1.29-43.7-13.61-43.79-52.36-.61-28.24 25.05-56.18 69.52-55.95 12.67-.01 46.43 4.13 55.57 15.62 1.35 2.09 2.02 4.55 1.92 7.04v10.11c0 4.44-1.62 6.66-4.87 6.66-7.71-.86-21.39-11.17-49.16-10.75-6.89-.36-39.89.91-38.41 24.97-.43 18.96 26.61 26.07 29.7 26.89 36.46 10.97 48.65 12.79 63.12 29.58 17.14 22.25 7.9 48.3 4.35 55.44-19.08 37.49-68.42 34.44-69.26 34.42zm40.2 104.86c-70.03 51.72-171.69 79.25-258.49 79.25A469.127 469.127 0 0 1 2.83 327.46c-6.53-5.89-.77-13.96 7.17-9.47a637.37 637.37 0 0 0 316.88 84.12 630.22 630.22 0 0 0 241.59-49.55c11.78-5 21.77 7.8 10.12 16.38zm29.19-33.29c-8.96-11.52-59.28-5.38-81.81-2.69-6.79.77-7.94-5.12-1.79-9.47 40.07-28.17 105.88-20.1 113.44-10.63 7.55 9.47-2.05 75.41-39.56 106.91-5.76 4.87-11.27 2.3-8.71-4.1 8.44-21.25 27.39-68.49 18.43-80.02z' fill='white'/%3E%3C/svg%3E" },
      { name: "Vercel", icon: "vercel" },
      { name: "Render", icon: "render" }
    ]
  },
  {
    num: "04",
    title: "AI / ML / Infra",
    summary: "Model selection, agent orchestration, NLP, retrieval, and the tooling layer that turns AI features into working products.",
    highlight: "This is where I connect model capability to product usefulness: orchestration, embeddings, evaluation, and inference patterns that behave in production.",
    tools: [
      { name: "Claude", icon: "anthropic" },
      { name: "Gemini", icon: "googlegemini" },
      { name: "OpenAI", icon: "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z' fill='white'/%3E%3C/svg%3E" },
      { name: "Groq", icon: "data:image/svg+xml,%3Csvg viewBox='0 0 320 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M296 160H180.6l42.6-129.8C227.2 15 215.7 0 200 0H56C44 0 33.8 8.9 32.2 20.8l-32 240C-1.7 275.2 9.5 288 24 288h118.7L96.6 482.5c-3.6 15.2 8 29.5 23.3 29.5 8.4 0 16.4-4.4 20.8-12l176-304c9.3-15.9-2.2-36-20.7-36z' fill='white'/%3E%3C/svg%3E" },
      { name: "DeepSeek", icon: "deepseek" },
      { name: "LangChain", icon: "langchain" },
      { name: "LangGraph", icon: "langchain" },
      { name: "Ollama", icon: "ollama" },
      { name: "Hugging Face", icon: "huggingface" },
      { name: "PyTorch", icon: "pytorch" },
      { name: "TensorFlow", icon: "tensorflow" },
      { name: "spaCy", icon: "spacy" },
      { name: "ONNX Runtime", icon: "onnx" },
      { name: "Scikit-learn", icon: "scikitlearn" },
      { name: "Sentence-Transformers", icon: "huggingface" },
      { name: "Pandas", icon: "pandas" },
      { name: "Git", icon: "git" },
      { name: "GitHub", icon: "github" },
      { name: "Postman", icon: "postman" }
    ]
  }
];


const services = [
  {
    num: "01",
    title: "AI-Powered Backends",
    outcome: "From messy inputs to reliable AI workflows with clear system boundaries.",
    description:
      "Production backends where models do real work: retrieval, reasoning, validation, and structured output.",
    proofs: ["Agentic retrieval", "Guardrails + evals", "Async queues"],
    tools: ["LangGraph", "Agentic RAG", "Postgres", "Redis queues"],
    flow: ["Input", "Reason", "Validate", "Respond"],
    tone: "pipeline",
  },
  {
    num: "02",
    title: "Full Stack Applications",
    outcome: "Products that ship cleanly from schema to surface without losing coherence on the way up.",
    description:
      "I own the full path: backend contracts, frontend interaction, deployment, and the final feel of the product.",
    proofs: ["System design", "UI delivery", "Deployment"],
    tools: ["Next.js", "TypeScript", "FastAPI", "Postgres"],
    flow: ["Schema", "API", "UI", "Launch"],
    tone: "surface",
  },
  {
    num: "03",
    title: "Document Intelligence",
    outcome: "Raw PDFs, scans, and statements turned into clean, auditable structured output.",
    description:
      "Vision models, extraction pipelines, and validation layers built for operational use instead of demos.",
    proofs: ["RAG over docs", "Normalization logic", "Structured exports"],
    tools: ["Gemini Vision", "PyMuPDF", "Claude", "LangGraph"],
    flow: ["Capture", "Extract", "Normalize", "Export"],
    tone: "document",
  },
  {
    num: "04",
    title: "Custom AI Integrations",
    outcome: "Language models woven into existing products so the workflow improves without the product breaking.",
    description:
      "I integrate AI where it belongs: search, copilots, automation, and internal tools that respect the rest of the stack.",
    proofs: ["Workflow automation", "Internal copilots", "API tooling"],
    tools: ["OpenAI", "Claude", "Tool calling", "Webhooks"],
    flow: ["Connect", "Augment", "Automate", "Measure"],
    tone: "integration",
  },
];

const heroSocials = [
  {
    label: "GitHub",
    href: "https://github.com/AaravKashyap12",
    path: "M12 0.5C5.65 0.5 0.5 5.65 0.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.16c-3.2.7-3.88-1.38-3.88-1.38-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.25 3.33.95.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18.92-.25 1.9-.38 2.88-.39.98.01 1.96.14 2.88.39 2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.73.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/aarav-singh-3a6351289",
    path: "M5.34 20.45H1.73V8.84h3.61v11.61ZM3.53 7.25a2.09 2.09 0 1 1 0-4.18 2.09 2.09 0 0 1 0 4.18Zm16.92 13.2h-3.6v-5.65c0-1.35-.03-3.08-1.88-3.08-1.88 0-2.17 1.47-2.17 2.98v5.75H9.2V8.84h3.46v1.59h.05c.48-.91 1.66-1.88 3.42-1.88 3.66 0 4.33 2.41 4.33 5.54v6.36Z",
  },
  {
    label: "Twitter",
    href: "https://x.com/byaarav",
    path: "M13.9 10.47 22.64 0h-2.07l-7.59 9.09L6.92 0H0l9.17 13.75L0 24h2.07l8.02-9.61L16.5 24h6.92l-9.52-13.53Zm-2.84 3.4-.93-1.37L2.74 1.62h3.19l5.96 8.78.93 1.37 7.75 11.39h-3.19l-6.32-9.29Z",
  },
];

const contactActions = [
  {
    label: "Book a Call",
    kicker: "Fastest way to align",
    detail: "30 minute working session to scope the right build, not just talk around it.",
    href: "https://cal.com/aaravkashyap/meetings",
    external: true,
    tone: "primary",
  },
  {
    label: "Email a Brief",
    kicker: "Best for real context",
    detail: "aaravkashyap1203@gmail.com",
    href: "mailto:aaravkashyap1203@gmail.com",
    external: true,
    tone: "secondary",
  },
  {
    label: "Resume",
    kicker: "Experience snapshot",
    detail: "Selected systems, product work, and production experience.",
    href: "https://docs.google.com/document/d/1R5pZ2Qn8mP4_xdHolHgX2RIQP4B6ovrvKUYdlvndoOU/edit?usp=sharing",
    external: true,
    tone: "ghost",
  },
  {
    label: "GitHub",
    kicker: "Proof of work",
    detail: "Commits, experiments, and public code shipped in the open.",
    href: "https://github.com/AaravKashyap12",
    external: true,
    tone: "ghost",
  },
];

const contactLinks = [
  { label: "Email", href: "mailto:aaravkashyap1203@gmail.com" },
  { label: "GitHub", href: "https://github.com/AaravKashyap12" },
  { label: "LinkedIn", href: "https://linkedin.com/in/aarav-singh-3a6351289" },
  { label: "X / Notes", href: "https://x.com/byaarav" },
];

const contactMarquee = [
  "WORK HARD",
  "PLAY HARD",
  "SHIP CLEAN",
  "THINK HARDER",
  "BUILD FOR REAL USE",
  "MOVE WITH TASTE",
];

const opensNewTab = (href: string) => href.startsWith("http") || href.startsWith("mailto:");

export default function Portfolio() {
  const [activeProject, setActiveProject] = useState<typeof projects[0] | null>(null);
  const [expandedArchitecture, setExpandedArchitecture] = useState(false);
  const [heroStats, setHeroStats] = useState({ totalViews: 0, liveViewers: 1 });
  const contactRef = useRef<HTMLElement | null>(null);
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const servicesRef = useRef<HTMLElement | null>(null);

  const heroSignals = useMemo(
    () => [
      {
        label: `${new Intl.NumberFormat("en-IN").format(heroStats.totalViews)} views`,
        description: "Total hero visits tracked by the site counter across unique browsing sessions.",
        tone: "",
      },
      {
        label: `${heroStats.liveViewers} live now`,
        description: "Visitors active on the site in roughly the last 45 seconds.",
        tone: "green",
      },
      {
        label: "Open to work",
        description: "Available for freelance, consulting, and selective full-time roles.",
        tone: "blue",
      },
    ],
    [heroStats]
  );

  useEffect(() => {
    const cursorRing = document.getElementById("cr");
    const cursorDot = document.getElementById("cd");
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    let cursorFrame = 0;

    const moveCursor = (event: MouseEvent) => {
      mx = event.clientX;
      my = event.clientY;
    };

    const tickCursor = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;

      if (cursorRing) {
        cursorRing.style.left = `${mx}px`;
        cursorRing.style.top = `${my}px`;
      }
      if (cursorDot) {
        cursorDot.style.left = `${rx}px`;
        cursorDot.style.top = `${ry}px`;
      }

      cursorFrame = requestAnimationFrame(tickCursor);
    };

    document.addEventListener("mousemove", moveCursor, { passive: true });
    tickCursor();

    const hoverTargets = Array.from(
      document.querySelectorAll('a,button,[class*="card"],[class*="row"],[class*="proj-card"]')
    );
    const addHover = () => document.body.classList.add("hovering");
    const removeHover = () => document.body.classList.remove("hovering");
    const clearPointerState = () => {
      removeHover();
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement) {
        activeElement.blur();
      }
    };
    hoverTargets.forEach((element) => {
      element.addEventListener("mouseenter", addHover);
      element.addEventListener("mouseleave", removeHover);
    });
    window.addEventListener("blur", clearPointerState);
    window.addEventListener("pagehide", clearPointerState);
    document.addEventListener("visibilitychange", clearPointerState);

    const themeButton = document.getElementById("themeBtn");
    const themedDocument = document as ThemeTransitionDocument;
    const setTheme = (nextTheme: "dark" | "light") => {
      const html = document.documentElement;
      html.dataset.theme = nextTheme;
      if (themeButton) themeButton.textContent = nextTheme === "light" ? "\u25C9" : "\u2600";
      try {
        window.localStorage.setItem("portfolio-theme", nextTheme);
      } catch {}
    };

    try {
      const savedTheme = window.localStorage.getItem("portfolio-theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      } else {
        setTheme((document.documentElement.dataset.theme as "dark" | "light") || "dark");
      }
    } catch {
      setTheme((document.documentElement.dataset.theme as "dark" | "light") || "dark");
    }

    const toggleTheme = async () => {
      const html = document.documentElement;
      const currentTheme = (html.dataset.theme as "dark" | "light") || "dark";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!themeButton || !themedDocument.startViewTransition || reduceMotion) {
        setTheme(nextTheme);
        return;
      }

      const rect = themeButton.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = themedDocument.startViewTransition(() => {
        setTheme(nextTheme);
      });

      try {
        await transition.ready;
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 720,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          } as KeyframeAnimationOptions
        );
      } catch {
        setTheme(nextTheme);
      }
    };
    themeButton?.addEventListener("click", toggleTheme);

    const canvas = document.getElementById("gl-canvas") as HTMLCanvasElement | null;
    const gl = canvas?.getContext("webgl") || canvas?.getContext("experimental-webgl");
    let glFrame = 0;
    let cleanupWebgl = () => {};

    if (canvas && gl instanceof WebGLRenderingContext) {
      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      };
      resize();
      window.addEventListener("resize", resize);

      const vertexShaderSource = `
        attribute vec2 p;
        void main(){ gl_Position=vec4(p,0.,1.); }
      `;
      const fragmentShaderSource = `
        precision highp float;
        uniform float t;
        uniform vec2  res;
        uniform vec2  mouse;
        uniform int   dark;

        float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5); }
        float noise(vec2 p){
          vec2 i=floor(p), f=fract(p);
          float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
          vec2 u=f*f*(3.-2.*f);
          return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
        }
        float fbm(vec2 p){
          float v=0., a=.5;
          for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.1+vec2(1.7,9.2); a*=.5; }
          return v;
        }

        void main(){
          vec2 uv = gl_FragCoord.xy / res;
          vec2 m  = mouse / res;

          float n = fbm(uv*2.5 + t*0.04);
          float n2 = fbm(uv*1.2 - t*0.025 + vec2(n));

          float lines = 0.;
          for(int i=0;i<5;i++){
            float fi = float(i);
            float y = uv.y + n2*0.12 + fi*0.18 + t*0.012;
            float wave = sin(y*6.28*2. - t*0.6 + fi*1.2) * 0.5 + 0.5;
            float mask = smoothstep(0.018, 0., abs(fract(y*3. + wave*0.15) - 0.5));
            lines += mask * (0.5 + 0.5*wave);
          }

          float md = length(uv - m);
          float mg = exp(-md*md*8.) * 0.08;

          vec3 col;
          if(dark == 1){
            col = vec3(0.032, 0.030, 0.028);
            col += vec3(lines * 0.07);
            col += mg * vec3(0.9, 0.87, 0.82);
            col += n2 * 0.02;
          } else {
            float paperLines = smoothstep(0.22, 0.95, lines);
            float haze = smoothstep(0.18, 0.82, n2);
            col = vec3(0.964, 0.957, 0.942);
            col -= vec3(paperLines * 0.034);
            col -= mg * vec3(0.026, 0.023, 0.018);
            col += haze * vec3(0.012, 0.010, 0.006);
            col += n * 0.006;
          }

          float vig = 1. - smoothstep(0.3, 1.1, length((uv - 0.5)*1.5));
          col = mix(col, col*0.7, 1.-vig);

          gl_FragColor = vec4(col, 1.);
        }
      `;

      const makeShader = (type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
      };

      const program = gl.createProgram();
      const vertexShader = makeShader(gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = makeShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

      if (program && vertexShader && fragmentShader) {
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

        const position = gl.getAttribLocation(program, "p");
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

        const timeUniform = gl.getUniformLocation(program, "t");
        const resUniform = gl.getUniformLocation(program, "res");
        const mouseUniform = gl.getUniformLocation(program, "mouse");
        const darkUniform = gl.getUniformLocation(program, "dark");

        let smx = window.innerWidth * 0.3;
        let smy = window.innerHeight * 0.5;
        const moveGlow = (event: MouseEvent) => {
          smx = event.clientX;
          smy = event.clientY;
        };
        document.addEventListener("mousemove", moveGlow, { passive: true });

        const frame = (timestamp: number) => {
          const dark = document.documentElement.dataset.theme === "dark" ? 1 : 0;
          gl.uniform1f(timeUniform, timestamp * 0.001);
          gl.uniform2f(resUniform, canvas.width, canvas.height);
          gl.uniform2f(mouseUniform, smx, canvas.height - smy);
          gl.uniform1i(darkUniform, dark);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          glFrame = requestAnimationFrame(frame);
        };

        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          frame(0);
        }

        cleanupWebgl = () => {
          window.removeEventListener("resize", resize);
          document.removeEventListener("mousemove", moveGlow);
          cancelAnimationFrame(glFrame);
        };
      }
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("on");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const revealElements = Array.from(document.querySelectorAll(".r"));
    revealElements.forEach((element) => revealObserver.observe(element));


    const sections = Array.from(document.querySelectorAll("section[id]")) as HTMLElement[];
    const navLinks = Array.from(document.querySelectorAll(".nav-links a")) as HTMLAnchorElement[];
    const updateActiveNav = () => {
      let current = "";
      sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - 90) current = section.id;
      });
      navLinks.forEach((link) => {
        link.style.color = link.getAttribute("href") === `#${current}` ? "var(--fg)" : "";
      });
    };
    window.addEventListener("scroll", updateActiveNav, { passive: true });

    return () => {
      document.removeEventListener("mousemove", moveCursor);
      cancelAnimationFrame(cursorFrame);
      hoverTargets.forEach((element) => {
        element.removeEventListener("mouseenter", addHover);
        element.removeEventListener("mouseleave", removeHover);
      });
      window.removeEventListener("blur", clearPointerState);
      window.removeEventListener("pagehide", clearPointerState);
      document.removeEventListener("visibilitychange", clearPointerState);
      themeButton?.removeEventListener("click", toggleTheme);
      revealObserver.disconnect();
      window.removeEventListener("scroll", updateActiveNav);
      cleanupWebgl();
    };
  }, []);

  useEffect(() => {
    const sessionKey = "aarav-portfolio-session";
    const sessionId = window.sessionStorage.getItem(sessionKey) ?? crypto.randomUUID();
    window.sessionStorage.setItem(sessionKey, sessionId);

    let cancelled = false;

    const syncStats = async (trackView: boolean) => {
      try {
        const response = await fetch("/api/hero-stats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId, trackView }),
        });

        if (!response.ok || cancelled) return;

        const payload = (await response.json()) as { totalViews: number; liveViewers: number };
        setHeroStats({
          totalViews: payload.totalViews,
          liveViewers: Math.max(1, payload.liveViewers),
        });
      } catch {
        // keep the UI quiet if stats are unavailable
      }
    };

    syncStats(true);
    const intervalId = window.setInterval(() => {
      void syncStats(false);
    }, 20_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const query = gsap.utils.selector(contactRef);
      const words = query<HTMLElement>(".contact-word");
      const graphPanel = query(".contact-graph-panel")[0];
      const actionCards = query<HTMLElement>(".contact-action");
      const closingLine = query(".contact-closing")[0];
      const marqueeTrack = marqueeRef.current;

      if (words.length) {
        gsap.fromTo(
          words,
          { opacity: 0.16, yPercent: 20 },
          {
            opacity: 1,
            yPercent: 0,
            stagger: 0.12,
            ease: "none",
            scrollTrigger: {
              trigger: contactRef.current,
              start: "top 85%",
              end: "top 25%",
              scrub: true,
            },
          }
        );
      }

      if (graphPanel) {
        gsap.fromTo(
          graphPanel,
          { scale: 0.92, opacity: 0.34, y: 72 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: graphPanel,
              start: "top 92%",
              end: "top 42%",
              scrub: true,
            },
          }
        );
      }

      if (actionCards.length) {
        gsap.fromTo(
          actionCards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: contactRef.current,
              start: "top 72%",
            },
          }
        );
      }

      if (closingLine) {
        gsap.fromTo(
          closingLine,
          { opacity: 0.12, y: 48 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: closingLine,
              start: "top 92%",
              end: "top 42%",
              scrub: true,
            },
          }
        );
      }

      if (marqueeTrack) {
        gsap.to(marqueeTrack, {
          xPercent: -50,
          duration: 24,
          ease: "none",
          repeat: -1,
        });
      }
    },
    { scope: contactRef }
  );

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const query = gsap.utils.selector(servicesRef);
      const cards = query<HTMLElement>(".service-card");
      const visualSteps = query<HTMLElement>(".service-flow-step");
      const rail = query(".services-rail")[0];

      if (rail) {
        gsap.fromTo(
          rail,
          { opacity: 0.4, y: 28 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: servicesRef.current,
              start: "top 82%",
              end: "top 24%",
              scrub: true,
            },
          }
        );
      }

      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0.18, y: 84, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 86%",
              end: "top 42%",
              scrub: true,
            },
          }
        );

        if (index < cards.length - 1) {
          gsap.to(card, {
            y: -18,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "bottom bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      });

      if (visualSteps.length) {
        gsap.fromTo(
          visualSteps,
          { opacity: 0.18, scaleX: 0.82 },
          {
            opacity: 1,
            scaleX: 1,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: servicesRef.current,
              start: "top 72%",
            },
          }
        );
      }
    },
    { scope: servicesRef }
  );

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className="cursor-ring" id="cr" />
      <div className="cursor-dot" id="cd" />

      <header>
        <div className="nav-wrap">
          <a href="#hero" className="nav-brand">Aarav Kashyap Singh</a>
          <ul className="nav-links">
            <li><a href="#about">Experience</a></li>
            <li><a href="#projects">Work</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <div className="nav-right">
            <button className="theme-toggle" id="themeBtn" aria-label="Toggle theme">☀</button>
            <a
              className="nav-cta"
              href="https://cal.com/aaravkashyap/meetings"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book Call ↗
            </a>
          </div>
        </div>
      </header>

      <section id="hero">
        <canvas id="gl-canvas" />

        <div className="hero-tweet-wrap">
          <div className="hero-tweet-label">LATEST THINKING</div>
          <a href="https://x.com/byaarav/status/2057191317420274070" target="_blank" rel="noopener noreferrer" className="custom-tweet">
            <div className="ct-arrow">↗</div>
            <div className="ct-header">
              <img src="https://unavatar.io/twitter/byaarav" alt="Aarav Kashyap" className="ct-avatar" />
              <div className="ct-user">
                <div className="ct-name-row">
                  <span className="ct-name">Aarav Kashyap</span>
                  <svg viewBox="0 0 24 24" className="ct-verified"><g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.746 1.846 3.45-.065.27-.1.55-.1.83 0 2.21 1.71 3.998 3.918 3.998.47 0 .92-.084 1.336-.25C9.182 21.585 10.49 22.5 12 22.5s2.816-.917 3.337-2.25c.416.165.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.28-.035-.56-.1-.83 1.106-.705 1.846-1.99 1.846-3.45zm-11.46 4.14l-3.8-3.8 1.41-1.42 2.39 2.39 5.89-5.89 1.41 1.42-7.3 7.3z"/></g></svg>
                </div>
                <span className="ct-handle">@byaarav</span>
              </div>
            </div>
            <div className="ct-body">
              <p>A year ago we said AI wouldn&apos;t replace X.<br/>
              It did.<br/>
              Now we&apos;re saying it won&apos;t replace Y.</p>
              <p>We never learn.</p>
              <p>The question was never what AI replaces.<br/>
              It&apos;s whether you&apos;ll be the person who adapts or the one who gets replaced.</p>
            </div>
            <div className="ct-meta">
              May 21, 2026
            </div>
            <div className="ct-actions">
              <div className="ct-action">
                <svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
              </div>
              <div className="ct-action">
                <svg viewBox="0 0 24 24"><path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"/></svg>
              </div>
            </div>
          </a>
        </div>

        <div className="hero-body">
          <div className="eyebrow">
            <span className="eyebrow-dash" />
            <span className="eyebrow-text">AI Engineer &nbsp;/&nbsp; Full Stack Developer &nbsp;/&nbsp; Builder</span>
          </div>

          <h1 className="hero-headline" aria-label="Aarav Kashyap Singh">
            <div className="word"><span>AARAV</span></div>
            <div className="word"><span>KASHYAP</span></div>
            <div className="word"><span>SINGH</span></div>
          </h1>

          <div className="hero-sub-row">
            <p className="hero-statement">
              <span className="line-1">I build AI systems that solve human problems.</span><br />
              <span className="line-2">I think harder about why than how.</span>
            </p>
          </div>

          <div className="hero-ctas">
            <a
              className="btn-outline"
              href="https://cal.com/aaravkashyap/meetings"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book a Call
            </a>
            <a
              className="social-icon"
              href="https://docs.google.com/document/d/1R5pZ2Qn8mP4_xdHolHgX2RIQP4B6ovrvKUYdlvndoOU/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Resume"
              title="Resume"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
            </a>
            {heroSocials.map((social) => (
              <a
                className="social-icon"
                href={social.href}
                target={opensNewTab(social.href) ? "_blank" : undefined}
                rel={opensNewTab(social.href) ? "noopener noreferrer" : undefined}
                aria-label={social.label}
                title={social.label}
                key={social.label}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="hero-bottom wrap">
          <div className="scroll-hint">
            <span className="scroll-track" />
            <span className="scroll-label">Scroll</span>
          </div>
          <div className="hero-stats">
            {heroSignals.map((signal) => (
              <button
                type="button"
                className="hstat"
                key={signal.label}
                aria-label={`${signal.label}. ${signal.description}`}
              >
                <span className={`hstat-pip ${signal.tone}`.trim()} />
                <span className="hstat-txt">{signal.label}</span>
                <span className="hstat-tooltip" role="tooltip">{signal.description}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      <section id="about" className="section">
        <div className="wrap">
          <div className="about-grid">
            <div className="about-body r">
              <div className="section-label">Process Signals</div>
              <h2 className="section-title">Thoughtful<br />engineer.</h2>
              <p>I&apos;m Aarav, a 21 year old AI engineer from India.</p>
              <p>I don&apos;t build things to add them to a resume. I build them because something bothered me: a problem felt unsolved, a system felt broken, a better way felt obvious.</p>
              <p>Right now I&apos;m finishing my undergrad and shipping production-grade AI systems. Not demos. Not tutorials. Things that actually run.</p>
            </div>
            <div className="about-facts facts-panel r d2">
              {facts.map(([number, title, copy]) => (
                <div className="fact" key={title}>
                  <div className="fact-n">{number}</div>
                  <div className="fact-copy"><strong>{title}</strong><span>{copy}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      <section id="projects" className="section">
        <div className="wrap projects-shell">
          <div className="proj-header r">
            <div className="projects-rail">
              <div className="section-label">Selected Work</div>
              <h2 className="projects-display">Projects that shipped.</h2>
              <p className="projects-intro">
                Not concept work. Not placeholder case studies. These are the builds where the system, the interface, and the product logic had to hold together under real use.
              </p>
              <div className="projects-rail-notes">
                <span>Production-minded</span>
                <span>Backend depth</span>
                <span>Useful AI</span>
              </div>
            </div>
            <a className="link-arrow projects-link" href="#contact">Build with me -&gt;</a>
          </div>
          <div className="proj-grid r d1">
            {projects.map((project) => (
              <div
                className={`proj-card proj-card-${project.layout} ${project.style === "in-progress" ? "proj-in-progress" : ""}`}
                key={project.title}
                onClick={() => {
                  if (project.style === "in-progress") return;
                  setExpandedArchitecture(false);
                  setActiveProject(project);
                }}
              >
                {project.style === "in-progress" && <div className="proj-badge">IN PROGRESS</div>}
                <span className="proj-arrow">-&gt;</span>
                <div className="proj-card-top">
                  <div>
                    <div className="proj-num">{project.tagline}</div>
                    <div className="proj-title">{project.title}</div>
                  </div>
                </div>
                <p className="proj-desc">{project.description}</p>
                <p className="proj-summary">{project.summary}</p>
                <div className="proj-metrics">
                  <span className="proj-metric proj-metric-status">{project.cardStatus || project.status}</span>
                  {project.cardMetrics.map((metric) => (
                    <span className="proj-metric" key={metric}>{metric}</span>
                  ))}
                </div>
                {project.style !== "in-progress" ? (
                  <>
                    <div className="proj-workflow">
                      {project.workflow.map((step, index) => (
                        <div className="proj-workflow-step" key={step}>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <strong>{step}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="proj-card-foot">
                      <div className="proj-stack">
                        {project.tags.map((tag) => <span className="badge" key={tag}>{tag}</span>)}
                      </div>
                      <span className="proj-open">Open dossier</span>
                    </div>
                  </>
                ) : (
                  <div className="proj-tease-copy">
                    <span>{project.role}</span>
                    <span>{project.summary}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activeProject && (
          <motion.div
            key="modal-overlay"
            className="proj-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setExpandedArchitecture(false);
              setActiveProject(null);
            }}
          >
            <motion.div
              className="proj-modal"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="proj-modal-close"
                onClick={() => {
                  setExpandedArchitecture(false);
                  setActiveProject(null);
                }}
                aria-label="Close project dossier"
              >
                x
              </button>

              <div className="pm-header">
                <div className="pm-header-main">
                  <span className="pm-tag">{activeProject.tagline}</span>
                  <h3 className="pm-title">{activeProject.title}</h3>
                  <p className="pm-summary">{activeProject.summary}</p>
                </div>
                <div className="pm-header-status">
                  <span>{activeProject.category}</span>
                  <strong>{activeProject.status}</strong>
                </div>
              </div>

              <div className="pm-meta-grid">
                {activeProject.facts.map(([label, value]) => (
                  <div className="pm-fact" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              <div className="pm-body">
                <div className="pm-left">
                  <div className="pm-section">
                    <h4>Why this existed</h4>
                    <p>{activeProject.why}</p>
                  </div>
                  <div className="pm-section">
                    <h4>What I owned</h4>
                    <p>{activeProject.role}</p>
                  </div>
                  <div className="pm-section">
                    <h4>Outcome</h4>
                    <p>{activeProject.impact}</p>
                  </div>
                  <div className="pm-section">
                    <h4>Tech Stack</h4>
                    <div className="pm-stack">
                      {activeProject.tags.map((tag) => <span className="badge" key={tag}>{tag}</span>)}
                    </div>
                  </div>
                  <div className="pm-section">
                    <h4>System flow</h4>
                    <div className="pm-flow">
                      {activeProject.workflow.map((step, index) => (
                        <div className="pm-flow-step" key={step}>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <strong>{step}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pm-right">
                  <div className="pm-action-row">
                    {activeProject.githubUrl ? (
                      <a href={activeProject.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">{activeProject.githubText}</a>
                    ) : (
                      <span className="btn-outline disabled">{activeProject.githubText || "Private Repo"}</span>
                    )}
                    {activeProject.demoUrl && (
                      <a href={activeProject.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">{activeProject.demoText}</a>
                    )}
                  </div>
                  {activeProject.architectureSrc ? (
                    <div className="pm-diagram-shell">
                      <button
                        type="button"
                        className="pm-diagram-button"
                        onClick={() => setExpandedArchitecture(true)}
                        aria-label={`View full ${activeProject.title} architecture`}
                      >
                        <div className="pm-diagram">
                          <Image
                            src={activeProject.architectureSrc}
                            alt={`${activeProject.title} architecture diagram`}
                            fill
                            sizes="(max-width: 768px) 100vw, 42vw"
                            className="pm-diagram-image"
                          />
                          <div className="pm-diagram-overlay">
                            <span className="pm-diagram-kicker">Workflow Preview</span>
                            <span className="pm-diagram-cta">Expand full workflow</span>
                          </div>
                        </div>
                      </button>
                      <p className="pm-diagram-caption">Open the full architecture to inspect every stage clearly.</p>
                    </div>
                  ) : (
                    <div className="pm-diagram pm-diagram-empty">
                      <span>Architecture locked for now</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeProject?.architectureSrc && expandedArchitecture && (
          <motion.div
            key="architecture-lightbox"
            className="architecture-lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedArchitecture(false)}
          >
            <motion.div
              className="architecture-lightbox"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", damping: 24, stiffness: 220 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="architecture-lightbox-head">
                <div>
                  <span className="architecture-lightbox-kicker">Full Workflow</span>
                  <h4>{activeProject.title}</h4>
                </div>
                <button
                  type="button"
                  className="architecture-lightbox-close"
                  onClick={() => setExpandedArchitecture(false)}
                  aria-label="Close architecture viewer"
                >
                  ×
                </button>
              </div>
              <div className="architecture-lightbox-frame">
                <Image
                  src={activeProject.architectureSrc}
                  alt={`${activeProject.title} architecture diagram`}
                  fill
                  sizes="(max-width: 768px) calc(100vw - 2rem), 88vw"
                  className="architecture-lightbox-image"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="divider" />

      <section id="skills" className="section">
        <div className="wrap expertise-shell">
          <div className="expertise-rail r">
            <div className="section-label">Expertise</div>
            <h2 className="expertise-display">What I work with.</h2>
            <p className="expertise-intro">
              A focused stack built around shipping real products fast and correctly.
            </p>
            <div className="expertise-rail-notes">
              <span>Built for real usage</span>
              <span>Backend depth with product taste</span>
              <span>Useful systems over trendy demos</span>
            </div>
            <div className="expertise-rail-panel">
              <span className="expertise-rail-panel-kicker">The throughline</span>
              <div className="expertise-rail-grid">
                <div>
                  <strong>Product clarity</strong>
                  <span>Interfaces should feel deliberate, not merely functional.</span>
                </div>
                <div>
                  <strong>System reliability</strong>
                  <span>APIs, queues, and data models that hold up under real usage.</span>
                </div>
                <div>
                  <strong>AI that behaves</strong>
                  <span>Model features with orchestration, evaluation, and usable outputs.</span>
                </div>
              </div>
            </div>
          </div>
          <div className="expertise-stack r d1">
            {expertiseBands.map((band) => (
              <article className="expertise-band" key={band.num}>
                <div className="expertise-band-top">
                  <span className="expertise-band-num">{band.num}</span>
                  <div className="expertise-band-heading">
                    <h3>{band.title}</h3>
                    <span>{band.tools.length} tools</span>
                  </div>
                </div>
                <div className="expertise-band-body">
                  <div className="expertise-band-copy">
                    <p className="expertise-band-summary">{band.summary}</p>
                    <p className="expertise-band-highlight">{band.highlight}</p>
                  </div>
                  <div className="expertise-band-tools">
                    {band.tools.map((tool) => (
                      <div className="expertise-tool" key={tool.name}>
                        {tool.icon && (
                          <span
                            className="skill-icon"
                            style={{
                              "--icon": tool.icon.startsWith("data:")
                                ? `url("${tool.icon}")`
                                : `url(https://cdn.simpleicons.org/${tool.icon}/white)`,
                            } as React.CSSProperties}
                          />
                        )}
                        {tool.name}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      <section id="services" className="section services-chapter" ref={servicesRef}>
        <div className="wrap services-shell">
          <div className="services-rail">
            <div className="section-label">Capabilities</div>
            <h2 className="services-display">What I build for you.</h2>
            <p className="services-intro">
              I only take on work I can own end to end. These are the systems I know how to ship, harden, and make useful.
            </p>
            <div className="services-rail-notes">
              <span>Built for real usage</span>
              <span>Product taste plus backend depth</span>
              <span>Clear scope, clear delivery</span>
            </div>

            <div className="services-rail-panel">
              <span className="services-rail-panel-kicker">Every engagement should leave you with</span>
              <div className="services-rail-grid">
                <div>
                  <strong>Clean architecture</strong>
                  <span>Not just shipped, but understandable and maintainable.</span>
                </div>
                <div>
                  <strong>Useful AI</strong>
                  <span>Integrated into workflows people will actually keep using.</span>
                </div>
                <div>
                  <strong>Sharp surfaces</strong>
                  <span>Frontend decisions that feel considered instead of assembled.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="services-stack">
            {services.map((service) => (
              <article className={`service-card service-card-${service.tone}`} key={service.num}>
                <div className="service-card-top">
                  <span className="service-card-num">{service.num}</span>
                  <span className="service-card-rule" />
                  <span className="service-card-kicker">{service.tools.join(" / ")}</span>
                </div>

                <div className="service-card-body">
                  <div className="service-card-copy">
                    <h3>{service.title}</h3>
                    <p className="service-card-outcome">{service.outcome}</p>
                    <p className="service-card-description">{service.description}</p>

                    <ul className="service-proof-list">
                      {service.proofs.map((proof) => (
                        <li key={proof}>{proof}</li>
                      ))}
                    </ul>

                    <div className="service-tool-row">
                      {service.tools.map((tool) => (
                        <span key={tool}>{tool}</span>
                      ))}
                    </div>
                  </div>

                  <div className="service-card-visual" aria-hidden="true">
                    <div className="service-flow">
                      {service.flow.map((step, index) => (
                        <div className="service-flow-step" key={step}>
                          <span className="service-flow-index">0{index + 1}</span>
                          <span className="service-flow-label">{step}</span>
                        </div>
                      ))}
                    </div>
                    <div className="service-visual-caption">workflow sketch</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      <section id="contact" className="contact-chapter" ref={contactRef}>
        <div className="contact-noise" />
        <div className="contact-hero">
          <div className="contact-copy">
            <div className="contact-topline">
              <span className="contact-kicker">Available for meaningful builds</span>
              <span className="contact-status">
                <span className="contact-status-dot" />
                Usually replies within 24h
              </span>
            </div>
            <h2 className="contact-display">
              <span className="contact-word">Work</span>{" "}
              <span className="contact-word">hard.</span>
              <br />
              <span className="contact-word contact-word-bright">Play</span>{" "}
              <span className="contact-word">hard.</span>
            </h2>
            <p className="contact-lede">
              I build production grade AI systems, sharp product surfaces, and workflows that still feel good when real people start leaning on them every day.
            </p>

            <div className="contact-actions-grid">
              {contactActions.map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                  className={`contact-action contact-action-${action.tone}`}
                >
                  <span className="contact-action-kicker">{action.kicker}</span>
                  <span className="contact-action-main">
                    <span className="contact-action-label">{action.label}</span>
                    <span className="contact-action-arrow">-&gt;</span>
                  </span>
                  <span className="contact-action-detail">{action.detail}</span>
                </a>
              ))}
            </div>

            <div className="contact-meta">
              <span>India / Remote worldwide</span>
              <span>Freelance, consulting, and selective full-time roles</span>
              <span>Shipping with design taste and backend depth</span>
            </div>
          </div>

          <aside className="contact-graph-panel">
            <div className="contact-graph-head">
              <span className="contact-kicker">Built in public</span>
              <h3>Proof beats posture.</h3>
              <p>A clean shipping rhythm matters more than loud claims. This panel should read like signal, not decoration.</p>
            </div>
            <GitHubGraph />
          </aside>
        </div>

        <div className="contact-foot">
          <span className="contact-signature">Built with care in India / 2026</span>
          <div className="contact-links">
            {contactLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={opensNewTab(link.href) ? "_blank" : undefined}
                rel={opensNewTab(link.href) ? "noopener noreferrer" : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="contact-marquee" aria-hidden="true">
          <div className="contact-marquee-track" ref={marqueeRef}>
            {[...contactMarquee, ...contactMarquee].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>

        <div className="contact-closing">Work hard. Play hard.</div>
      </section>
    </>
  );
}


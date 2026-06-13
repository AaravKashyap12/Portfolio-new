import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Resume page for Aarav Kashyap Singh, also known as Aarav Kashyap, an AI Engineer and Full Stack Developer from India.",
  alternates: {
    canonical: "https://www.aaravkashyap.live/resume",
  },
};

export default function ResumePage() {
  return (
    <main className="resume-page">
      <section className="resume-shell">
        <p className="resume-kicker">Resume</p>
        <h1>Aarav Kashyap Singh</h1>
        <p className="resume-copy">
          AI engineer and full-stack developer building production AI systems, document intelligence
          tools, automation pipelines, and practical software that ships.
        </p>
        <div className="resume-actions">
          <a href="mailto:aaravkashyap1203@gmail.com" className="btn-outline">Email</a>
          <a href="https://github.com/AaravKashyap12" className="btn-outline">GitHub</a>
          <Link href="/" className="btn-outline">Back Home</Link>
        </div>
      </section>
    </main>
  );
}

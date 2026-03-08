import type { CSSProperties } from "react";
import styles from "@/app/style/home/ProjectCard.module.css";

const TILTS = ["-2.5deg", "1.8deg", "-1.2deg"];

const BADGE_POSITIONS = [
  { top: "24%", left: "22%" },
  { top: "20%", left: "76%" },
  { top: "74%", left: "18%" },
  { top: "78%", left: "80%" },
  { top: "8%",  left: "52%" },
  { top: "90%", left: "50%" },
];

interface ProjectCardProps {
  title: string;
  tech: string[];
  color: string;
  index: number;
  link: string;
}

export function ProjectCard({ title, tech, color, index, link }: ProjectCardProps) {
  const tilt = TILTS[index % TILTS.length];

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.projectCard}
      style={{ transform: `rotate(${tilt})` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/img/project1.png"
        alt={title}
        className={styles.projectImage}
        draggable={false}
      />
      <div className={styles.titleGlass}>
        <span className={styles.title}>{title}</span>
        <span className={styles.mobileSubtitle}>{tech.join(", ")}</span>
      </div>
      <div className={styles.projectTech}>
        {tech.map((t, i) => {
          const pos = BADGE_POSITIONS[i % BADGE_POSITIONS.length];
          return (
            <span
              key={t}
              className={styles.techBadge}
              style={{
                "--badge-top": pos.top,
                "--badge-left": pos.left,
                "--badge-delay": `${i * 60}ms`,
              } as CSSProperties}
            >
              {t}
            </span>
          );
        })}
      </div>
    </a>
  );
}

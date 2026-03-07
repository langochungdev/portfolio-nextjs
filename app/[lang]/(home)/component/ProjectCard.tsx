import type { Locale } from "@/lib/i18n/config";
import styles from "@/app/style/home/ProjectCard.module.css";

const TILTS = ["-2.5deg", "1.8deg", "-1.2deg"];

interface ProjectCardProps {
  title: string;
  description: Record<Locale, string>;
  tech: string[];
  color: string;
  locale: Locale;
  index: number;
}

export function ProjectCard({ title, description, tech, color, locale, index }: ProjectCardProps) {
  const tilt = TILTS[index % TILTS.length];

  return (
    <div
      className={styles.projectCard}
      style={{
        transform: `rotate(${tilt})`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/img/project1.png"
        alt={title}
        className={styles.projectImage}
        draggable={false}
      />
      <span className={styles.titleGlass}>{title}</span>
      <div className={styles.hoverGlass}>
        <p className={styles.projectDesc}>{description[locale]}</p>
        <div className={styles.projectTech}>
          {tech.map((t) => (
            <span key={t} className={styles.techBadge}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

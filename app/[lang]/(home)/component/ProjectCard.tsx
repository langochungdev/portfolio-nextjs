import type { Locale } from "@/lib/i18n/config";
import styles from "@/app/style/home/ProjectCard.module.css";

interface ProjectCardProps {
  title: string;
  description: Record<Locale, string>;
  tech: string[];
  locale: Locale;
}

export function ProjectCard({ title, description, tech, locale }: ProjectCardProps) {
  return (
    <div className={styles.projectCard}>
      <span className={styles.projectTitle}>{title}</span>
      <p className={styles.projectDesc}>{description[locale]}</p>
      <div className={styles.projectTech}>
        {tech.map((t) => (
          <span key={t} className={styles.techBadge}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { projectsData } from "@/lib/mock/home";
import { ProjectCard } from "./ProjectCard";
import styles from "./styles/ProjectsSection.module.css";

export function ProjectsSection() {
  const { dictionary: dict, locale } = useDictionary();

  return (
    <section className={styles.projectsSection}>
      <h3 className={styles.sectionTitle}>{"// "}{dict.home.projects}</h3>
      {projectsData.slice(0, 3).map((project) => (
        <ProjectCard
          key={project.id}
          title={project.title}
          description={project.description}
          tech={project.tech}
          locale={locale}
        />
      ))}
    </section>
  );
}

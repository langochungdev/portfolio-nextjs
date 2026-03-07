"use client";

import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { projectsData } from "@/lib/mock/home";
import { ProjectCard } from "./ProjectCard";
import styles from "@/app/style/home/ProjectsSection.module.css";

export function ProjectsSection() {
  const { dictionary: dict, locale } = useDictionary();

  return (
    <section className={styles.projectsSection}>
      {projectsData.slice(0, 3).map((project, index) => (
        <ProjectCard
          key={project.id}
          title={project.title}
          description={project.description}
          tech={project.tech}
          color={project.color}
          locale={locale}
          index={index}
        />
      ))}
    </section>
  );
}

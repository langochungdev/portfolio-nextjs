import { projectsData } from "@/lib/mock/home";
import { ProjectCard } from "./ProjectCard";
import styles from "@/app/style/home/ProjectsSection.module.css";

export function ProjectsSection() {

  return (
    <section className={styles.projectsSection}>
      {projectsData.slice(0, 3).map((project, index) => (
        <ProjectCard
          key={project.id}
          title={project.title}
          image={project.image}
          touchDescription={project.touchDescription}
          tech={project.tech}
          color={project.color}
          link={project.link}
          index={index}
        />
      ))}
    </section>
  );
}

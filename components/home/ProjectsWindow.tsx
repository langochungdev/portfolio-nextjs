import Window from "@/components/shared/Window";
import { projectsData } from "@/lib/mock/home";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/config";

interface ProjectsWindowProps {
  dict: Dictionary;
  locale: Locale;
}

export default function ProjectsWindow({ dict, locale }: ProjectsWindowProps) {
  return (
    <Window
      title={dict.home.projectsTitle}
      icon="green"
      className="win-window-full projects-window"
    >
      <div className="projects-grid">
        {projectsData.map((project) => (
          <div key={project.id} className="project-card">
            <div
              className="project-card-image"
              style={{ backgroundColor: project.color }}
            >
              {project.title}
            </div>
            <div className="project-card-body">
              <div className="project-card-title">{project.title}</div>
              <p className="project-card-desc">
                {project.description[locale]}
              </p>
              <div className="project-card-tech">
                {project.tech.map((t) => (
                  <span key={t} className="project-tech-tag">
                    {t}
                  </span>
                ))}
              </div>
              <div className="project-card-actions">
                <button>{dict.home.viewProject}</button>
                <button>{dict.home.viewSource}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Window>
  );
}

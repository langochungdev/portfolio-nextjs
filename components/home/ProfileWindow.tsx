import Window from "@/components/shared/Window";
import { profileData } from "@/lib/mock/home";
import type { Dictionary } from "@/lib/i18n/getDictionary";

interface ProfileWindowProps {
  dict: Dictionary;
}

export default function ProfileWindow({ dict }: ProfileWindowProps) {
  return (
    <Window
      title={dict.home.profileTitle}
      icon="blue"
      className="win-window-fixed profile-window"
    >
      <div className="profile-avatar-area">
        <div className="profile-avatar">{profileData.avatar}</div>
        <div>
          <div className="profile-name">{dict.home.name}</div>
          <div className="profile-role">{dict.home.role}</div>
        </div>
      </div>
      <p className="profile-bio">{dict.home.bio}</p>
      <div className="profile-info-row">
        <span className="profile-info-label">📍</span>
        <span>{dict.home.location}</span>
      </div>
      <div className="profile-info-row">
        <span className="profile-info-label">✉️</span>
        <span>{dict.home.email}</span>
      </div>
      <div className="profile-skills">
        {profileData.skills.map((skill) => (
          <span key={skill} className="profile-skill-tag">
            {skill}
          </span>
        ))}
      </div>
      <div className="profile-links">
        <button>GitHub</button>
        <button>LinkedIn</button>
        <button>Twitter / X</button>
      </div>
    </Window>
  );
}

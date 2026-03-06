"use client";

import { profileData } from "@/lib/mock/home";
import styles from "./styles/PortraitSection.module.css";

const ICON_POSITIONS = [
  styles.techIcon1,
  styles.techIcon2,
  styles.techIcon3,
  styles.techIcon4,
  styles.techIcon5,
  styles.techIcon6,
];

export function PortraitSection() {
  const visibleSkills = profileData.skills.slice(0, ICON_POSITIONS.length);

  return (
    <>
      <div className={styles.techStackOverlay}>
        {visibleSkills.map((skill, i) => (
          <div
            key={skill}
            className={`${styles.techIcon} ${ICON_POSITIONS[i]}`}
          >
            {skill}
          </div>
        ))}
      </div>

      <div className={styles.portraitWrapper}>
        <div className={styles.portraitPlaceholder}>
          <span className={styles.portraitInitial}>{profileData.avatar}</span>
        </div>
      </div>
    </>
  );
}

"use client";

import { profileData } from "@/lib/mock/home";
import styles from "@/app/style/home/PortraitSection.module.css";

const ICON_POSITIONS = [
  styles.techIcon1,
  styles.techIcon2,
  styles.techIcon3,
  styles.techIcon4,
  styles.techIcon5,
  styles.techIcon6,
  styles.techIcon7,
  styles.techIcon8,
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
        <img
          src="/img/portrait.webp"
          alt="portrait"
          className={styles.portraitImage}          draggable={false}        />
      </div>
    </>
  );
}

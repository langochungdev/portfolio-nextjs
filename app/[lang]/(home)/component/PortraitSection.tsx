import Image from "next/image";
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
  styles.techIcon9,
  styles.techIcon10,
];

export function PortraitSection() {
  const visibleSkills = profileData.skills.slice(0, ICON_POSITIONS.length);

  return (
    <>
      <div className={styles.techStackOverlay}>
        {visibleSkills.map((skill, i) => (
          <div
            key={skill.name}
            className={`${styles.techIcon} ${ICON_POSITIONS[i]}`}
          >
            <Image
              src={skill.icon}
              alt={skill.name}
              width={40}
              height={40}
              draggable={false}
            />
          </div>
        ))}
      </div>

      <div className={styles.portraitWrapper}>
        <Image
          src="/img/portrait.webp"
          alt="portrait"
          width={400}
          height={500}
          priority
          className={styles.portraitImage}
          draggable={false}
        />
      </div>
    </>
  );
}

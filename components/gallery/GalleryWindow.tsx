import Window from "@/components/shared/Window";
import { certificates } from "@/lib/mock/gallery";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/config";

interface GalleryWindowProps {
  dict: Dictionary;
  locale: Locale;
}

export default function GalleryWindow({ dict, locale }: GalleryWindowProps) {
  return (
    <Window
      title={dict.gallery.title}
      icon="yellow"
      className="win-window-full gallery-window"
    >
      <p className="gallery-desc">{dict.gallery.description}</p>
      <div className="gallery-grid">
        {certificates.map((cert) => (
          <div key={cert.id} className="gallery-card">
            <div
              className="gallery-card-image"
              style={{ backgroundColor: cert.color + "22" }}
            >
              {cert.emoji}
            </div>
            <div className="gallery-card-body">
              <div className="gallery-card-title">{cert.title[locale]}</div>
              <div className="gallery-card-issuer">
                {dict.gallery.issuedBy}: {cert.issuer}
              </div>
              <div className="gallery-card-date">
                {dict.gallery.date}: {cert.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Window>
  );
}

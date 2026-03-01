import Window from "@/components/shared/Window";
import { certificates } from "@/lib/mock/gallery";
import type { Dictionary } from "@/lib/i18n/getDictionary";

interface GalleryFilterProps {
  dict: Dictionary;
}

export default function GalleryFilter({ dict }: GalleryFilterProps) {
  const totalCerts = certificates.filter(
    (c) => c.type === "certificate"
  ).length;
  const totalAwards = certificates.filter((c) => c.type === "award").length;

  return (
    <Window
      title="Filter"
      icon="purple"
      className="win-window-sidebar gallery-filter-window"
    >
      <div className="gallery-filter-list">
        <button>
          📋 {dict.gallery.certificates} ({totalCerts})
        </button>
        <button>
          🏆 {dict.gallery.awards} ({totalAwards})
        </button>
      </div>
      <div className="gallery-stats">
        <div className="gallery-stat-row">
          <span>{dict.gallery.certificates}</span>
          <span className="gallery-stat-value">{totalCerts}</span>
        </div>
        <div className="gallery-stat-row">
          <span>{dict.gallery.awards}</span>
          <span className="gallery-stat-value">{totalAwards}</span>
        </div>
        <div className="gallery-stat-row">
          <span>Total</span>
          <span className="gallery-stat-value">{certificates.length}</span>
        </div>
      </div>
    </Window>
  );
}

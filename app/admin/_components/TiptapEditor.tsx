"use client";

import {
  useEditor,
  EditorContent,
  ReactRenderer,
  NodeViewWrapper,
  NodeViewContent,
  type NodeViewProps,
} from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Details, DetailsSummary, DetailsContent } from "@tiptap/extension-details";
import ImageExt from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";
import { Node, Extension, ReactNodeViewRenderer, mergeAttributes } from "@tiptap/react";
import Suggestion, { type SuggestionProps } from "@tiptap/suggestion";
import { Plugin } from "@tiptap/pm/state";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { common, createLowlight } from "lowlight";
import styles from "@/app/style/admin/editor.module.css";

const lowlight = createLowlight(common);

const CODE_LANGUAGE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "plaintext", label: "TXT" },
  { value: "javascript", label: "JS" },
  { value: "typescript", label: "TS" },
  { value: "xml", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go" },
  { value: "sql", label: "SQL" },
  { value: "markdown", label: "MD" },
];

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

interface CommandItem {
  title: string;
  description: string;
  icon: string;
  command: (props: { editor: ReturnType<typeof useEditor>; range: { from: number; to: number } }) => void;
}

function setSingleCodeBlockFromSelection(
  editor: ReturnType<typeof useEditor>,
  range?: { from: number; to: number }
): boolean {
  if (!editor) return false;

  const from = range?.from ?? editor.state.selection.from;
  const to = range?.to ?? editor.state.selection.to;

  if (from >= to) {
    return editor.chain().focus().toggleCodeBlock().run();
  }

  const selectedText = editor.state.doc.textBetween(from, to, "\n", "\n");
  return editor
    .chain()
    .focus()
    .insertContentAt(
      { from, to },
      {
        type: "codeBlock",
        attrs: { language: "plaintext", width: null, textAlign: "center" },
        content: selectedText ? [{ type: "text", text: selectedText }] : [],
      }
    )
    .run();
}

interface ImageInsertPayload {
  src: string;
  alt: string;
  width?: number;
  sourceType?: "local" | "url";
  cropMode?: boolean;
  cropX?: number;
  cropY?: number;
  cropScale?: number;
  cropHeight?: number | null;
  radius?: number;
  naturalWidth?: number | null;
  naturalHeight?: number | null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function ImageModal({ onInsert, onClose }: { onInsert: (payload: ImageInsertPayload) => void; onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<"local" | "url" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const getImageNaturalSize = (src: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error("image-load-failed"));
      image.src = src;
    });
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          resolve(result);
          return;
        }
        reject(new Error("invalid-image-result"));
      };
      reader.onerror = () => reject(reader.error ?? new Error("read-image-failed"));
      reader.readAsDataURL(file);
    });
  };

  const handleLocalFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setLocalPreview(dataUrl);
      setUrl("");
      setSourceType("local");
    } catch {
      setLocalPreview(null);
      setSourceType(null);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void handleLocalFile(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    void handleLocalFile(file);
  };

  const handleUrlChange = (val: string) => {
    setUrl(val);
    setLocalPreview(null);
    setSourceType(val.trim() ? "url" : null);
  };

  const handleInsert = async () => {
    if (sourceType === "local" && localPreview) {
      setSubmitting(true);
      try {
        const naturalSize = await getImageNaturalSize(localPreview);
        const insertWidth = Math.max(220, Math.min(1200, Math.round(naturalSize.width || 300)));

        onInsert({
          src: localPreview,
          alt: alt.trim(),
          width: insertWidth,
          sourceType: "local",
          cropMode: false,
          cropX: 50,
          cropY: 50,
          cropScale: 1,
          cropHeight: null,
          radius: 10,
          naturalWidth: naturalSize.width ? Math.round(naturalSize.width) : null,
          naturalHeight: naturalSize.height ? Math.round(naturalSize.height) : null,
        });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const src = url.trim();
    if (!src) return;
    onInsert({
      src,
      alt: alt.trim(),
      width: 300,
      sourceType: "url",
      cropMode: true,
      cropX: 50,
      cropY: 50,
      cropScale: 1,
      cropHeight: 220,
      radius: 10,
      naturalWidth: null,
      naturalHeight: null,
    });
  };

  return (
    <div className={styles.imageModalOverlay} onClick={onClose}>
      <div className={styles.imageModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.imageModalHeader}>
          <span className={styles.imageModalTitle}>Chèn ảnh</span>
          <button type="button" className={styles.imageModalClose} onClick={onClose}>&#x2715;</button>
        </div>

        <div className={styles.imageModalBody}>
          <label className={styles.label}>URL</label>
          <input
            className={styles.input}
            type="text"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com/image.png"
          />

          <div className={styles.imageModalDivider}>
            <span>hoặc</span>
          </div>

          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} hidden />
          <button
            type="button"
            className={styles.imageModalUploadBtn}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v7M5 6l3-3 3 3M3 11v1.5A1.5 1.5 0 004.5 14h7a1.5 1.5 0 001.5-1.5V11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Tải ảnh từ máy
          </button>

          {sourceType === "local" && localPreview && (
            <>
              <div className={styles.imageModalPreview}>
                <img src={localPreview} alt="Local preview" />
              </div>
              <div className={styles.imageHintText}>Ảnh từ máy sẽ được chèn nguyên bản, không crop mặc định.</div>
            </>
          )}

          {sourceType === "url" && url.trim() && (
            <div className={styles.imageModalPreview}>
              <img src={url} alt="Preview" />
            </div>
          )}

          {sourceType === "url" && (
            <div className={styles.imageHintText}>
              Ảnh URL sẽ dùng fake crop trong editor: kéo để set vùng hiển thị, không cắt file gốc.
            </div>
          )}

          <label className={styles.label} style={{ marginTop: "0.75rem" }}>Alt text (SEO)</label>
          <input
            className={styles.input}
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Mô tả ngắn gọn nội dung ảnh..."
          />
        </div>

        <div className={styles.imageModalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Hủy</button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={() => void handleInsert()}
            disabled={submitting || (!localPreview && !url.trim())}
          >
            {submitting ? "Đang cắt..." : "Chèn"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmbedModal({ title, placeholder: ph, onInsert, onClose }: {
  title: string;
  placeholder: string;
  onInsert: (src: string) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");

  return (
    <div className={styles.imageModalOverlay} onClick={onClose}>
      <div className={styles.imageModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.imageModalHeader}>
          <span className={styles.imageModalTitle}>{title}</span>
          <button type="button" className={styles.imageModalClose} onClick={onClose}>&#x2715;</button>
        </div>
        <div className={styles.imageModalBody}>
          <label className={styles.label}>URL</label>
          <input
            className={styles.input}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={ph}
            autoFocus
          />
        </div>
        <div className={styles.imageModalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Hủy</button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={() => { if (url.trim()) onInsert(url.trim()); }}
            disabled={!url.trim()}
          >
            Chèn
          </button>
        </div>
      </div>
    </div>
  );
}

function HtmlCodeModal({ onInsert, onClose }: {
  onInsert: (html: string) => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");

  return (
    <div className={styles.imageModalOverlay} onClick={onClose}>
      <div className={styles.htmlCodeModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.imageModalHeader}>
          <span className={styles.imageModalTitle}>Nhúng HTML</span>
          <button type="button" className={styles.imageModalClose} onClick={onClose}>&#x2715;</button>
        </div>
        <div className={styles.imageModalBody}>
          <label className={styles.label}>HTML Code</label>
          <textarea
            className={styles.htmlCodeTextarea}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste toàn bộ HTML code vào đây..."
            autoFocus
            rows={12}
            spellCheck={false}
          />
        </div>
        <div className={styles.imageModalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Hủy</button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={() => { if (code.trim()) onInsert(code.trim()); }}
            disabled={!code.trim()}
          >
            Chèn
          </button>
        </div>
      </div>
    </div>
  );
}

function LinkModal({ initialUrl, onInsert, onClose }: {
  initialUrl: string;
  onInsert: (url: string) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState(initialUrl);

  return (
    <div className={styles.imageModalOverlay} onClick={onClose}>
      <div className={styles.imageModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.imageModalHeader}>
          <span className={styles.imageModalTitle}>Chèn liên kết</span>
          <button type="button" className={styles.imageModalClose} onClick={onClose}>&#x2715;</button>
        </div>
        <div className={styles.imageModalBody}>
          <label className={styles.label}>URL</label>
          <input
            className={styles.input}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            autoFocus
          />
        </div>
        <div className={styles.imageModalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Hủy</button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={() => { if (url.trim()) onInsert(url.trim()); }}
            disabled={!url.trim()}
          >
            Chèn
          </button>
        </div>
      </div>
    </div>
  );
}

interface MediaModalProps {
  title: string;
  accept: string;
  onInsert: (src: string, alt: string) => void;
  onClose: () => void;
}

function MediaModal({ title, accept, onInsert, onClose }: MediaModalProps) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUrl("");
  };

  const handleUrlChange = (val: string) => {
    setUrl(val);
    setPreview(null);
    setFileName(null);
  };

  const handleInsert = () => {
    const src = preview ?? url.trim();
    if (src) onInsert(src, alt.trim());
  };

  return (
    <div className={styles.imageModalOverlay} onClick={onClose}>
      <div className={styles.imageModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.imageModalHeader}>
          <span className={styles.imageModalTitle}>{title}</span>
          <button type="button" className={styles.imageModalClose} onClick={onClose}>&#x2715;</button>
        </div>
        <div className={styles.imageModalBody}>
          <label className={styles.label}>URL</label>
          <input
            className={styles.input}
            type="text"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com/file..."
          />
          <div className={styles.imageModalDivider}><span>hoặc</span></div>
          <input ref={fileRef} type="file" accept={accept} onChange={handleFile} hidden />
          <button
            type="button"
            className={styles.imageModalUploadBtn}
            onClick={() => fileRef.current?.click()}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v7M5 6l3-3 3 3M3 11v1.5A1.5 1.5 0 004.5 14h7a1.5 1.5 0 001.5-1.5V11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Tải file từ máy
          </button>
          {fileName && <div className={styles.mediaFileName}>{fileName}</div>}
          <label className={styles.label} style={{ marginTop: "0.75rem" }}>Alt text (SEO)</label>
          <input
            className={styles.input}
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Mô tả ngắn gọn..."
          />
        </div>
        <div className={styles.imageModalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Hủy</button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleInsert}
            disabled={!preview && !url.trim()}
          >
            Chèn
          </button>
        </div>
      </div>
    </div>
  );
}

type Align = "left" | "center" | "right";

function beginPointerResize(
  event: React.PointerEvent<HTMLElement>,
  onDelta: (dx: number, dy: number) => void,
) {
  event.preventDefault();
  event.stopPropagation();

  const pointerId = event.pointerId;
  const startX = event.clientX;
  const startY = event.clientY;
  const target = event.currentTarget;
  const listenerOpts: AddEventListenerOptions = { capture: true };
  let active = true;

  const stop = () => {
    if (!active) return;
    active = false;
    window.removeEventListener("pointermove", onMove, listenerOpts);
    window.removeEventListener("pointerup", onUp, listenerOpts);
    window.removeEventListener("pointercancel", onCancel, listenerOpts);
    window.removeEventListener("blur", onBlur);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    target.removeEventListener("lostpointercapture", onLostPointerCapture);

    try {
      if (target.hasPointerCapture(pointerId)) {
        target.releasePointerCapture(pointerId);
      }
    } catch {
      // no-op
    }
  };

  const onMove = (ev: PointerEvent) => {
    if (!active || ev.pointerId !== pointerId) return;
    if (ev.buttons === 0) {
      stop();
      return;
    }
    onDelta(ev.clientX - startX, ev.clientY - startY);
  };

  const onUp = (ev: PointerEvent) => {
    if (ev.pointerId !== pointerId) return;
    stop();
  };

  const onCancel = (ev: PointerEvent) => {
    if (ev.pointerId !== pointerId) return;
    stop();
  };

  const onBlur = () => {
    stop();
  };

  const onVisibilityChange = () => {
    if (document.visibilityState !== "visible") {
      stop();
    }
  };

  const onLostPointerCapture = () => {
    stop();
  };

  try {
    target.setPointerCapture(pointerId);
  } catch {
    // no-op
  }

  target.addEventListener("lostpointercapture", onLostPointerCapture);
  window.addEventListener("pointermove", onMove, listenerOpts);
  window.addEventListener("pointerup", onUp, listenerOpts);
  window.addEventListener("pointercancel", onCancel, listenerOpts);
  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", onVisibilityChange);
}

function ResizableImage({ node, updateAttributes, selected }: NodeViewProps) {
  const {
    src,
    alt,
    width,
    textAlign,
    sourceType,
    cropMode,
    cropX,
    cropY,
    cropScale,
    cropHeight,
    radius,
  } = node.attrs as {
    src: string;
    alt: string;
    width: number | null;
    textAlign: Align;
    sourceType: "local" | "url";
    cropMode: boolean;
    cropX: number;
    cropY: number;
    cropScale: number;
    cropHeight: number | null;
    radius: number;
  };
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [altValue, setAltValue] = useState(alt ?? "");

  const resolvedCropMode = Boolean(cropMode);
  const resolvedCropX = typeof cropX === "number" ? cropX : 50;
  const resolvedCropY = typeof cropY === "number" ? cropY : 50;
  const resolvedCropScale = typeof cropScale === "number" ? cropScale : 1;
  const resolvedRadius = typeof radius === "number" ? radius : 10;
  const resolvedCropHeight = typeof cropHeight === "number" ? cropHeight : 220;

  const onPointerDown = useCallback((pos: "right" | "bottom-right" | "bottom") => (e: React.PointerEvent<HTMLDivElement>) => {
    const startWidth = wrapRef.current?.offsetWidth ?? width ?? 400;
    const startHeight = resolvedCropHeight;
    beginPointerResize(e, (dx, dy) => {
      const updates: Record<string, number> = {};
      if (pos === "right" || pos === "bottom-right") {
        const newWidth = Math.max(80, startWidth + dx);
        updates.width = newWidth;
      }
      if (pos === "bottom" && resolvedCropMode) {
        updates.cropHeight = Math.max(120, startHeight + dy);
      }
      if (Object.keys(updates).length > 0) {
        updateAttributes(updates);
      }
    });
  }, [width, resolvedCropHeight, resolvedCropMode, updateAttributes]);

  const onCropDragStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!selected || !resolvedCropMode) return;
    const target = e.target as HTMLElement;
    if (target.closest(`.${styles.resizeHandle}`) || target.closest(`.${styles.mediaCaptionInput}`) || target.closest(`.${styles.imageControlRow}`)) {
      return;
    }
    const frameWidth = wrapRef.current?.offsetWidth ?? width ?? 300;
    const frameHeight = resolvedCropHeight;
    const startX = resolvedCropX;
    const startY = resolvedCropY;

    beginPointerResize(e, (dx, dy) => {
      const nextX = clamp(startX - (dx / Math.max(frameWidth, 1)) * 100, 0, 100);
      const nextY = clamp(startY - (dy / Math.max(frameHeight, 1)) * 100, 0, 100);
      updateAttributes({ cropX: nextX, cropY: nextY });
    });
  }, [selected, resolvedCropMode, width, resolvedCropHeight, resolvedCropX, resolvedCropY, updateAttributes]);

  const setAlign = (a: Align) => updateAttributes({ textAlign: a });

  return (
    <NodeViewWrapper
      className={styles.imgNodeWrap}
      style={getAlignStyle(textAlign)}
    >
      <div ref={wrapRef} className={styles.imgNodeOuter} style={{ width: width ? `${width}px` : "100%" }}>
        {selected && <AlignToolbar current={textAlign} onChange={setAlign} />}
        {selected && (
          <div className={styles.imageControlRow}>
            <label className={styles.imageControlLabel}>
              Bo góc
              <input
                className={styles.imageControlRange}
                type="range"
                min={0}
                max={32}
                step={1}
                value={resolvedRadius}
                onChange={(e) => updateAttributes({ radius: Number(e.target.value) })}
              />
            </label>
            {resolvedCropMode && (
              <label className={styles.imageControlLabel}>
                Zoom
                <input
                  className={styles.imageControlRange}
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={resolvedCropScale}
                  onChange={(e) => updateAttributes({ cropScale: Number(e.target.value) })}
                />
              </label>
            )}
          </div>
        )}
        <div
          className={`${styles.imgNodeInner} ${selected ? styles.imgNodeSelected : ""} ${resolvedCropMode ? styles.imgNodeInnerCrop : ""}`}
          style={resolvedCropMode ? { height: `${resolvedCropHeight}px`, borderRadius: `${resolvedRadius}px` } : { borderRadius: `${resolvedRadius}px` }}
          onPointerDown={onCropDragStart}
        >
          <img
            ref={imgRef}
            src={src}
            alt={alt ?? ""}
            draggable={false}
            className={`${styles.imgNodeImg} ${resolvedCropMode ? styles.imgNodeImgCrop : ""}`}
            style={resolvedCropMode
              ? {
                borderRadius: `${resolvedRadius}px`,
                objectPosition: `${resolvedCropX}% ${resolvedCropY}%`,
                transform: `scale(${resolvedCropScale})`,
                transformOrigin: `${resolvedCropX}% ${resolvedCropY}%`,
              }
              : { borderRadius: `${resolvedRadius}px` }}
          />
        </div>
        {selected ? (
          <input
            className={styles.mediaCaptionInput}
            type="text"
            value={altValue}
            onChange={(e) => setAltValue(e.target.value)}
            onBlur={() => updateAttributes({ alt: altValue })}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); updateAttributes({ alt: altValue }); (e.target as HTMLInputElement).blur(); } }}
            placeholder="Nhập mô tả ảnh..."
            onClick={(e) => e.stopPropagation()}
          />
        ) : altValue ? (
          <span className={styles.mediaCaption}>{altValue}</span>
        ) : null}
        {selected && (
          <>
            <div className={`${styles.resizeHandle} ${styles.resizeHandleRight}`} onPointerDown={onPointerDown("right")} />
            {resolvedCropMode && <div className={`${styles.resizeHandle} ${styles.resizeHandleBottom}`} onPointerDown={onPointerDown("bottom")} />}
            <div className={`${styles.resizeHandle} ${styles.resizeHandleBottomRight}`} onPointerDown={onPointerDown("bottom-right")} />
          </>
        )}
        {selected && resolvedCropMode && (
          <div className={styles.imageCropHint}>{sourceType === "url" ? "Kéo ảnh để set vùng hiển thị (fake crop)" : "Kéo ảnh để canh vùng hiển thị"}</div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

const CustomImage = ImageExt.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => {
          const w = el.getAttribute("width");
          return w ? Number(w) : null;
        },
        renderHTML: (attrs) => (attrs.width ? { width: attrs.width } : {}),
      },
      textAlign: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") || "center",
        renderHTML: (attrs) => ({ "data-align": attrs.textAlign }),
      },
      naturalWidth: {
        default: null,
        parseHTML: (el) => {
          const value = el.getAttribute("data-natural-width");
          return value ? Number(value) : null;
        },
        renderHTML: (attrs) => (attrs.naturalWidth ? { "data-natural-width": attrs.naturalWidth } : {}),
      },
      naturalHeight: {
        default: null,
        parseHTML: (el) => {
          const value = el.getAttribute("data-natural-height");
          return value ? Number(value) : null;
        },
        renderHTML: (attrs) => (attrs.naturalHeight ? { "data-natural-height": attrs.naturalHeight } : {}),
      },
      sourceType: {
        default: "url",
        parseHTML: (el) => (el.getAttribute("data-source-type") as "local" | "url" | null) || "url",
        renderHTML: (attrs) => ({ "data-source-type": attrs.sourceType }),
      },
      cropMode: {
        default: false,
        parseHTML: (el) => el.getAttribute("data-crop-mode") === "true",
        renderHTML: (attrs) => (attrs.cropMode ? { "data-crop-mode": "true" } : {}),
      },
      cropX: {
        default: 50,
        parseHTML: (el) => {
          const value = el.getAttribute("data-crop-x");
          return value ? Number(value) : 50;
        },
        renderHTML: (attrs) => ({ "data-crop-x": attrs.cropX ?? 50 }),
      },
      cropY: {
        default: 50,
        parseHTML: (el) => {
          const value = el.getAttribute("data-crop-y");
          return value ? Number(value) : 50;
        },
        renderHTML: (attrs) => ({ "data-crop-y": attrs.cropY ?? 50 }),
      },
      cropScale: {
        default: 1,
        parseHTML: (el) => {
          const value = el.getAttribute("data-crop-scale");
          return value ? Number(value) : 1;
        },
        renderHTML: (attrs) => ({ "data-crop-scale": attrs.cropScale ?? 1 }),
      },
      cropHeight: {
        default: null,
        parseHTML: (el) => {
          const value = el.getAttribute("data-crop-height");
          return value ? Number(value) : null;
        },
        renderHTML: (attrs) => (attrs.cropHeight ? { "data-crop-height": attrs.cropHeight } : {}),
      },
      radius: {
        default: 10,
        parseHTML: (el) => {
          const value = el.getAttribute("data-radius");
          return value ? Number(value) : 10;
        },
        renderHTML: (attrs) => ({ "data-radius": attrs.radius ?? 10 }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImage);
  },
});

function ResizableIframe({ node, updateAttributes, selected }: NodeViewProps) {
  const { htmlContent, width, height, textAlign } = node.attrs as {
    htmlContent: string;
    width: number;
    height: number;
    textAlign: Align;
  };
  const wrapRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback((pos: "right" | "bottom" | "corner") => (e: React.PointerEvent<HTMLDivElement>) => {
    const startWidth = wrapRef.current?.offsetWidth ?? width ?? 560;
    const startHeight = wrapRef.current?.offsetHeight ?? height ?? 315;

    beginPointerResize(e, (dx, dy) => {
      const updates: Record<string, number> = {};
      if (pos === "right" || pos === "corner") {
        updates.width = Math.max(200, startWidth + dx);
      }
      if (pos === "bottom" || pos === "corner") {
        updates.height = Math.max(100, startHeight + dy);
      }
      if (Object.keys(updates).length > 0) {
        updateAttributes(updates);
      }
    });
  }, [width, height, updateAttributes]);

  return (
    <NodeViewWrapper className={styles.imgNodeWrap} style={getAlignStyle(textAlign || "center")}>
      <div className={styles.mediaNodeColumn} style={{ width: width ? `${width}px` : "100%", maxWidth: "100%" }}>
        {selected && <AlignToolbar current={textAlign || "center"} onChange={(a) => updateAttributes({ textAlign: a })} />}
        <div
          ref={wrapRef}
          className={`${styles.iframeNodeInner} ${selected ? styles.iframeNodeSelected : ""}`}
          style={{ width: "100%", height: height ? `${height}px` : "315px" }}
        >
          <iframe srcDoc={htmlContent} className={styles.iframeNodeFrame} sandbox="allow-scripts allow-same-origin" />
          {selected && (
            <>
              <div className={`${styles.resizeHandle} ${styles.resizeHandleRight}`} onPointerDown={onPointerDown("right")} />
              <div className={`${styles.resizeHandle} ${styles.resizeHandleBottom}`} onPointerDown={onPointerDown("bottom")} />
              <div className={`${styles.resizeHandle} ${styles.resizeHandleBottomRight}`} onPointerDown={onPointerDown("corner")} />
            </>
          )}
          {!selected && <div className={styles.iframeOverlay} />}
        </div>
      </div>
    </NodeViewWrapper>
  );
}

const CustomIframe = Node.create({
  name: "customIframe",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      htmlContent: { default: "" },
      width: { default: null },
      height: { default: 315 },
      textAlign: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") || "center",
        renderHTML: (attrs) => ({ "data-align": attrs.textAlign }),
      },
    };
  },
  parseHTML() {
    return [{
      tag: "div.iframe-wrapper iframe[srcdoc]",
      getAttrs: (el) => {
        const iframe = el instanceof HTMLIFrameElement ? el : null;
        return { htmlContent: iframe?.getAttribute("srcdoc") ?? "" };
      },
    }];
  },
  renderHTML({ HTMLAttributes }) {
    const { htmlContent, ...rest } = HTMLAttributes;
    return ["div", { class: "iframe-wrapper" }, ["iframe", mergeAttributes(rest, { srcdoc: htmlContent, sandbox: "allow-scripts allow-same-origin" })]];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableIframe);
  },
  addCommands() {
    return {} as Record<string, never>;
  },
});

const ALIGN_ICONS = {
  left: <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 2h12M1 5h8M1 8h12M1 11h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  center: <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 2h12M3 5h8M1 8h12M3 11h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  right: <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 2h12M5 5h8M1 8h12M5 11h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
} as const;

function AlignToolbar({ current, onChange }: { current: Align; onChange: (a: Align) => void }) {
  return (
    <div className={styles.imgToolbar}>
      {(["left", "center", "right"] as const).map((a) => (
        <button
          key={a}
          type="button"
          className={current === a ? styles.imgToolBtnActive : styles.imgToolBtn}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onChange(a);
          }}
        >
          {ALIGN_ICONS[a]}
        </button>
      ))}
    </div>
  );
}

function getAlignStyle(align: Align): React.CSSProperties {
  if (align === "left") return { float: "left", marginRight: "1rem", marginBottom: "0.5rem" };
  if (align === "right") return { float: "right", marginLeft: "1rem", marginBottom: "0.5rem" };
  return { display: "flex", justifyContent: "center", width: "100%" };
}

function getCodeBlockWrapStyle(align: Align): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "flex",
    width: "100%",
    maxWidth: "100%",
    clear: "both",
    float: "none",
  };

  if (align === "left") {
    return { ...base, justifyContent: "flex-start" };
  }
  if (align === "right") {
    return { ...base, justifyContent: "flex-end" };
  }
  return { ...base, justifyContent: "center" };
}

function ResizableVideo({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, width, height, textAlign } = node.attrs as { src: string; alt: string; width: number; height: number; textAlign: Align };
  const wrapRef = useRef<HTMLDivElement>(null);
  const [altValue, setAltValue] = useState(alt ?? "");

  const onPointerDown = useCallback((pos: "right" | "bottom" | "corner") => (e: React.PointerEvent<HTMLDivElement>) => {
    const startWidth = wrapRef.current?.offsetWidth ?? width ?? 560;
    const startHeight = wrapRef.current?.offsetHeight ?? height ?? 315;

    beginPointerResize(e, (dx, dy) => {
      const updates: Record<string, number> = {};
      if (pos === "right" || pos === "corner") {
        updates.width = Math.max(200, startWidth + dx);
      }
      if (pos === "bottom" || pos === "corner") {
        updates.height = Math.max(100, startHeight + dy);
      }
      if (Object.keys(updates).length > 0) {
        updateAttributes(updates);
      }
    });
  }, [width, height, updateAttributes]);

  return (
    <NodeViewWrapper className={styles.imgNodeWrap} style={getAlignStyle(textAlign || "center")}>
      <div className={styles.mediaNodeColumn} style={{ width: width ? `${width}px` : "100%", maxWidth: "100%" }}>
        {selected && <AlignToolbar current={textAlign || "center"} onChange={(a) => updateAttributes({ textAlign: a })} />}
        <div
          ref={wrapRef}
          className={`${styles.iframeNodeInner} ${selected ? styles.iframeNodeSelected : ""}`}
          style={{ width: "100%", height: height ? `${height}px` : "auto" }}
        >
          <video src={src} controls className={styles.mediaNodeMedia} />
          {selected && (
            <>
              <div className={`${styles.resizeHandle} ${styles.resizeHandleRight}`} onPointerDown={onPointerDown("right")} />
              <div className={`${styles.resizeHandle} ${styles.resizeHandleBottom}`} onPointerDown={onPointerDown("bottom")} />
              <div className={`${styles.resizeHandle} ${styles.resizeHandleBottomRight}`} onPointerDown={onPointerDown("corner")} />
            </>
          )}
          {!selected && <div className={styles.iframeOverlay} />}
        </div>
        {selected ? (
          <input
            className={styles.mediaCaptionInput}
            type="text"
            value={altValue}
            onChange={(e) => setAltValue(e.target.value)}
            onBlur={() => updateAttributes({ alt: altValue })}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); updateAttributes({ alt: altValue }); (e.target as HTMLInputElement).blur(); } }}
            placeholder="Nhập mô tả video..."
            onClick={(e) => e.stopPropagation()}
          />
        ) : altValue ? (
          <span className={styles.mediaCaption}>{altValue}</span>
        ) : null}
      </div>
    </NodeViewWrapper>
  );
}

const CustomVideo = Node.create({
  name: "customVideo",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: "" },
      alt: { default: "" },
      width: { default: null },
      height: { default: null },
      textAlign: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") || "center",
        renderHTML: (attrs) => ({ "data-align": attrs.textAlign }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "video[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes, { controls: true })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableVideo);
  },
});

function ResizableAudio({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, textAlign } = node.attrs as { src: string; alt: string; textAlign: Align };
  const [altValue, setAltValue] = useState(alt ?? "");

  return (
    <NodeViewWrapper className={styles.imgNodeWrap} style={getAlignStyle(textAlign || "center")}>
      <div className={styles.mediaNodeColumn} style={{ maxWidth: 500, width: "100%" }}>
        {selected && <AlignToolbar current={textAlign || "center"} onChange={(a) => updateAttributes({ textAlign: a })} />}
        <div className={`${styles.audioNodeInner} ${selected ? styles.iframeNodeSelected : ""}`}>
          <audio src={src} controls className={styles.audioNodePlayer} />
        </div>
        {selected ? (
          <input
            className={styles.mediaCaptionInput}
            type="text"
            value={altValue}
            onChange={(e) => setAltValue(e.target.value)}
            onBlur={() => updateAttributes({ alt: altValue })}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); updateAttributes({ alt: altValue }); (e.target as HTMLInputElement).blur(); } }}
            placeholder="Nhập mô tả audio..."
            onClick={(e) => e.stopPropagation()}
          />
        ) : altValue ? (
          <span className={styles.mediaCaption}>{altValue}</span>
        ) : null}
      </div>
    </NodeViewWrapper>
  );
}

const CustomAudio = Node.create({
  name: "customAudio",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: "" },
      alt: { default: "" },
      textAlign: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") || "center",
        renderHTML: (attrs) => ({ "data-align": attrs.textAlign }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "audio[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["audio", mergeAttributes(HTMLAttributes, { controls: true })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableAudio);
  },
});

function ResizableFilePreview({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, width, height, displayMode, textAlign } = node.attrs as {
    src: string; alt: string; width: number; height: number; displayMode: "preview" | "link"; textAlign: Align;
  };
  const wrapRef = useRef<HTMLDivElement>(null);
  const [altValue, setAltValue] = useState(alt ?? "");

  const onPointerDown = useCallback((pos: "right" | "bottom" | "corner") => (e: React.PointerEvent<HTMLDivElement>) => {
    const startWidth = wrapRef.current?.offsetWidth ?? width ?? 560;
    const startHeight = wrapRef.current?.offsetHeight ?? height ?? 400;

    beginPointerResize(e, (dx, dy) => {
      const updates: Record<string, number> = {};
      if (pos === "right" || pos === "corner") {
        updates.width = Math.max(200, startWidth + dx);
      }
      if (pos === "bottom" || pos === "corner") {
        updates.height = Math.max(100, startHeight + dy);
      }
      if (Object.keys(updates).length > 0) {
        updateAttributes(updates);
      }
    });
  }, [width, height, updateAttributes]);

  const toggleMode = () => {
    updateAttributes({ displayMode: displayMode === "preview" ? "link" : "preview" });
  };

  const fileName = alt || src.split("/").pop() || "File";

  if (displayMode === "link") {
    return (
      <NodeViewWrapper className={styles.imgNodeWrap} style={getAlignStyle(textAlign || "center")}>
        <div className={styles.mediaNodeColumn} style={{ maxWidth: 400, width: "100%" }}>
          {selected && <AlignToolbar current={textAlign || "center"} onChange={(a) => updateAttributes({ textAlign: a })} />}
          <div className={`${styles.fileLinkNode} ${selected ? styles.iframeNodeSelected : ""}`}>
          <a href={src} target="_blank" rel="noopener noreferrer" className={styles.fileLinkAnchor} data-file-src={src}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            {fileName}
          </a>
          {selected && (
            <div className={styles.fileNodeToolbar}>
              <button type="button" className={styles.imgToolBtn} onClick={toggleMode} title="Preview mode">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </button>
              <input
                className={styles.mediaAltInput}
                type="text"
                value={altValue}
                onChange={(e) => setAltValue(e.target.value)}
                onBlur={() => updateAttributes({ alt: altValue })}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); updateAttributes({ alt: altValue }); (e.target as HTMLInputElement).blur(); } }}
                placeholder="Tên file..."
                onClick={(e) => e.stopPropagation()}
                style={{ position: "static", flex: 1 }}
              />
            </div>
          )}
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className={styles.imgNodeWrap} style={getAlignStyle(textAlign || "center")}>
      <div className={styles.mediaNodeColumn} style={{ width: width ? `${width}px` : "100%", maxWidth: "100%" }}>
        {selected && <AlignToolbar current={textAlign || "center"} onChange={(a) => updateAttributes({ textAlign: a })} />}
        <div
          ref={wrapRef}
          className={`${styles.iframeNodeInner} ${selected ? styles.iframeNodeSelected : ""}`}
          style={{ width: "100%", height: height ? `${height}px` : "400px" }}
        >
          <iframe src={src} className={styles.iframeNodeFrame} />
          {selected && (
            <>
              <div className={styles.filePreviewToolbar}>
                <button type="button" className={styles.imgToolBtn} onClick={toggleMode} title="Link mode">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                </button>
              </div>
              <div className={`${styles.resizeHandle} ${styles.resizeHandleRight}`} onPointerDown={onPointerDown("right")} />
              <div className={`${styles.resizeHandle} ${styles.resizeHandleBottom}`} onPointerDown={onPointerDown("bottom")} />
              <div className={`${styles.resizeHandle} ${styles.resizeHandleBottomRight}`} onPointerDown={onPointerDown("corner")} />
            </>
          )}
          {!selected && <div className={styles.iframeOverlay} />}
        </div>
        {selected ? (
          <input
            className={styles.mediaCaptionInput}
            type="text"
            value={altValue}
            onChange={(e) => setAltValue(e.target.value)}
            onBlur={() => updateAttributes({ alt: altValue })}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); updateAttributes({ alt: altValue }); (e.target as HTMLInputElement).blur(); } }}
            placeholder="Nhập mô tả file..."
            onClick={(e) => e.stopPropagation()}
          />
        ) : altValue ? (
          <span className={styles.mediaCaption}>{altValue}</span>
        ) : null}
      </div>
    </NodeViewWrapper>
  );
}

function CopyableCodeBlock({ node, updateAttributes, selected, editor }: NodeViewProps) {
  const currentLanguage = typeof node.attrs.language === "string" && node.attrs.language
    ? node.attrs.language
    : "plaintext";
  const textAlign = (node.attrs.textAlign as Align | undefined) ?? "center";
  const width = typeof node.attrs.width === "number" && Number.isFinite(node.attrs.width)
    ? node.attrs.width
    : null;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [isCursorInsideBlock, setIsCursorInsideBlock] = useState(false);

  useEffect(() => {
    const updateActiveState = () => {
      const root = wrapRef.current;
      if (!root) {
        setIsCursorInsideBlock(false);
        return;
      }
      if (!editor.view.hasFocus()) {
        setIsCursorInsideBlock(false);
        return;
      }

      const selection = window.getSelection();
      const anchorNode = selection?.anchorNode;
      const inside = Boolean(anchorNode && root.contains(anchorNode));
      setIsCursorInsideBlock(inside);
    };

    const editorDom = editor.view.dom;
    updateActiveState();

    document.addEventListener("selectionchange", updateActiveState);
    editorDom.addEventListener("keyup", updateActiveState);
    editorDom.addEventListener("mouseup", updateActiveState);
    editorDom.addEventListener("focusin", updateActiveState);
    editorDom.addEventListener("focusout", updateActiveState);

    return () => {
      document.removeEventListener("selectionchange", updateActiveState);
      editorDom.removeEventListener("keyup", updateActiveState);
      editorDom.removeEventListener("mouseup", updateActiveState);
      editorDom.removeEventListener("focusin", updateActiveState);
      editorDom.removeEventListener("focusout", updateActiveState);
    };
  }, [editor]);

  const showResizeHandles = selected || isCursorInsideBlock;
  const setAlign = (align: Align) => updateAttributes({ textAlign: align });

  const onPointerDownRight = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const startWidth = wrapRef.current?.offsetWidth ?? width ?? 640;
    beginPointerResize(e, (dx) => {
      const nextWidth = clamp(startWidth + dx, 220, 1600);
      updateAttributes({ width: nextWidth });
    });
  }, [width, updateAttributes]);

  const onPointerDownLeft = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const startWidth = wrapRef.current?.offsetWidth ?? width ?? 640;
    beginPointerResize(e, (dx) => {
      const nextWidth = clamp(startWidth - dx, 220, 1600);
      updateAttributes({ width: nextWidth });
    });
  }, [width, updateAttributes]);

  return (
    <NodeViewWrapper className={styles.codeBlockWrap} style={getCodeBlockWrapStyle(textAlign)}>
      <div
        ref={wrapRef}
        style={{ width: width ? `${width}px` : "100%", maxWidth: "100%" }}
        className={`${styles.codeBlockInner} ${selected ? styles.codeBlockSelected : ""} ${showResizeHandles ? styles.codeBlockActive : ""}`}
      >
        {showResizeHandles && <AlignToolbar current={textAlign} onChange={setAlign} />}
        <div className={styles.codeBlockActions}>
        <select
          className={styles.codeBlockLangSelect}
          value={currentLanguage}
          onChange={(event) => updateAttributes({ language: event.target.value })}
          onClick={(event) => event.stopPropagation()}
        >
          {CODE_LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        </div>
        <pre className={styles.codeBlockPre}>
          <NodeViewContent className={styles.codeBlockContent} />
        </pre>
        <>
          <div
            className={`${styles.resizeHandle} ${styles.codeBlockResizeHandle} ${styles.codeBlockResizeHandleTopRight}`}
            onPointerDown={onPointerDownRight}
          />
          <div
            className={`${styles.resizeHandle} ${styles.codeBlockResizeHandle} ${styles.codeBlockResizeHandleLeft}`}
            onPointerDown={onPointerDownLeft}
          />
          <div
            className={`${styles.resizeHandle} ${styles.resizeHandleRight} ${styles.codeBlockResizeHandle} ${styles.codeBlockResizeHandleRight}`}
            onPointerDown={onPointerDownRight}
          />
          <div
            className={`${styles.resizeHandle} ${styles.resizeHandleBottomRight} ${styles.codeBlockResizeHandle} ${styles.codeBlockResizeHandleCorner}`}
            onPointerDown={onPointerDownRight}
          />
        </>
      </div>
    </NodeViewWrapper>
  );
}

const CustomCodeBlock = CodeBlockLowlight
  .configure({
    lowlight,
    defaultLanguage: "plaintext",
  })
  .extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: null,
          parseHTML: (el) => {
            const value = el.getAttribute("data-width");
            return value ? Number(value) : null;
          },
          renderHTML: (attrs) => (
            typeof attrs.width === "number" && Number.isFinite(attrs.width)
              ? { "data-width": Math.round(attrs.width) }
              : {}
          ),
        },
        textAlign: {
          default: "center",
          parseHTML: (el) => el.getAttribute("data-align") || "center",
          renderHTML: (attrs) => ({ "data-align": attrs.textAlign }),
        },
      };
    },
    addNodeView() {
      return ReactNodeViewRenderer(CopyableCodeBlock);
    },
  });

const CustomFilePreview = Node.create({
  name: "customFilePreview",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: "" },
      alt: { default: "" },
      width: { default: null },
      height: { default: 400 },
      displayMode: { default: "preview" },
      textAlign: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") || "center",
        renderHTML: (attrs) => ({ "data-align": attrs.textAlign }),
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "div.file-preview iframe",
        getAttrs: (el) => {
          const iframe = el instanceof HTMLIFrameElement ? el : null;
          return { src: iframe?.getAttribute("src") ?? "", displayMode: "preview" };
        },
      },
      {
        tag: "a[data-file-src]",
        getAttrs: (el) => {
          const anchor = el instanceof HTMLAnchorElement ? el : null;
          return { src: anchor?.getAttribute("data-file-src") ?? anchor?.href ?? "", displayMode: "link", alt: anchor?.textContent ?? "" };
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const { src, alt, displayMode, ...rest } = HTMLAttributes;
    if (displayMode === "link") {
      return [
        "a",
        mergeAttributes(rest, { href: src, target: "_blank", rel: "noopener noreferrer", "data-file-src": src }),
        alt || src.split("/").pop() || "File",
      ];
    }
    return ["div", { class: "file-preview" }, ["iframe", mergeAttributes(rest, { src })]];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableFilePreview);
  },
});

const Indent = Extension.create({
  name: "indent",
  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        if (editor.isActive("listItem")) {
          return editor.chain().focus().sinkListItem("listItem").run();
        }
        if (editor.isActive("taskItem")) {
          return editor.chain().focus().sinkListItem("taskItem").run();
        }
        return editor.chain().focus().insertContent("\t").run();
      },
      "Shift-Tab": ({ editor }) => {
        if (editor.isActive("listItem")) {
          return editor.chain().focus().liftListItem("listItem").run();
        }
        if (editor.isActive("taskItem")) {
          return editor.chain().focus().liftListItem("taskItem").run();
        }
        return false;
      },
    };
  },
});

const ClearFloat = Node.create({
  name: "clearFloat",
  group: "block",
  atom: true,
  parseHTML() {
    return [{ tag: 'div[data-clear]' }];
  },
  renderHTML() {
    return ['div', { 'data-clear': 'true', style: 'clear:both' }];
  },
  addNodeView() {
    return ({ HTMLAttributes }) => {
      const dom = document.createElement('div');
      dom.className = styles.clearFloat;
      dom.setAttribute('data-clear', 'true');
      dom.contentEditable = 'false';
      return { dom };
    };
  },
});

const COMMANDS: CommandItem[] = [
  {
    title: "Heading 1",
    description: "Tiêu đề lớn",
    icon: "H1",
    command: ({ editor, range }) => {
      editor?.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Tiêu đề vừa",
    icon: "H2",
    command: ({ editor, range }) => {
      editor?.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Tiêu đề nhỏ",
    icon: "H3",
    command: ({ editor, range }) => {
      editor?.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
    },
  },
  {
    title: "Bullet List",
    description: "Danh sách không thứ tự",
    icon: "•",
    command: ({ editor, range }) => {
      editor?.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Danh sách có thứ tự",
    icon: "1.",
    command: ({ editor, range }) => {
      editor?.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Checklist",
    description: "Danh sách checkbox",
    icon: "[]",
    command: ({ editor, range }) => {
      editor?.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Toggle",
    description: "Khối ẩn/hiện",
    icon: "▸",
    command: ({ editor, range }) => {
      if (!editor) return;
      if (editor.isActive("details")) {
        editor.chain().focus().deleteRange(range).unsetDetails().run();
      } else {
        editor.chain().focus().deleteRange(range).setDetails().run();
      }
    },
  },
  {
    title: "Quote",
    description: "Trích dẫn",
    icon: "\"",
    command: ({ editor, range }) => {
      editor?.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Code Block",
    description: "Khối mã",
    icon: "{ }",
    command: ({ editor, range }) => {
      setSingleCodeBlockFromSelection(editor, range);
    },
  },
  {
    title: "Divider",
    description: "Đường phân cách",
    icon: "—",
    command: ({ editor, range }) => {
      editor?.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "Clear Float",
    description: "Ngắt bao quanh ảnh",
    icon: "⏎",
    command: ({ editor, range }) => {
      editor?.chain().focus().deleteRange(range).insertContent({ type: "clearFloat" }).run();
    },
  },
];

const MODAL_COMMANDS: { title: string; description: string; icon: string; modal: string }[] = [
  { title: "Image", description: "Chèn ảnh từ URL hoặc máy", icon: "IMG", modal: "image" },
  { title: "Video", description: "Chèn video từ URL hoặc máy", icon: "VID", modal: "video" },
  { title: "Audio", description: "Chèn âm thanh", icon: "AUD", modal: "audio" },
  { title: "File / PDF", description: "Chèn file (preview hoặc link)", icon: "PDF", modal: "file" },
  { title: "YouTube", description: "Nhúng video YouTube", icon: "YT", modal: "youtube" },
  { title: "Iframe", description: "Nhúng trang web / HTML", icon: "</>", modal: "iframe" },
  { title: "Link", description: "Chèn liên kết vào text", icon: "LNK", modal: "link" },
];

interface CommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const CommandList = forwardRef<
  CommandListRef,
  { items: (CommandItem | typeof MODAL_COMMANDS[number])[]; command: (item: CommandItem | typeof MODAL_COMMANDS[number]) => void }
>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        if (items[selectedIndex]) command(items[selectedIndex]);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) return null;

  return (
    <div className={styles.slashMenu} ref={listRef}>
      {items.map((item, index) => (
        <button
          key={item.title}
          className={`${styles.slashItem} ${index === selectedIndex ? styles.slashItemActive : ""}`}
          onClick={() => command(item)}
          type="button"
        >
          <span className={styles.slashIcon}>{item.icon}</span>
          <span className={styles.slashInfo}>
            <span className={styles.slashTitle}>{item.title}</span>
            <span className={styles.slashDesc}>{item.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
});

CommandList.displayName = "CommandList";

type ModalState =
  | { type: "image" }
  | { type: "youtube" }
  | { type: "iframe" }
  | { type: "video" }
  | { type: "audio" }
  | { type: "file" }
  | { type: "link"; from: number; to: number }
  | null;

let globalModalSetter: ((m: ModalState) => void) | null = null;
let globalEditorRange: { from: number; to: number } | null = null;

const TOP_MEDIA_NODE_NAMES = new Set([
  "image",
  "youtube",
  "customIframe",
  "customVideo",
  "customAudio",
  "customFilePreview",
]);

const EnsureLeadingLineForTopMedia = Extension.create({
  name: "ensureLeadingLineForTopMedia",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (_transactions, _oldState, newState) => {
          const firstNode = newState.doc.firstChild;
          if (!firstNode) return null;
          if (!TOP_MEDIA_NODE_NAMES.has(firstNode.type.name)) return null;

          const paragraph = newState.schema.nodes.paragraph;
          if (!paragraph) return null;

          return newState.tr.insert(0, paragraph.create());
        },
      }),
    ];
  },
});

function createSlashCommands() {
  const allItems = [
    ...COMMANDS.map((c) => ({ ...c, kind: "command" as const })),
    ...MODAL_COMMANDS.map((c) => ({ ...c, kind: "modal" as const })),
  ];

  return Extension.create({
    name: "slashCommands",
    addOptions() {
      return { suggestion: {} };
    },
    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          char: "/",
          items: ({ query }: { query: string }) =>
            allItems.filter((item) =>
              item.title.toLowerCase().includes(query.toLowerCase())
            ),
          render: () => {
            let component: ReactRenderer<CommandListRef> | null = null;
            let popup: HTMLDivElement | null = null;

            const positionPopup = (clientRect: (() => DOMRect | null) | null, el: HTMLDivElement) => {
              if (!clientRect) return;
              const r = clientRect();
              if (!r) return;
              const menuH = 400;
              const spaceBelow = window.innerHeight - r.bottom;
              el.style.left = `${r.left}px`;
              if (spaceBelow < menuH + 8) {
                el.style.top = "";
                el.style.bottom = `${window.innerHeight - r.top + 4}px`;
              } else {
                el.style.bottom = "";
                el.style.top = `${r.bottom + 4}px`;
              }
            };

            return {
              onStart: (props: SuggestionProps<(typeof allItems)[number]>) => {
                component = new ReactRenderer(CommandList, {
                  props,
                  editor: props.editor,
                });
                popup = document.createElement("div");
                popup.style.position = "fixed";
                popup.style.zIndex = "50";
                positionPopup(props.clientRect ?? null, popup);
                if (component.element) popup.appendChild(component.element);
                document.body.appendChild(popup);
              },
              onUpdate: (props: SuggestionProps<(typeof allItems)[number]>) => {
                component?.updateProps(props);
                if (popup) positionPopup(props.clientRect ?? null, popup);
              },
              onKeyDown: (props: { event: KeyboardEvent }) => {
                if (props.event.key === "Escape") {
                  popup?.remove();
                  component?.destroy();
                  return true;
                }
                return component?.ref?.onKeyDown(props) ?? false;
              },
              onExit: () => {
                popup?.remove();
                component?.destroy();
              },
            };
          },
          command: ({ editor, range, props }: {
            editor: ReturnType<typeof useEditor>;
            range: { from: number; to: number };
            props: (typeof allItems)[number];
          }) => {
            if (props.kind === "modal") {
              editor?.chain().focus().deleteRange(range).run();
              globalEditorRange = range;
              if (props.modal === "link") {
                globalModalSetter?.({ type: "link", from: range.from, to: range.to });
              } else {
                globalModalSetter?.({ type: props.modal as "image" | "youtube" | "iframe" | "video" | "audio" | "file" });
              }
            } else {
              (props as CommandItem).command({ editor, range });
            }
          },
        }),
      ];
    },
  });
}

export function TiptapEditor({ content, onChange, placeholder = "Nhập / để xem danh sách lệnh..." }: TiptapEditorProps) {
  const [modal, setModal] = useState<ModalState>(null);

  useEffect(() => {
    globalModalSetter = setModal;
    return () => { globalModalSetter = null; };
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    parseOptions: {
      preserveWhitespace: "full",
    },
    editorProps: {
      handleTextInput: (view, from, to, text) => {
        if (text !== " ") return false;

        const resolved = view.state.doc.resolve(from);
        const blockStart = resolved.start();
        const before = view.state.doc.textBetween(blockStart, from, "\n", "\0");

        if (/^\s*[-+*]$/.test(before)) {
          view.dispatch(view.state.tr.insertText(" ", from, to));
          return true;
        }

        return false;
      },
    },
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder }),
      CustomCodeBlock,
      TaskList,
      TaskItem.configure({ nested: true }),
      Details.configure({ persist: true }),
      DetailsSummary,
      DetailsContent,
      CustomImage.configure({ inline: false }),
      LinkExt.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" } }),
      Youtube.configure({ inline: false, width: 640, height: 360, nocookie: true }),
      CustomIframe,
      CustomVideo,
      CustomAudio,
      CustomFilePreview,
      Indent,
      ClearFloat,
      EnsureLeadingLineForTopMedia,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      createSlashCommands(),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
  });

  const handleInsertImage = (payload: ImageInsertPayload) => {
    if (!editor) return;
    editor.chain().focus().insertContent({
      type: "image",
      attrs: {
        src: payload.src,
        alt: payload.alt,
        width: payload.width ?? 300,
        sourceType: payload.sourceType ?? "url",
        cropMode: payload.cropMode ?? false,
        cropX: payload.cropX ?? 50,
        cropY: payload.cropY ?? 50,
        cropScale: payload.cropScale ?? 1,
        cropHeight: payload.cropHeight ?? null,
        radius: payload.radius ?? 10,
        naturalWidth: payload.naturalWidth ?? null,
        naturalHeight: payload.naturalHeight ?? null,
      },
    }).run();
    setModal(null);
  };

  const handleInsertYoutube = (url: string) => {
    if (!editor) return;
    editor.chain().focus().setYoutubeVideo({ src: url }).run();
    setModal(null);
  };

  const handleInsertIframe = (htmlContent: string) => {
    if (!editor) return;
    editor.commands.insertContent({ type: "customIframe", attrs: { htmlContent } });
    setModal(null);
  };

  const handleInsertLink = (url: string) => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setModal(null);
  };

  const handleInsertVideo = (src: string, alt: string) => {
    if (!editor) return;
    editor.commands.insertContent({ type: "customVideo", attrs: { src, alt, width: 560, height: 315 } });
    setModal(null);
  };

  const handleInsertAudio = (src: string, alt: string) => {
    if (!editor) return;
    editor.commands.insertContent({ type: "customAudio", attrs: { src, alt } });
    setModal(null);
  };

  const handleInsertFile = (src: string, alt: string) => {
    if (!editor) return;
    editor.commands.insertContent({ type: "customFilePreview", attrs: { src, alt, displayMode: "preview" } });
    setModal(null);
  };

  if (!editor) return null;

  return (
    <div className={styles.tiptapWrap}>
      <div className={styles.tiptapEditor}>
        <BubbleMenu
          editor={editor}
          className={styles.bubbleMenu}
          shouldShow={({ editor: e, state }) => {
            const { empty } = state.selection;
            if (empty) return false;
            if (e.isActive("image") || e.isActive("customIframe") || e.isActive("youtube") || e.isActive("customVideo") || e.isActive("customAudio") || e.isActive("customFilePreview")) return false;
            return true;
          }}
        >
          <button
            type="button"
            className={`${styles.bubbleBtn} ${editor.isActive("heading", { level: 1 }) ? styles.bubbleBtnActive : ""}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            H1
          </button>
          <button
            type="button"
            className={`${styles.bubbleBtn} ${editor.isActive("heading", { level: 2 }) ? styles.bubbleBtnActive : ""}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </button>
          <button
            type="button"
            className={`${styles.bubbleBtn} ${editor.isActive("heading", { level: 3 }) ? styles.bubbleBtnActive : ""}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            H3
          </button>
          <div className={styles.bubbleDivider} />
          <button
            type="button"
            className={`${styles.bubbleBtn} ${editor.isActive("bulletList") ? styles.bubbleBtnActive : ""}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            •
          </button>
          <button
            type="button"
            className={`${styles.bubbleBtn} ${editor.isActive("orderedList") ? styles.bubbleBtnActive : ""}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            1.
          </button>
          <button
            type="button"
            className={`${styles.bubbleBtn} ${editor.isActive("taskList") ? styles.bubbleBtnActive : ""}`}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          >
            ☑
          </button>
          <button
            type="button"
            className={`${styles.bubbleBtn} ${editor.isActive("details") ? styles.bubbleBtnActive : ""}`}
            onClick={() => {
              if (editor.isActive("details")) {
                editor.chain().focus().unsetDetails().run();
              } else {
                editor.chain().focus().setDetails().run();
              }
            }}
          >
            ▸
          </button>
          <button
            type="button"
            className={`${styles.bubbleBtn} ${editor.isActive("codeBlock") ? styles.bubbleBtnActive : ""}`}
            onClick={() => setSingleCodeBlockFromSelection(editor)}
          >
            {"{ }"}
          </button>
          <div className={styles.bubbleDivider} />
          <button
            type="button"
            className={`${styles.bubbleBtn} ${editor.isActive("bold") ? styles.bubbleBtnActive : ""}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            B
          </button>
          <button
            type="button"
            className={`${styles.bubbleBtn} ${editor.isActive("italic") ? styles.bubbleBtnActive : ""}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={`${styles.bubbleBtn} ${editor.isActive("strike") ? styles.bubbleBtnActive : ""}`}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <s>S</s>
          </button>
          <button
            type="button"
            className={`${styles.bubbleBtn} ${editor.isActive("code") ? styles.bubbleBtnActive : ""}`}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            {"<>"}
          </button>
          <div className={styles.bubbleDivider} />
          <button
            type="button"
            className={`${styles.bubbleBtn} ${editor.isActive({ textAlign: "left" }) ? styles.bubbleBtnActive : ""}`}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.bubbleBtn} ${editor.isActive({ textAlign: "center" }) ? styles.bubbleBtnActive : ""}`}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.bubbleBtn} ${editor.isActive({ textAlign: "right" }) ? styles.bubbleBtnActive : ""}`}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" />
            </svg>
          </button>
          <div className={styles.bubbleDivider} />
          <button
            type="button"
            className={`${styles.bubbleBtn} ${editor.isActive("link") ? styles.bubbleBtnActive : ""}`}
            onClick={() => {
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
              } else {
                const { from, to } = editor.state.selection;
                setModal({ type: "link", from, to });
              }
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>
        </BubbleMenu>
        <EditorContent editor={editor} />
      </div>

      {modal?.type === "image" && (
        <ImageModal onInsert={handleInsertImage} onClose={() => setModal(null)} />
      )}
      {modal?.type === "youtube" && (
        <EmbedModal
          title="Nhúng YouTube"
          placeholder="https://www.youtube.com/watch?v=..."
          onInsert={handleInsertYoutube}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "iframe" && (
        <HtmlCodeModal
          onInsert={handleInsertIframe}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "link" && (
        <LinkModal
          initialUrl={editor.getAttributes("link").href ?? ""}
          onInsert={handleInsertLink}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "video" && (
        <MediaModal
          title="Chèn Video"
          accept="video/*"
          onInsert={handleInsertVideo}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "audio" && (
        <MediaModal
          title="Chèn Audio"
          accept="audio/*"
          onInsert={handleInsertAudio}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "file" && (
        <MediaModal
          title="Chèn File / PDF"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
          onInsert={handleInsertFile}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

"use client";

import {
  useEditor,
  EditorContent,
  ReactRenderer,
  NodeViewWrapper,
  type NodeViewProps,
} from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlock from "@tiptap/extension-code-block";
import ImageExt from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import { Node, Extension, ReactNodeViewRenderer, mergeAttributes } from "@tiptap/react";
import Suggestion, { type SuggestionProps } from "@tiptap/suggestion";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "@/app/style/admin/editor.module.css";

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

function ImageModal({ onInsert, onClose }: { onInsert: (src: string, alt: string) => void; onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      setUrl("");
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (val: string) => {
    setUrl(val);
    setPreview(null);
  };

  const handleInsert = () => {
    const src = preview ?? url.trim();
    if (src) onInsert(src, alt.trim());
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
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v7M5 6l3-3 3 3M3 11v1.5A1.5 1.5 0 004.5 14h7a1.5 1.5 0 001.5-1.5V11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Tải ảnh từ máy
          </button>

          {(preview ?? (url.trim() && url.startsWith("http"))) && (
            <div className={styles.imageModalPreview}>
              <img src={preview ?? url} alt="Preview" />
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

type Align = "left" | "center" | "right";

function ResizableImage({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, width, textAlign } = node.attrs as { src: string; alt: string; width: number; textAlign: Align };
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startW = useRef(0);
  const edge = useRef<"right" | "bottom-right" | "bottom">("right");
  const [altValue, setAltValue] = useState(alt ?? "");

  const onPointerDown = useCallback((pos: "right" | "bottom-right" | "bottom") => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    edge.current = pos;
    startX.current = e.clientX;
    startY.current = e.clientY;
    startW.current = wrapRef.current?.offsetWidth ?? width ?? 400;

    const onMove = (ev: PointerEvent) => {
      if (!dragging.current) return;
      const dx = ev.clientX - startX.current;
      if (edge.current === "right" || edge.current === "bottom-right") {
        const newW = Math.max(80, startW.current + dx);
        updateAttributes({ width: newW });
      }
    };
    const onUp = () => {
      dragging.current = false;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }, [width, updateAttributes]);

  const setAlign = (a: Align) => updateAttributes({ textAlign: a });
  const justifyMap: Record<Align, string> = { left: "flex-start", center: "center", right: "flex-end" };

  return (
    <NodeViewWrapper
      className={styles.imgNodeWrap}
      style={{ justifyContent: justifyMap[textAlign ?? "center"] }}
    >
      <div
        ref={wrapRef}
        className={`${styles.imgNodeInner} ${selected ? styles.imgNodeSelected : ""}`}
        style={{ width: width ? `${width}px` : "100%" }}
      >
        {selected && (
          <div className={styles.imgToolbar}>
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                type="button"
                className={textAlign === a ? styles.imgToolBtnActive : styles.imgToolBtn}
                onClick={() => setAlign(a)}
              >
                {a === "left" && <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 2h12M1 5h8M1 8h12M1 11h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>}
                {a === "center" && <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 2h12M3 5h8M1 8h12M3 11h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>}
                {a === "right" && <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 2h12M5 5h8M1 8h12M5 11h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>}
              </button>
            ))}
          </div>
        )}
        <img ref={imgRef} src={src} alt={alt ?? ""} draggable={false} className={styles.imgNodeImg} />
        {selected && (
          <>
            <input
              className={styles.imgAltInput}
              type="text"
              value={altValue}
              onChange={(e) => setAltValue(e.target.value)}
              onBlur={() => updateAttributes({ alt: altValue })}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); updateAttributes({ alt: altValue }); (e.target as HTMLInputElement).blur(); } }}
              placeholder="Alt text (SEO)..."
              onClick={(e) => e.stopPropagation()}
            />
            <div className={`${styles.resizeHandle} ${styles.resizeHandleRight}`} onPointerDown={onPointerDown("right")} />
            <div className={`${styles.resizeHandle} ${styles.resizeHandleBottomRight}`} onPointerDown={onPointerDown("bottom-right")} />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}

const CustomImage = ImageExt.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null, renderHTML: (attrs) => (attrs.width ? { width: attrs.width } : {}) },
      textAlign: { default: "center", renderHTML: (attrs) => ({ "data-align": attrs.textAlign }) },
      "data-natural-width": {
        default: null,
        parseHTML: (el) => el.getAttribute("data-natural-width"),
        renderHTML: (attrs) => (attrs["data-natural-width"] ? { "data-natural-width": attrs["data-natural-width"] } : {}),
      },
      "data-natural-height": {
        default: null,
        parseHTML: (el) => el.getAttribute("data-natural-height"),
        renderHTML: (attrs) => (attrs["data-natural-height"] ? { "data-natural-height": attrs["data-natural-height"] } : {}),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImage);
  },
});

function ResizableIframe({ node, updateAttributes, selected }: NodeViewProps) {
  const { htmlContent, width, height } = node.attrs as { htmlContent: string; width: number; height: number };
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startW = useRef(0);
  const startH = useRef(0);
  const edgeRef = useRef<"right" | "bottom" | "corner">("corner");

  const onPointerDown = useCallback((pos: "right" | "bottom" | "corner") => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    edgeRef.current = pos;
    startX.current = e.clientX;
    startY.current = e.clientY;
    startW.current = wrapRef.current?.offsetWidth ?? width ?? 560;
    startH.current = wrapRef.current?.offsetHeight ?? height ?? 315;

    const onMove = (ev: PointerEvent) => {
      if (!dragging.current) return;
      const dx = ev.clientX - startX.current;
      const dy = ev.clientY - startY.current;
      const updates: Record<string, number> = {};
      if (pos === "right" || pos === "corner") {
        updates.width = Math.max(200, startW.current + dx);
      }
      if (pos === "bottom" || pos === "corner") {
        updates.height = Math.max(100, startH.current + dy);
      }
      updateAttributes(updates);
    };
    const onUp = () => {
      dragging.current = false;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }, [width, height, updateAttributes]);

  return (
    <NodeViewWrapper className={styles.iframeNodeWrap}>
      <div
        ref={wrapRef}
        className={`${styles.iframeNodeInner} ${selected ? styles.iframeNodeSelected : ""}`}
        style={{ width: width ? `${width}px` : "100%", height: height ? `${height}px` : "315px" }}
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

const Indent = Extension.create({
  name: "indent",
  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        if (editor.isActive("listItem")) {
          return editor.chain().focus().sinkListItem("listItem").run();
        }
        return editor.chain().focus().insertContent("\t").run();
      },
      "Shift-Tab": ({ editor }) => {
        if (editor.isActive("listItem")) {
          return editor.chain().focus().liftListItem("listItem").run();
        }
        return false;
      },
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
      editor?.chain().focus().deleteRange(range).toggleCodeBlock().run();
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
];

const MODAL_COMMANDS: { title: string; description: string; icon: string; modal: string }[] = [
  { title: "Image", description: "Chèn ảnh từ URL hoặc máy", icon: "IMG", modal: "image" },
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

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

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
    <div className={styles.slashMenu}>
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
  | { type: "link"; from: number; to: number }
  | null;

let globalModalSetter: ((m: ModalState) => void) | null = null;
let globalEditorRange: { from: number; to: number } | null = null;

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
                globalModalSetter?.({ type: props.modal as "image" | "youtube" | "iframe" });
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
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder }),
      CodeBlock,
      CustomImage.configure({ inline: false }),
      LinkExt.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" } }),
      Youtube.configure({ inline: false, width: 640, height: 360, nocookie: true }),
      CustomIframe,
      Indent,
      createSlashCommands(),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
  });

  const handleInsertImage = (src: string, alt: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src, alt }).run();
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

  if (!editor) return null;

  return (
    <div className={styles.tiptapWrap}>
      <div className={styles.tiptapEditor}>
        <BubbleMenu editor={editor} className={styles.bubbleMenu}>
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
    </div>
  );
}

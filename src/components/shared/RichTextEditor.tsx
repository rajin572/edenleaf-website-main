/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Link as LinkIcon,
    Table as TableIcon,
    Undo,
    Redo,
    Trash2,
    Eye,
    Edit,
    X,
    Minus,
    Highlighter,
    Type,
    Palette,
} from "lucide-react";

interface RichTextEditorProps {
    content: string;
    setContent: (content: string) => void;
    placeholder?: string;
    minHeight?: string;
    className?: string;
}

interface LinkDialogState {
    show: boolean;
    url: string;
}

interface TableDialogState {
    show: boolean;
    rows: number;
    cols: number;
}

type AlignType = "left" | "center" | "right";

type PasteDialogState = {
    show: boolean;
    html: string;
    text: string;
};

const stripText = (html: string) =>
    (html || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

const computeStats = (html: string) => {
    const text = stripText(html);
    return { chars: text.length, words: text.split(/\s+/).filter(Boolean).length };
};

/**
 * ✅ Embedded CSS - Everything is inline, no external CSS needed
 */
const EMBEDDED_STYLES = `
<style>
.rte-content { color: #2c2c2c; line-height: 1.6; }
.rte-content a { color: #ad2b08 !important; text-decoration: underline !important; text-underline-offset: 2px !important; cursor: pointer; }
.rte-content a:hover { color: #8d2306 !important; }
.rte-content hr { border: none !important; border-top: 2px solid #ad2b08 !important; margin: 20px 0 !important; }
.rte-content ul { list-style-type: disc !important; padding-left: 28px !important; margin: 10px 0 !important; }
.rte-content ol { list-style-type: decimal !important; padding-left: 28px !important; margin: 10px 0 !important; }
.rte-content li { margin: 6px 0 !important; }
.rte-content .rte-table-wrap { margin: 20px 0 !important; overflow: hidden !important; border-radius: 12px !important; border: 2px solid #ad2b08 !important; box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important; }
.rte-content .rte-table { width: 100% !important; border-collapse: collapse !important; table-layout: fixed !important; }
.rte-content .rte-th { background: #ad2b08 !important; color: white !important; font-weight: 600 !important; padding: 12px !important; border: 1px solid #28314e !important; text-align: left !important; }
.rte-content .rte-td { border: 1px solid #e2e8f0 !important; padding: 12px !important; vertical-align: top !important; word-wrap: break-word !important; }
.rte-content .rte-row-even .rte-td { background-color: #f8fafc !important; }
.rte-content .rte-table tbody tr:not(.rte-row-even) .rte-td { background-color: white !important; }
.rte-content .rte-table tbody tr:hover .rte-td { background-color: #fff3f0 !important; }
.rte-content strong, .rte-content b { font-weight: 700 !important; }
.rte-content em, .rte-content i { font-style: italic !important; }
.rte-content u { text-decoration: underline !important; }
.rte-content p { margin: 1em 0 !important; }
.rte-content p:first-child { margin-top: 0 !important; }
.rte-content p:last-child { margin-bottom: 0 !important; }
</style>
`;

/**
 * ✅ Wrap content with styles + wrapper div
 */
function wrapContentWithStyles(htmlContent: string): string {
    return `${EMBEDDED_STYLES}<div class="rte-content">${htmlContent}</div>`;
}

/**
 * ✅ Extract just the content (remove wrapper and styles)
 */
function unwrapContent(wrappedHtml: string): string {
    if (!wrappedHtml) return "";

    // Remove the style tag
    let content = wrappedHtml.replace(/<style>[\s\S]*?<\/style>/gi, "");

    // Remove the wrapper div but keep inner content
    content = content.replace(
        /<div class="rte-content">([\s\S]*)<\/div>/i,
        "$1"
    );

    return content.trim();
}

/**
 * ✅ Get the caret position as a plain-text character offset within `element`.
 * Returns null when the selection is outside the editor.
 */
function getCaretOffset(element: HTMLElement): number | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (!element.contains(range.endContainer)) return null;

    const preRange = range.cloneRange();
    preRange.selectNodeContents(element);
    preRange.setEnd(range.endContainer, range.endOffset);
    return preRange.toString().length;
}

/**
 * ✅ Restore the caret to a plain-text character offset within `element`.
 * Used after a full innerHTML replacement (undo / redo).
 */
function setCaretOffset(element: HTMLElement, offset: number) {
    const sel = window.getSelection();
    if (!sel) return;

    const range = document.createRange();
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null
    );

    let remaining = offset;
    let node: Text | null = walker.nextNode() as Text | null;

    if (!node) {
        // No text nodes — put caret inside the element itself.
        range.selectNodeContents(element);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        return;
    }

    let target: Text = node;
    let targetOffset = 0;

    while (node) {
        const len = node.textContent?.length ?? 0;
        if (remaining <= len) {
            target = node;
            targetOffset = remaining;
            break;
        }
        remaining -= len;
        const next = walker.nextNode() as Text | null;
        if (!next) {
            // Ran past the end — clamp to the end of the last text node.
            target = node;
            targetOffset = len;
            break;
        }
        node = next;
    }

    range.setStart(target, Math.min(targetOffset, target.textContent?.length ?? 0));
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
}

/**
 * ✅ Renderer - Just use dangerouslySetInnerHTML
 */
export function RichTextRenderer({
    html,
    className = "",
}: {
    html: string;
    className?: string;
}) {
    return (
        <div
            className={className}
            // Stored rich-text HTML — sanitize before injecting (prevents stored XSS).
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
        />
    );
}

const ToolbarButton: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    active?: boolean;
}> = ({ onClick, icon, title, active = false }) => (
    <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        title={title}
        className={`p-2.5 rounded-md transition-all duration-200 border ${active
            ? "bg-[#ad2b08] text-white border-[#ad2b08] shadow-md"
            : "bg-white border-gray-300 hover:bg-[#fff3f0] hover:border-[#ad2b08] text-[#2c2c2c]"
            }`}
    >
        {icon}
    </button>
);

/**
 * ✅ Editor component
 */
const RichTextEditor: React.FC<RichTextEditorProps> = ({
    content,
    setContent,
    placeholder = "Start typing...",
    minHeight = "500px",
    className = "",
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isFocusedRef = useRef(false);

    // --- Custom undo/redo history (replaces the broken native execCommand stack) ---
    const historyRef = useRef<string[]>([]);
    const caretRef = useRef<number[]>([]);
    const historyIndexRef = useRef<number>(-1);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isRestoringRef = useRef(false);
    const initializedRef = useRef(false);
    // Tracks the last value WE emitted so external prop changes can be told apart
    // from our own echoes (an external change resets the editor + history).
    const lastEmittedRef = useRef<string | null>(null);
    // Last size chosen from the dropdown — used to convert text typed *after*
    // the size was picked (Google-Docs style "set size then type").
    const pendingFontSizeRef = useRef<number | null>(null);

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [linkDialog, setLinkDialog] = useState<LinkDialogState>({
        show: false,
        url: "",
    });
    const [tableDialog, setTableDialog] = useState<TableDialogState>({
        show: false,
        rows: 3,
        cols: 3,
    });
    const [pasteDialog, setPasteDialog] = useState<PasteDialogState>({
        show: false,
        html: "",
        text: "",
    });
    const savedSelectionRef = useRef<Range | null>(null);
    const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(
        null
    );
    const [isEmpty, setIsEmpty] = useState(true);
    const [currentFontSize, setCurrentFontSize] = useState<number>(16);
    const [stats, setStats] = useState({ chars: 0, words: 0 });

    // Initialize the editor and sync genuine external content changes.
    useEffect(() => {
        const el = editorRef.current;
        if (!el) return;

        // First mount: seed the editor and the history stack.
        if (!initializedRef.current) {
            const unwrapped = unwrapContent(content || "");
            el.innerHTML = unwrapped || "<p><br></p>";
            historyRef.current = [el.innerHTML];
            caretRef.current = [0];
            historyIndexRef.current = 0;
            lastEmittedRef.current = content || null;
            const initialStats = computeStats(unwrapped);
            setIsEmpty(initialStats.chars === 0);
            setStats(initialStats);
            initializedRef.current = true;
            return;
        }

        // Ignore echoes of our own edits.
        if (content === lastEmittedRef.current) return;
        // Never clobber the DOM while the user is actively editing.
        if (isFocusedRef.current) return;

        const unwrapped = unwrapContent(content || "");
        if (unwrapped !== el.innerHTML) {
            el.innerHTML = unwrapped || "<p><br></p>";
            historyRef.current = [el.innerHTML];
            caretRef.current = [0];
            historyIndexRef.current = 0;
            const nextStats = computeStats(unwrapped);
            setIsEmpty(nextStats.chars === 0);
            setStats(nextStats);
        }
    }, [content]);

    // Cleanup any pending debounce on unmount.
    useEffect(() => {
        return () => {
            if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        };
    }, []);

    const focusEditor = () => editorRef.current?.focus();

    // Push the parent state (wrapped) and update the empty flag.
    const syncContent = () => {
        const html = editorRef.current?.innerHTML || "";
        const wrapped = wrapContentWithStyles(html);
        lastEmittedRef.current = wrapped;
        setContent(wrapped);
        const nextStats = computeStats(html);
        setIsEmpty(nextStats.chars === 0);
        setStats(nextStats);
    };

    // Snapshot the current DOM into the history stack (no-op if unchanged).
    const pushHistory = () => {
        const el = editorRef.current;
        if (!el) return;
        const html = el.innerHTML;
        if (historyRef.current[historyIndexRef.current] === html) return;

        // Drop any redo branch, then append the new snapshot.
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
        caretRef.current = caretRef.current.slice(0, historyIndexRef.current + 1);
        historyRef.current.push(html);
        caretRef.current.push(getCaretOffset(el) ?? html.length);
        historyIndexRef.current = historyRef.current.length - 1;
    };

    // Debounced snapshot for continuous typing (one entry per typing burst).
    const scheduleHistory = () => {
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            pushHistory();
            typingTimerRef.current = null;
        }, 400);
    };

    const flushHistory = () => {
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
            typingTimerRef.current = null;
        }
        pushHistory();
    };

    // Called after every discrete toolbar action.
    const commit = () => {
        syncContent();
        flushHistory();
    };

    const restoreFromHistory = () => {
        const el = editorRef.current;
        if (!el) return;
        isRestoringRef.current = true;
        const html = historyRef.current[historyIndexRef.current] ?? "";
        el.innerHTML = html;
        el.focus();
        setCaretOffset(el, caretRef.current[historyIndexRef.current] ?? html.length);
        syncContent();
        isRestoringRef.current = false;
    };

    const undo = () => {
        // Make sure the latest typed burst is recorded so redo can return to it.
        flushHistory();
        if (historyIndexRef.current <= 0) return;
        historyIndexRef.current -= 1;
        restoreFromHistory();
    };

    const redo = () => {
        if (historyIndexRef.current >= historyRef.current.length - 1) return;
        historyIndexRef.current += 1;
        restoreFromHistory();
    };

    // Convert execCommand's <font size="7"> wrappers into real px spans and make
    // sure the new size wins over any nested size. Called both when a size is
    // applied and on input (so text typed after choosing a size is converted).
    const normalizeFontSizes = (px: number) => {
        const root = editorRef.current;
        if (!root) return;
        root.querySelectorAll("font[size='7']").forEach((f) => {
            const span = document.createElement("span");
            span.style.fontSize = `${px}px`;
            while (f.firstChild) span.appendChild(f.firstChild);
            f.replaceWith(span);

            // Strip any font-size still sitting on nested content so the NEW
            // size actually wins (otherwise an inner size overrides it).
            span
                .querySelectorAll<HTMLElement>("[style*='font-size']")
                .forEach((child) => {
                    child.style.fontSize = "";
                    if (!child.getAttribute("style")) child.removeAttribute("style");
                });
            span.querySelectorAll("font[size]").forEach((child) => {
                child.removeAttribute("size");
            });
        });
    };

    // Read the size at the caret so the dropdown reflects the current selection.
    const detectFontSize = () => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        let node: Node | null = sel.anchorNode;
        if (node && node.nodeType === 3) node = node.parentElement;
        if (!node || !editorRef.current?.contains(node)) return;
        const px = Math.round(
            parseFloat(window.getComputedStyle(node as Element).fontSize)
        );
        if (!Number.isNaN(px)) setCurrentFontSize(px);
    };

    const handleInput = () => {
        if (isRestoringRef.current) return;
        // Text typed right after choosing a size arrives as <font size="7">;
        // convert it to the chosen px so "pick a size then type" works.
        if (pendingFontSizeRef.current != null) {
            normalizeFontSizes(pendingFontSizeRef.current);
        }
        syncContent();
        scheduleHistory();
    };

    // Intercept the browser's native undo/redo so it can never fight our stack.
    const handleKeyDown = (e: React.KeyboardEvent) => {
        const mod = e.ctrlKey || e.metaKey;
        if (!mod) return;
        const key = e.key.toLowerCase();
        if (key === "z" && !e.shiftKey) {
            e.preventDefault();
            undo();
        } else if (key === "y" || (key === "z" && e.shiftKey)) {
            e.preventDefault();
            redo();
        }
    };

    const executeCommand = (command: string, value: string | null = null) => {
        if (isPreviewOpen) {
            setIsPreviewOpen(false);
            setTimeout(() => {
                focusEditor();
                document.execCommand(command, false, value ?? undefined);
                commit();
            }, 0);
            return;
        }
        focusEditor();
        document.execCommand(command, false, value ?? undefined);
        commit();
    };

    const saveSelection = () => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    };

    const restoreSelection = () => {
        const range = savedSelectionRef.current;
        if (!range) return;
        const sel = window.getSelection();
        if (!sel) return;
        sel.removeAllRanges();
        sel.addRange(range);
    };

    const makeSelectedLinkOpenInNewTab = () => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const node =
            sel.anchorNode?.nodeType === 3
                ? sel.anchorNode.parentElement
                : (sel.anchorNode as HTMLElement | null);

        const a = node?.closest("a");
        if (!a) return;

        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
    };

    const handleLinkClickOpenNewTab = (e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        const a = target.closest("a") as HTMLAnchorElement | null;
        if (!a) return;

        const href = a.getAttribute("href");
        if (!href) return;

        e.preventDefault();
        e.stopPropagation();
        window.open(href, "_blank", "noopener,noreferrer");
    };

    const insertLink = () => {
        const sel = window.getSelection();
        if (!sel || !sel.toString().trim()) {
            alert("Please select text first to create a link");
            return;
        }
        saveSelection();
        setLinkDialog({ show: true, url: "" });
    };

    const applyLink = () => {
        const raw = linkDialog.url.trim();
        if (!raw) return;

        let url = raw;
        if (!/^https?:\/\//i.test(url)) url = "https://" + url;

        setLinkDialog({ show: false, url: "" });

        setTimeout(() => {
            focusEditor();
            restoreSelection();
            document.execCommand("createLink", false, url);
            makeSelectedLinkOpenInNewTab();
            commit();
        }, 0);
    };

    const changeTextColor = (hex: string) => {
        if (isPreviewOpen) setIsPreviewOpen(false);
        focusEditor();
        restoreSelection();
        document.execCommand("styleWithCSS", false, "true");
        document.execCommand("foreColor", false, hex);
        commit();
    };

    const applyFontSizePx = (px: number) => {
        if (isPreviewOpen) setIsPreviewOpen(false);
        pendingFontSizeRef.current = px;
        setCurrentFontSize(px);
        focusEditor();
        restoreSelection();

        // Emit <font size="7"> (not CSS) so we can reliably find + convert it, and
        // so a collapsed caret marks the size for the next characters typed.
        document.execCommand("styleWithCSS", false, "false");
        document.execCommand("fontSize", false, "7");

        normalizeFontSizes(px);
        commit();
    };

    const applyHighlightColor = (hex: string) => {
        if (isPreviewOpen) setIsPreviewOpen(false);
        focusEditor();
        restoreSelection();
        document.execCommand("styleWithCSS", false, "true");

        const ok = document.execCommand("hiliteColor", false, hex);
        if (!ok) document.execCommand("backColor", false, hex);

        commit();
    };

    const removeHighlight = () => {
        if (isPreviewOpen) setIsPreviewOpen(false);
        focusEditor();
        restoreSelection();
        document.execCommand("styleWithCSS", false, "true");

        const ok = document.execCommand("hiliteColor", false, "transparent");
        if (!ok) document.execCommand("backColor", false, "transparent");

        commit();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        saveSelection();

        const html = e.clipboardData.getData("text/html");
        const text = e.clipboardData.getData("text/plain");

        if (!html) {
            setTimeout(() => {
                focusEditor();
                restoreSelection();
                document.execCommand("insertText", false, text);
                commit();
            }, 0);
            return;
        }

        setPasteDialog({ show: true, html, text });
    };

    const pasteKeepFormatting = () => {
        const html = pasteDialog.html;
        setPasteDialog({ show: false, html: "", text: "" });

        setTimeout(() => {
            focusEditor();
            restoreSelection();
            document.execCommand("insertHTML", false, html);
            commit();
        }, 0);
    };

    const pastePlainText = () => {
        const text = pasteDialog.text;
        setPasteDialog({ show: false, html: "", text: "" });

        setTimeout(() => {
            focusEditor();
            restoreSelection();
            document.execCommand("insertText", false, text);
            commit();
        }, 0);
    };

    const clearSelectedColumnStyles = () => {
        const root = editorRef.current;
        if (!root) return;

        root
            .querySelectorAll(
                'table[data-rte-table="1"] td, table[data-rte-table="1"] th'
            )
            .forEach((cell) => {
                const el = cell as HTMLElement;
                if (el.dataset.rteSelected === "1") {
                    delete el.dataset.rteSelected;
                    el.style.outline = "";
                    el.style.outlineOffset = "";
                    el.style.background = "";
                    el.style.color = "";
                }
            });
    };

    const highlightSelectedColumn = (
        table: HTMLTableElement,
        colIndex: number
    ) => {
        clearSelectedColumnStyles();
        Array.from(table.rows).forEach((row) => {
            const cell = row.cells.item(colIndex) as HTMLElement | null;
            if (!cell) return;
            cell.dataset.rteSelected = "1";
            cell.style.outline = "2px solid rgba(173, 43, 8, 0.35)";
            cell.style.outlineOffset = "-2px";
            cell.style.background = "rgba(173, 43, 8, 0.08)";
            cell.style.color = "#000";
        });
    };

    const insertTable = () => {
        const { rows, cols } = tableDialog;

        let html = `<div class="rte-table-wrap" data-rte-wrap="1">
      <table data-rte-table="1" class="rte-table">
        <thead><tr>`;

        for (let j = 0; j < cols; j++) {
            html += `<th class="rte-th">Header ${j + 1}</th>`;
        }

        html += `</tr></thead><tbody>`;

        for (let i = 0; i < rows; i++) {
            const rowClass = i % 2 === 1 ? "rte-row-even" : "";
            html += `<tr class="${rowClass}">`;
            for (let j = 0; j < cols; j++) {
                html += `<td class="rte-td">Cell ${i + 1}-${j + 1}</td>`;
            }
            html += `</tr>`;
        }

        html += `</tbody></table></div><p><br></p>`;

        executeCommand("insertHTML", html);
        setTableDialog({ show: false, rows: 3, cols: 3 });
        setSelectedColumnIndex(null);
    };

    const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
        handleLinkClickOpenNewTab(e);

        const target = e.target as HTMLElement;
        const th = target.closest("th");
        const table = target.closest('table[data-rte-table="1"]');

        if (th && table) {
            const idx = (th as HTMLTableCellElement).cellIndex;
            setSelectedColumnIndex(idx);
            highlightSelectedColumn(table as HTMLTableElement, idx);
            return;
        }

        if (!table) {
            setSelectedColumnIndex(null);
            clearSelectedColumnStyles();
        }
    };

    const setTableAlign = (align: AlignType) => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const anchor =
            sel.anchorNode?.nodeType === 3
                ? sel.anchorNode.parentElement
                : (sel.anchorNode as HTMLElement | null);

        const table = anchor?.closest('table[data-rte-table="1"]') as
            | HTMLTableElement
            | null;

        if (!table) {
            if (align === "left") executeCommand("justifyLeft");
            if (align === "center") executeCommand("justifyCenter");
            if (align === "right") executeCommand("justifyRight");
            return;
        }

        if (selectedColumnIndex !== null) {
            Array.from(table.rows).forEach((row) => {
                const cell = row.cells.item(selectedColumnIndex);
                if (cell) (cell as HTMLElement).style.textAlign = align;
            });
            commit();
            return;
        }

        const cell = anchor?.closest("td, th") as HTMLElement | null;
        if (cell) {
            cell.style.textAlign = align;
            commit();
        }
    };

    const applyLineHeight = (lineHeight: string) => {
        if (isPreviewOpen) setIsPreviewOpen(false);
        focusEditor();

        const root = editorRef.current;
        const sel = window.getSelection();
        if (!root || !sel || sel.rangeCount === 0) return;

        const range = sel.getRangeAt(0);
        const blockSelector =
            "p, div, li, h1, h2, h3, h4, h5, h6, td, th";

        // Apply to every block that intersects the selection (multi-paragraph safe).
        const blocks = Array.from(
            root.querySelectorAll(blockSelector)
        ) as HTMLElement[];
        const affected = blocks.filter((b) => range.intersectsNode(b));

        if (affected.length > 0) {
            affected.forEach((b) => {
                b.style.lineHeight = lineHeight;
            });
        } else {
            let container: Node = range.commonAncestorContainer;
            if (container.nodeType === 3) container = container.parentElement as Node;
            const block = (container as HTMLElement).closest(
                blockSelector
            ) as HTMLElement | null;
            if (block) block.style.lineHeight = lineHeight;
            else root.style.lineHeight = lineHeight;
        }

        commit();
    };

    const toggleList = (type: "ul" | "ol") => {
        const cmd = type === "ul" ? "insertUnorderedList" : "insertOrderedList";
        executeCommand(cmd);
    };

    const insertHorizontalLine = () => executeCommand("insertHorizontalRule");

    const clearFormatting = () => {
        if (isPreviewOpen) setIsPreviewOpen(false);
        focusEditor();
        document.execCommand("removeFormat");
        document.execCommand("unlink");
        commit();
    };

    const plainTextLength = stats.chars;
    const wordsCount = stats.words;

    return (
        <div
            className={`bg-white rounded-xl overflow-hidden border border-gray-200 ${className}`}
        >
            {/* Toolbar */}
            <div className="border-b border-gray-200 bg-[#efefef] p-3">
                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        onClick={() => setIsPreviewOpen(true)}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-sm bg-[#ad2b08] text-white hover:bg-[#8d2306]"
                        type="button"
                    >
                        <Eye size={18} />
                        <span>Preview</span>
                    </button>

                    <div className="flex gap-1.5 pr-3 border-r border-gray-300">
                        <ToolbarButton onClick={undo} icon={<Undo size={18} />} title="Undo (Ctrl+Z)" />
                        <ToolbarButton onClick={redo} icon={<Redo size={18} />} title="Redo (Ctrl+Y)" />
                    </div>

                    <div className="flex items-center gap-2 px-3 border-r border-gray-300">
                        <Type size={16} className="text-gray-600" />
                        <select
                            onMouseDown={saveSelection}
                            value={currentFontSize}
                            onChange={(e) => applyFontSizePx(parseInt(e.target.value))}
                            className="px-3 py-2.5 border border-gray-300 rounded-md bg-white hover:border-[#ad2b08] focus:outline-none focus:ring-2 focus:ring-[#ad2b08] text-sm font-medium text-[#2c2c2c]"
                            title="Text Size"
                        >
                            {![12, 14, 16, 18, 20, 24, 28, 32, 40, 48].includes(
                                currentFontSize
                            ) && (
                                    <option value={currentFontSize}>
                                        {currentFontSize}px
                                    </option>
                                )}
                            <option value="12">12px</option>
                            <option value="14">14px</option>
                            <option value="16">16px</option>
                            <option value="18">18px</option>
                            <option value="20">20px</option>
                            <option value="24">24px</option>
                            <option value="28">28px</option>
                            <option value="32">32px</option>
                            <option value="40">40px</option>
                            <option value="48">48px</option>
                        </select>
                    </div>

                    {/* Line Height Control */}
                    <div className="flex items-center gap-2 px-3 border-r border-gray-300">
                        <span className="text-xs font-semibold text-gray-600">Line:</span>
                        <select
                            onChange={(e) => {
                                applyLineHeight(e.target.value);
                                e.target.selectedIndex = 0;
                            }}
                            className="px-3 py-2.5 border border-gray-300 rounded-md bg-white hover:border-[#ad2b08] focus:outline-none focus:ring-2 focus:ring-[#ad2b08] text-sm font-medium text-[#2c2c2c]"
                            defaultValue=""
                            title="Line Height"
                        >
                            <option value="" disabled>
                                1.6
                            </option>
                            <option value="1">1.0</option>
                            <option value="1.15">1.15</option>
                            <option value="1.5">1.5</option>
                            <option value="1.6">1.6</option>
                            <option value="1.8">1.8</option>
                            <option value="2">2.0</option>
                            <option value="2.5">2.5</option>
                            <option value="3">3.0</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 px-3 border-r border-gray-300">
                        <Palette size={16} className="text-gray-600" />
                        <label className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded-md bg-white hover:border-[#ad2b08] cursor-pointer">
                            <span className="text-sm font-medium text-[#2c2c2c]">Text</span>
                            <input
                                type="color"
                                defaultValue="#2c2c2c"
                                onMouseDown={saveSelection}
                                onChange={(e) => changeTextColor(e.target.value)}
                                className="w-8 h-8 cursor-pointer"
                                title="Text Color"
                            />
                        </label>
                    </div>

                    <div className="flex items-center gap-2 px-3 border-r border-gray-300">
                        <Highlighter size={16} className="text-gray-600" />
                        <label className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded-md bg-white hover:border-[#ad2b08] cursor-pointer">
                            <span className="text-sm font-medium text-[#2c2c2c]">Highlight</span>
                            <input
                                type="color"
                                defaultValue="#fff3a3"
                                onMouseDown={saveSelection}
                                onChange={(e) => applyHighlightColor(e.target.value)}
                                className="w-8 h-8 cursor-pointer"
                                title="Highlight Color"
                            />
                        </label>
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={removeHighlight}
                            className="px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-sm font-semibold"
                            title="Remove Highlight"
                        >
                            Clear
                        </button>
                    </div>

                    <div className="flex gap-1.5 px-3 border-r border-gray-300">
                        <ToolbarButton onClick={() => executeCommand("bold")} icon={<Bold size={18} />} title="Bold (Ctrl+B)" />
                        <ToolbarButton onClick={() => executeCommand("italic")} icon={<Italic size={18} />} title="Italic (Ctrl+I)" />
                        <ToolbarButton onClick={() => executeCommand("underline")} icon={<Underline size={18} />} title="Underline (Ctrl+U)" />
                    </div>

                    <div className="flex gap-1.5 px-3 border-r border-gray-300">
                        <ToolbarButton onClick={() => executeCommand("justifyLeft")} icon={<AlignLeft size={18} />} title="Align Left" />
                        <ToolbarButton onClick={() => executeCommand("justifyCenter")} icon={<AlignCenter size={18} />} title="Align Center" />
                        <ToolbarButton onClick={() => executeCommand("justifyRight")} icon={<AlignRight size={18} />} title="Align Right" />
                        <ToolbarButton onClick={() => executeCommand("justifyFull")} icon={<AlignJustify size={18} />} title="Justify" />
                    </div>

                    <div className="flex items-center gap-2 px-3 border-r border-gray-300">
                        <span className="text-xs font-semibold text-gray-600">Table Align:</span>
                        <ToolbarButton onClick={() => setTableAlign("left")} icon={<AlignLeft size={18} />} title="Table Start" />
                        <ToolbarButton onClick={() => setTableAlign("center")} icon={<AlignCenter size={18} />} title="Table Center" />
                        <ToolbarButton onClick={() => setTableAlign("right")} icon={<AlignRight size={18} />} title="Table End" />
                    </div>

                    <div className="flex gap-1.5 px-3 border-r border-gray-300">
                        <ToolbarButton onClick={() => toggleList("ul")} icon={<List size={18} />} title="Bullet List" />
                        <ToolbarButton onClick={() => toggleList("ol")} icon={<ListOrdered size={18} />} title="Numbered List" />
                    </div>

                    <div className="flex gap-1.5 px-3 border-x border-gray-300">
                        <ToolbarButton onClick={insertLink} icon={<LinkIcon size={18} />} title="Insert Link" />
                        <ToolbarButton onClick={() => setTableDialog({ ...tableDialog, show: true })} icon={<TableIcon size={18} />} title="Insert Table" />
                        <ToolbarButton onClick={insertHorizontalLine} icon={<Minus size={18} />} title="Insert Horizontal Line" />
                    </div>

                    <ToolbarButton onClick={clearFormatting} icon={<Trash2 size={18} />} title="Clear Formatting" />
                </div>

                {selectedColumnIndex !== null && (
                    <div className="mt-2 text-sm text-gray-600">
                        Selected column:{" "}
                        <span className="font-bold text-[#ad2b08]">{selectedColumnIndex + 1}</span>{" "}
                        (click header)
                    </div>
                )}
            </div>

            {/* Editor wrapper */}
            <div className="relative">
                {isEmpty && (
                    <div className="pointer-events-none absolute left-8 top-8 text-[#7d7f88]">
                        {placeholder}
                    </div>
                )}

                <div
                    ref={editorRef}
                    className="rte-content outline-none p-8 focus:ring-2 max-h-[70vh] focus:ring-[#ad2b0855] focus:ring-inset overflow-auto"
                    contentEditable
                    onFocus={() => {
                        isFocusedRef.current = true;
                    }}
                    onBlur={() => {
                        isFocusedRef.current = false;
                    }}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    onKeyUp={detectFontSize}
                    onMouseUp={detectFontSize}
                    onPaste={handlePaste}
                    onClick={handleEditorClick}
                    suppressContentEditableWarning
                    style={{
                        minHeight,
                        fontSize: "16px",
                        lineHeight: "1.6",
                        color: "#2c2c2c",
                    }}
                />
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-[#efefef] to-white px-6 py-4 border-t border-gray-200 text-sm text-[#2c2c2c]">
                <div className="flex justify-between items-center">
                    <span className="font-medium">
                        Characters: <span className="text-[#ad2b08] font-bold">{plainTextLength}</span>
                    </span>
                    <span className="font-medium">
                        Words: <span className="text-[#ad2b08] font-bold">{wordsCount}</span>
                    </span>
                    <span className="font-semibold flex items-center gap-2 text-[#ad2b08]">
                        <Edit size={16} />
                        Edit Mode
                    </span>
                </div>
            </div>

            {/* Preview Modal */}
            {isPreviewOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
                        onClick={() => setIsPreviewOpen(false)}
                    />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white z-[9999] w-[min(900px,92vw)] max-h-[85vh] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b">
                            <div className="flex items-center gap-2">
                                <Eye size={18} className="text-[#ad2b08]" />
                                <h3 className="text-lg font-bold text-[#2c2c2c]">Preview</h3>
                            </div>
                            <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100"
                                type="button"
                            >
                                <X />
                            </button>
                        </div>

                        <div
                            className="p-6 overflow-auto"
                            style={{
                                maxHeight: "calc(85vh - 70px)",
                            }}
                            // Preview mirrors what viewers will actually see post-sanitize.
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
                            onClick={handleLinkClickOpenNewTab as any}
                        />
                    </div>
                </>
            )}

            {/* Paste, Link, Table Dialogs */}
            {pasteDialog.show && (
                <>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]" />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white z-[9999] w-[520px] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b">
                            <div className="font-bold text-[#2c2c2c]">Paste options</div>
                            <button onClick={() => setPasteDialog({ show: false, html: "", text: "" })} className="p-2 rounded-lg hover:bg-gray-100" type="button"><X /></button>
                        </div>
                        <div className="p-5 text-sm text-gray-700">
                            Choose how you want to paste:
                            <div className="mt-3 p-3 rounded-xl bg-gray-50 border text-xs text-gray-600">
                                &quot;Keep formatting&quot; will keep Google Docs styles (bold, headings, lists, links, tables, etc.)
                            </div>
                        </div>
                        <div className="p-5 pt-0 flex gap-3 justify-end">
                            <button className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 font-semibold text-[#2c2c2c]" onClick={pastePlainText} type="button">Paste as plain text</button>
                            <button className="px-5 py-2.5 rounded-xl bg-[#ad2b08] hover:bg-[#8d2306] font-semibold text-white" onClick={pasteKeepFormatting} type="button">Keep formatting</button>
                        </div>
                    </div>
                </>
            )}

            {linkDialog.show && (
                <>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]" onClick={() => setLinkDialog({ show: false, url: "" })} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-2xl shadow-2xl z-[9999] w-[500px] border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#2c2c2c]">Insert Link</h3>
                            <button onClick={() => setLinkDialog({ show: false, url: "" })} className="p-2 rounded-lg hover:bg-gray-100" type="button"><X size={20} /></button>
                        </div>
                        <label className="block text-sm font-semibold text-[#2c2c2c] mb-2">Enter URL</label>
                        <input type="text" value={linkDialog.url} onChange={(e) => setLinkDialog({ ...linkDialog, url: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyLink(); } }} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#ad2b08] focus:ring-4 focus:ring-[#fff3f0] transition-all text-[#2c2c2c] font-medium" autoFocus placeholder="https://example.com" />
                        <div className="flex gap-3 justify-end mt-6">
                            <button className="px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold" onClick={() => setLinkDialog({ show: false, url: "" })} type="button">Cancel</button>
                            <button className="px-6 py-3 bg-[#ad2b08] text-white rounded-xl hover:bg-[#8d2306] font-semibold" onClick={applyLink} type="button">Insert Link</button>
                        </div>
                    </div>
                </>
            )}

            {tableDialog.show && (
                <>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]" onClick={() => setTableDialog({ show: false, rows: 3, cols: 3 })} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-2xl shadow-2xl z-[9999] w-[500px] border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#2c2c2c]">Insert Table</h3>
                            <button onClick={() => setTableDialog({ show: false, rows: 3, cols: 3 })} className="p-2 rounded-lg hover:bg-gray-100" type="button"><X size={20} /></button>
                        </div>
                        <div className="space-y-5 mb-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-semibold text-[#2c2c2c]">Rows</label>
                                    <span className="font-bold text-[#ad2b08]">{tableDialog.rows}</span>
                                </div>
                                <input type="range" min="1" max="20" value={tableDialog.rows} onChange={(e) => setTableDialog({ ...tableDialog, rows: parseInt(e.target.value) })} className="w-full accent-[#ad2b08]" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-semibold text-[#2c2c2c]">Columns</label>
                                    <span className="font-bold text-[#ad2b08]">{tableDialog.cols}</span>
                                </div>
                                <input type="range" min="2" max="10" value={tableDialog.cols} onChange={(e) => setTableDialog({ ...tableDialog, cols: parseInt(e.target.value) })} className="w-full accent-[#ad2b08]" />
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button className="px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold" onClick={() => setTableDialog({ show: false, rows: 3, cols: 3 })} type="button">Cancel</button>
                            <button className="px-6 py-3 bg-[#ad2b08] text-white rounded-xl hover:bg-[#8d2306] font-semibold" onClick={insertTable} type="button">Insert Table</button>
                        </div>
                    </div>
                </>
            )}

            {/* Add embedded styles for the editor */}
            <style dangerouslySetInnerHTML={{ __html: EMBEDDED_STYLES.replace(/<\/?style>/g, "") }} />
        </div>
    );
};

export default RichTextEditor;

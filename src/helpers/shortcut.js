import { Range, Editor, Transforms, Point } from "slate";

import { toggleMark } from "../marks";
import { isBlockActive, toggleBlock } from "../blocks";

const MARK_SHORTCUTS = ["code", "bold", "italic", "strikethrough", "underline"];
const BLOCK_SHORTCUTS = [
  "bulleted-list",
  "bulleted-list",
  "bulleted-list",
  "numbered-list",
  "block-quote",
  "heading-one",
  "heading-two",
  "heading-three",
  "heading-four",
  "heading-five",
  "heading-six",
  "code-block",
  "hr"
];

const SHORTCUTS = [...MARK_SHORTCUTS, ...BLOCK_SHORTCUTS];

const SHORTCUTS_REGEX = [
  "`([^`]+)`",
  "\\*\\*([^\\*]+)\\*\\*",
  "\\*([^\\*]+)\\*",
  "~~([^~]+)~~",
  "<u>([^(<u>)|(</u>)]+)</u>",
  "^\\*$",
  "^-$",
  "^\\+$",
  "^[0-9]\\.$",
  "^>$",
  "^#$",
  "^##$",
  "^###$",
  "^####$",
  "^#####$",
  "^######$",
  "^```([a-zA-Z]*)$",
  "^---$"
];

function detectShortcut(editor) {
  const { anchor } = editor.selection;
  const match = Editor.above(editor, {
    match: n => Editor.isBlock(editor, n)
  });

  const path = match ? match[1] : [];
  const start = Editor.start(editor, path);
  const range = { anchor, focus: start };
  const beforeText = Editor.string(editor, range);

  const shortcut = { lineRange: range };

  for (const index in SHORTCUTS_REGEX) {
    const regex = new RegExp(SHORTCUTS_REGEX[index], "g");
    if (regex.test(beforeText)) {
      shortcut.format = SHORTCUTS[index];
      shortcut.regex = regex;
      break;
    }
  }

  if (shortcut.format) {
    shortcut.matchArr = beforeText.match(shortcut.regex);
  }

  return shortcut;
}

function handleMarkShortcut(editor, shortcut) {
  const { insertText, children } = editor;
  const { anchor } = editor.selection;
  const { matchArr, regex, format } = shortcut;

  const targetTextWithMdTag = matchArr[matchArr.length - 1];
  const chilrenText = children[anchor.path[0]].children[anchor.path[1]].text;

  // 删除逻辑
  const deleteRangeStartOffset = chilrenText.length - targetTextWithMdTag.length;
  const deleteRangeEndOffset = chilrenText.length;

  const deleteRangeStart = { ...anchor, offset: deleteRangeStartOffset };
  const deleteRangeEnd = { ...anchor, offset: deleteRangeEndOffset };

  const deleteRange = { anchor: deleteRangeStart, focus: deleteRangeEnd };
  Transforms.select(editor, deleteRange);
  Transforms.delete(editor);

  // 插入新的内容
  const targetTextArr = regex.exec(targetTextWithMdTag);
  const targetInsertText = targetTextArr[1];
  insertText(targetInsertText);

  // 开始对新内容进行标注
  const needMarkRangeStartOffset = deleteRangeStartOffset;
  const needMarkRangeEndOffset = needMarkRangeStartOffset + targetInsertText.length;
  const needMarkRangeStart = {
    ...anchor,
    offset: needMarkRangeStartOffset
  };
  const needMarkRangeEnd = { ...anchor, offset: needMarkRangeEndOffset };

  const needMarkRange = {
    anchor: needMarkRangeStart,
    focus: needMarkRangeEnd
  };

  Transforms.select(editor, needMarkRange);
  toggleMark(editor, format);

  Transforms.collapse(editor, {
    edge: "end"
  });

  // 插入空格后，取消 mark 样式
  insertText(" ");
  const { focus } = editor.selection;
  Transforms.select(editor, {
    anchor: { path: focus.path, offset: focus.offset - 1 },
    focus
  });
  toggleMark(editor, format);

  Transforms.collapse(editor, {
    edge: "end"
  });
}

function handleBlockShortcut(editor, shortcut) {
  const { matchArr, regex, format, lineRange } = shortcut;
  let nodeProp = { type: format };

  Transforms.select(editor, lineRange);
  Transforms.delete(editor);

  if (format === "code-block") {
    const targetTextWithMdTag = matchArr[matchArr.length - 1];
    const targetTextArr = regex.exec(targetTextWithMdTag);
    const targetLang = targetTextArr[1];

    nodeProp = { ...nodeProp, lang: targetLang };
  }

  if (format === "bulleted-list" || format === "numbered-list") {
    nodeProp = { ...nodeProp, type: "list-item" };
  }

  Transforms.setNodes(editor, { ...nodeProp }, { match: n => Editor.isBlock(editor, n) });

  if (format === "bulleted-list" || format === "numbered-list") {
    const list = { type: format, children: [] };
    Transforms.wrapNodes(editor, list, {
      match: n => n.type === "list-item"
    });
  }
}

export default function withShortcuts(editor) {
  const { insertText, insertBreak, deleteBackward } = editor;

  editor.insertText = text => {
    const { selection } = editor;

    if (text === " " && selection && Range.isCollapsed(selection)) {
      const shortcut = detectShortcut(editor);

      if (BLOCK_SHORTCUTS.includes(shortcut.format)) {
        handleBlockShortcut(editor, shortcut);
      } else if (MARK_SHORTCUTS.includes(shortcut.format)) {
        handleMarkShortcut(editor, shortcut);
      } else {
        insertText(text);
      }

      return;
    }
    insertText(text);
  };

  editor.insertBreak = () => {
    for (const format of ["bulleted-list", "numbered-list"]) {
      if (isBlockActive(editor, format)) {
        const { anchor } = editor.selection;
        const match = Editor.above(editor, {
          match: n => Editor.isBlock(editor, n)
        });

        const path = match ? match[1] : [];
        const start = Editor.start(editor, path);
        const range = { anchor, focus: start };
        const beforeText = Editor.string(editor, range);

        // 如果为空，退出无序列表
        if (!beforeText) {
          toggleBlock(editor, format);
        } else {
          insertBreak();
        }

        return;
      }
    }

    insertBreak();

    let heading;
    const [match] = Editor.nodes(editor, {
      match: n => {
        if (n.type && n.type.startsWith("heading-")) {
          heading = n.type;
          return true;
        }
        return false;
      }
    });

    if (match) {
      toggleBlock(editor, heading);
    }
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n)
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (block.type !== "paragraph" && Point.equals(selection.anchor, start)) {
          Transforms.setNodes(editor, { type: "paragraph" });

          if (block.type === "list-item") {
            Transforms.unwrapNodes(editor, {
              match: n => n.type === "bulleted-list"
            });
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
}

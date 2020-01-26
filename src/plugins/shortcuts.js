import { Range, Editor, Transforms, Point } from "slate";

import { toggleMark } from "../marks";
import { isBlockActive, toggleBlock } from "../blocks";
import { getBeforeText } from "../utils";
import {
  BOLD,
  ITALIC,
  UNDERLINE,
  CODE,
  STRIKETHROUGH,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  CODE_BLOCK,
  BLOCK_QUOTE,
  BULLETED_LIST,
  NUMBERED_LIST,
  HR,
  LIST_ITEM,
  PARAGRAPH
} from "../constants";

const MARK_SHORTCUTS = [CODE, BOLD, ITALIC, STRIKETHROUGH, UNDERLINE];
const BLOCK_SHORTCUTS = [
  BULLETED_LIST,
  BULLETED_LIST,
  BULLETED_LIST,
  NUMBERED_LIST,
  BLOCK_QUOTE,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  CODE_BLOCK,
  HR
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
  const { beforeText, range } = getBeforeText(editor);
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

  if (format === CODE_BLOCK) {
    const targetTextWithMdTag = matchArr[matchArr.length - 1];
    const targetTextArr = regex.exec(targetTextWithMdTag);
    const targetLang = targetTextArr[1];

    nodeProp = { ...nodeProp, lang: targetLang };
  }

  if (format === BULLETED_LIST || format === NUMBERED_LIST) {
    nodeProp = { ...nodeProp, type: LIST_ITEM };
  }

  Transforms.setNodes(editor, { ...nodeProp }, { match: n => Editor.isBlock(editor, n) });

  if (format === BULLETED_LIST || format === NUMBERED_LIST) {
    const list = { type: format, children: [] };
    Transforms.wrapNodes(editor, list, {
      match: n => n.type === LIST_ITEM
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
    for (const format of [BULLETED_LIST, NUMBERED_LIST]) {
      if (isBlockActive(editor, format)) {
        const { beforeText } = getBeforeText(editor);

        // 如果为空，则退出
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

        if (block.type !== PARAGRAPH && Point.equals(selection.anchor, start)) {
          Transforms.setNodes(editor, { type: PARAGRAPH });

          if (block.type === LIST_ITEM) {
            Transforms.unwrapNodes(editor, {
              match: n => n.type === BULLETED_LIST
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

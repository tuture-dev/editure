import { Range, Editor, Transforms, Point } from "slate";

import { toggleMark } from "../marks";
import { isBlockActive, toggleBlock, detectBlockFormat } from "../blocks";
import { getBeforeText, getChildrenText } from "../utils";
import {
  BOLD,
  ITALIC,
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
  NOTE,
  BULLETED_LIST,
  NUMBERED_LIST,
  HR,
  LIST_ITEM,
  PARAGRAPH,
  LINK
} from "../constants";

const MARK_SHORTCUTS = [CODE, BOLD, ITALIC, STRIKETHROUGH, LINK];
const BLOCK_SHORTCUTS = [
  BULLETED_LIST,
  BULLETED_LIST,
  BULLETED_LIST,
  NUMBERED_LIST,
  BLOCK_QUOTE,
  NOTE,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  CODE_BLOCK,
  HR
];

const MARK_SHORTCUTS_REGEX = [
  "`([^`]+)`",
  "\\*\\*([^\\*]+)\\*\\*",
  "\\*([^\\*]+)\\*",
  "~~([^~]+)~~",
  /\[([^\\*]+)\]\(([^\\*]+)\)/
];

const BLOCK_SHORTCUTS_REGEX = [
  "^\\*$",
  "^-$",
  "^\\+$",
  "^[0-9]\\.$",
  "^\\s*>$",
  "^\\s*:::\\s*([a-zA-Z]*)$",
  "^\\s*#$",
  "^\\s*##$",
  "^\\s*###$",
  "^\\s*####$",
  "^\\s*#####$",
  "^\\s*######$",
  "^\\s*```\\s*([a-zA-Z]*)$",
  "^\\s*---$"
];

function reverseStr(str = "") {
  return str
    .split("")
    .reverse()
    .join("");
}

function detectMarkShortcut(editor) {
  let { beforeText, range } = getBeforeText(editor);
  const shortcut = { lineRange: range };

  for (const index in MARK_SHORTCUTS_REGEX) {
    const regex = new RegExp(MARK_SHORTCUTS_REGEX[index]);
    if (beforeText && regex.test(beforeText)) {
      const format = MARK_SHORTCUTS[index];

      if (format !== LINK) {
        // 对内容进行 reverse 操作，如果匹配，且 index = 0，那么说明满足触发条件
        beforeText = reverseStr(beforeText);
      }

      let matchArr = regex.exec(beforeText);

      if ((matchArr && matchArr.index === 0) || (format === LINK && matchArr)) {
        shortcut.format = format;

        if (format !== LINK) {
          matchArr = matchArr.map(elem =>
            typeof elem === "string" ? reverseStr(elem) : elem
          );
        }
        shortcut.matchArr = matchArr;
        break;
      }
    }
  }

  return shortcut;
}

function deleteBlockShortcut(editor) {
  const { beforeText, range } = getBeforeText(editor);
  const shortcut = { lineRange: range };

  for (const index in BLOCK_SHORTCUTS_REGEX) {
    const regex = new RegExp(BLOCK_SHORTCUTS_REGEX[index]);
    if (beforeText && regex.test(beforeText)) {
      const matchArr = regex.exec(beforeText);

      if (matchArr.index + matchArr[0].length === beforeText.length) {
        shortcut.format = BLOCK_SHORTCUTS[index];
        shortcut.matchArr = matchArr;
        break;
      }
    }
  }

  return shortcut;
}

function detectShortcut(editor) {
  // 首先检测是否是 mark shortuct
  const markShortcut = detectMarkShortcut(editor);

  // 如果不是 mark，那么检测是否是 block shortcuts
  if (!markShortcut.format) {
    const blockShortcut = deleteBlockShortcut(editor);
    return blockShortcut;
  }

  return markShortcut;
}

function handleMarkShortcut(editor, shortcut) {
  const { insertText, children } = editor;
  const { anchor } = editor.selection;
  const { matchArr, format } = shortcut;

  // 删除逻辑
  const targetTextWithMdTag = matchArr[0];
  const childrenText = getChildrenText(children, anchor.path);
  const deleteRangeStartOffset = childrenText.length - targetTextWithMdTag.length;
  const deleteRangeEndOffset = childrenText.length;

  const deleteRangeStart = { ...anchor, offset: deleteRangeStartOffset };
  const deleteRangeEnd = { ...anchor, offset: deleteRangeEndOffset };

  const deleteRange = { anchor: deleteRangeStart, focus: deleteRangeEnd };
  Transforms.select(editor, deleteRange);
  Transforms.delete(editor);

  // 插入新的内容
  const targetInsertText = matchArr[1];
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

  if (format === LINK) {
    Transforms.setNodes(editor, { url: matchArr[2] }, { match: n => n.link });
  }

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
  const { matchArr, format, lineRange } = shortcut;
  let nodeProp = { type: format };

  Transforms.select(editor, lineRange);
  Transforms.delete(editor);

  if ([CODE_BLOCK, NOTE].includes(format)) {
    if (format === CODE_BLOCK) {
      nodeProp = { ...nodeProp, lang: matchArr[1] };
    } else {
      nodeProp = { ...nodeProp, level: matchArr[1] };
    }

    // 在底部插入空行
    const currentSelection = editor.selection;
    Transforms.setSelection(editor, currentSelection);
  }

  if (format === BLOCK_QUOTE) {
    // 在底部插入空行
    const currentSelection = editor.selection;
    Transforms.setSelection(editor, currentSelection);
  }

  if (format === BULLETED_LIST || format === NUMBERED_LIST) {
    nodeProp = { ...nodeProp, type: LIST_ITEM };
  }

  if (format === HR) {
    const text = { text: "" };
    Transforms.removeNodes(editor, {
      match: n => n.children && !n.children[0].text
    });
    Transforms.insertNodes(editor, { type: HR, children: [text] });
    Transforms.insertNodes(editor, { children: [text] });
  } else {
    toggleBlock(editor, format, nodeProp);
  }
}

export default function withShortcuts(editor) {
  const { insertText, insertBreak, deleteBackward } = editor;

  editor.insertText = text => {
    const { selection } = editor;

    if (text === " " && selection && Range.isCollapsed(selection)) {
      const shortcut = detectShortcut(editor);
      const { format } = shortcut;

      if ([NOTE, CODE_BLOCK, HR].includes(format)) {
        insertText(text);
      } else if (BLOCK_SHORTCUTS.includes(format)) {
        if (isBlockActive(editor, CODE_BLOCK)) {
          insertText(text);
        } else {
          handleBlockShortcut(editor, shortcut);
        }
      } else if (MARK_SHORTCUTS.includes(format)) {
        // 在代码块里面不允许进行 mark 操作
        if (isBlockActive(editor, CODE_BLOCK)) {
          insertText(text);
        } else {
          handleMarkShortcut(editor, shortcut);
        }
      } else {
        insertText(text);
      }

      return;
    }
    insertText(text);
  };

  editor.insertBreak = () => {
    // 检测是否为代码块触发条件
    const shortcut = detectShortcut(editor);
    if ([CODE_BLOCK, NOTE, HR].includes(shortcut.format)) {
      if (!detectBlockFormat(editor, [CODE_BLOCK])) {
        handleBlockShortcut(editor, shortcut);
        return;
      } else {
        insertBreak();
      }

      return;
    }

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

    const headingFormat = detectBlockFormat(editor, [H1, H2, H3, H4, H5]);
    if (headingFormat) {
      toggleBlock(editor, headingFormat);
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

        if (
          block.type !== PARAGRAPH &&
          Point.equals(selection.anchor, start) &&
          detectBlockFormat(editor, [H1, H2, H3, H4, H5, H6])
        ) {
          Transforms.setNodes(editor, { type: PARAGRAPH });

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
}

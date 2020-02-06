import { Range, Editor, Transforms, Point } from "slate";

import { toggleMark, detectMarkFormat, MARK_TYPES } from "../marks";
import { isBlockActive, toggleBlock, detectBlockFormat, BLOCK_TYPES } from "../blocks";
import { getBeforeText, getChildrenText, compareNode } from "../utils";
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
  LINK,
  CODE_LINE
} from "../constants";

const MARK_SHORTCUT_REGEXES = [
  [CODE, /`([^`]+)`/],
  [BOLD, /\*\*([^\*]+)\*\*/],
  [BOLD, /__([^_]+)__/],
  [ITALIC, /\*([^\*]+)\*/],
  [ITALIC, /_([^_]+)_/],
  [STRIKETHROUGH, /~~([^~]+)~~/],
  [LINK, /\[([^\\*]+)\]\(([^\\*]+)\)/]
];

const BLOCK_SHORTCUT_REGEXES = [
  [BULLETED_LIST, /^\*$/],
  [BULLETED_LIST, /^-$/],
  [BULLETED_LIST, /^\+$/],
  [NUMBERED_LIST, /^[0-9]\.$/],
  [BLOCK_QUOTE, /^\s*>$/],
  [NOTE, /^\s*:::\\s*([a-zA-Z]*)$/],
  [H1, /^\s*#$/],
  [H2, /^\s*##$/],
  [H3, /^\s*###$/],
  [H4, /^\s*####$/],
  [H5, /^\s*#####$/],
  [H6, /^\s*######$/],
  [CODE_BLOCK, /^\s*```\s*([a-zA-Z]*)$/],
  [HR, /^\s*---$/],
  [HR, /^\s*\*\*\*$/],
  [HR, /^\s*___$/]
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

  for (const [format, regex] of MARK_SHORTCUT_REGEXES) {
    if (beforeText && regex.test(beforeText)) {
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

  for (const [format, regex] of BLOCK_SHORTCUT_REGEXES) {
    if (beforeText && regex.test(beforeText)) {
      const matchArr = regex.exec(beforeText);

      if (matchArr.index + matchArr[0].length === beforeText.length) {
        shortcut.format = format;
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
  const beforeText = childrenText.slice(0, editor.selection.focus.offset);
  const deleteRangeStartOffset = beforeText.length - targetTextWithMdTag.length;
  const deleteRangeEndOffset = beforeText.length;

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

  if ([BLOCK_QUOTE, CODE_BLOCK, NOTE].includes(format)) {
    if (format === CODE_BLOCK) {
      nodeProp = { ...nodeProp, lang: matchArr[1] };
    } else if (format === NOTE) {
      nodeProp = { ...nodeProp, level: matchArr[1] };
    }

    const currentSelection = editor.selection;
    Transforms.insertNodes(editor, { type: PARAGRAPH, children: [{ text: "" }] });
    Transforms.setSelection(editor, currentSelection);
  }

  if (format === BULLETED_LIST || format === NUMBERED_LIST) {
    nodeProp = { ...nodeProp, level: 0, parent: format, type: LIST_ITEM };
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
  const { insertText, insertBreak, deleteBackward, deleteFragment } = editor;

  editor.insertText = text => {
    const { selection } = editor;

    if (text === " " && selection && Range.isCollapsed(selection)) {
      const shortcut = detectShortcut(editor);
      console.log("shortcut", shortcut);
      const { format } = shortcut;

      if ([NOTE, CODE_BLOCK, HR].includes(format)) {
        insertText(text);
      } else if (BLOCK_TYPES.includes(format)) {
        if (detectBlockFormat(editor, [CODE_BLOCK, BULLETED_LIST, NUMBERED_LIST])) {
          insertText(text);
        } else {
          handleBlockShortcut(editor, shortcut);
        }
      } else if (MARK_TYPES.includes(format)) {
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
      const isInBlock = detectBlockFormat(editor, [
        CODE_BLOCK,
        BULLETED_LIST,
        NUMBERED_LIST
      ]);

      if (!isInBlock) {
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
    const { selection, children } = editor;

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
        } else if (
          children.length === 1 &&
          block.type === PARAGRAPH &&
          Point.equals(selection.anchor, start)
        ) {
          const marks = detectMarkFormat(editor);

          for (const mark of marks) {
            toggleMark(editor, mark);
          }
        }
      }

      deleteBackward(...args);
    }
  };

  editor.deleteFragment = () => {
    // 判断是否是全选删除
    const { selection, children } = editor;
    deleteFragment();

    const match = Editor.above(editor, {
      match: n => n.type === LIST_ITEM
    });

    // 修复删除 list 的问题
    if (match) {
      Transforms.setNodes(
        editor,
        {
          type: PARAGRAPH
        },
        {
          match: n => n.type === LIST_ITEM
        }
      );
    }

    // 如果是全选删除;
    let res = selection.focus.path[0] === children.length - 1;

    // 判断是否全选 BLOCK_QUOTE | CODE_BLOCK | NOTE
    const format = detectBlockFormat(editor, [BLOCK_QUOTE, CODE_BLOCK, NOTE]);
    if (format) {
      const [_, path] = Editor.above(editor, {
        match: n => n.type === format
      });

      const [start, end] = Editor.edges(editor, path);
      const { anchor, focus } = editor.selection;

      const isSameRange = compareNode(start, anchor) && compareNode(end, focus);
      res = isSameRange;
    }

    if (res) {
      const matchNode = Editor.next(editor, {
        match: n =>
          n.type === PARAGRAPH ||
          n.type === BULLETED_LIST ||
          n.type === NUMBERED_LIST ||
          n.type === CODE_LINE
      });

      if (
        matchNode &&
        (matchNode[0].type === PARAGRAPH || matchNode[0].type === CODE_LINE)
      ) {
        const [_, path] = matchNode;
        Transforms.select(editor, path);
        Transforms.collapse(editor, {
          edge: "end"
        });

        Transforms.mergeNodes(editor);

        return;
      }

      if (
        matchNode &&
        (matchNode[0].type === BULLETED_LIST || matchNode[0].type === NUMBERED_LIST)
      ) {
        const [node, path] = matchNode;

        Transforms.select(editor, path);
        toggleBlock(editor, node.type);

        Transforms.mergeNodes(editor);

        return;
      }
    }
  };

  return editor;
}

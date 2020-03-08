import { Range, Editor, Transforms, Point } from 'slate';
import * as F from 'editure-constants';

import {
  toggleMark,
  detectMarkFormat,
  isBlockActive,
  toggleBlock,
  detectBlockFormat,
  MARK_TYPES,
  BLOCK_TYPES
} from '../helpers';
import { getBeforeText, getChildrenText, compareNode } from '../utils';

type Shortcut = {
  lineRange: Range;
  format: string;
  matchArr: RegExpExecArray;
};

type ShortcutRegex = [string, RegExp];

const MARK_SHORTCUT_REGEXES: ShortcutRegex[] = [
  [F.CODE, /`([^`]+)`/],
  [F.BOLD, /\*\*([^\*]+)\*\*/],
  [F.BOLD, /__([^_]+)__/],
  [F.ITALIC, /\*([^\*]+)\*/],
  [F.ITALIC, /_([^_]+)_/],
  [F.STRIKETHROUGH, /~~([^~]+)~~/],
  [F.LINK, /\[([^*]+)\]\(([^*]+)\)/]
];

const BLOCK_SHORTCUT_REGEXES: ShortcutRegex[] = [
  [F.BULLETED_LIST, /^\*$/],
  [F.BULLETED_LIST, /^-$/],
  [F.BULLETED_LIST, /^\+$/],
  [F.NUMBERED_LIST, /^[0-9]\.$/],
  [F.BLOCK_QUOTE, /^\s*>$/],
  [F.NOTE, /^\s*:::\s*([a-zA-Z]*)$/],
  [F.H1, /^\s*#$/],
  [F.H2, /^\s*##$/],
  [F.H3, /^\s*###$/],
  [F.H4, /^\s*####$/],
  [F.H5, /^\s*#####$/],
  [F.H6, /^\s*######$/],
  [F.CODE_BLOCK, /^\s*```\s*([a-zA-Z]*)$/],
  [F.HR, /^\s*---$/],
  [F.HR, /^\s*\*\*\*$/],
  [F.HR, /^\s*___$/]
];

function reverseStr(str = '') {
  return str
    .split('')
    .reverse()
    .join('');
}

function detectMarkShortcut(editor: Editor): Shortcut {
  let { beforeText, range } = getBeforeText(editor);
  const shortcut: Partial<Shortcut> = { lineRange: range };

  for (const [format, regex] of MARK_SHORTCUT_REGEXES) {
    if (beforeText && regex.test(beforeText)) {
      if (format !== F.LINK) {
        // Reverse the text.
        // If matched and index equals 0, then this shortcut is triggered.
        beforeText = reverseStr(beforeText);
      }

      let matchArr = regex.exec(beforeText);

      if ((matchArr && matchArr.index === 0) || (format === F.LINK && matchArr)) {
        shortcut.format = format;

        if (format !== F.LINK) {
          matchArr = matchArr.map(elem =>
            typeof elem === 'string' ? reverseStr(elem) : elem
          ) as RegExpExecArray;
        }
        shortcut.matchArr = matchArr;
        break;
      }
    }
  }

  return shortcut as Shortcut;
}

function deleteBlockShortcut(editor: Editor): Shortcut {
  const { beforeText, range } = getBeforeText(editor);
  const shortcut: Partial<Shortcut> = { lineRange: range };

  for (const [format, regex] of BLOCK_SHORTCUT_REGEXES) {
    if (beforeText && regex.test(beforeText)) {
      const matchArr = regex.exec(beforeText);

      if (matchArr && matchArr.index + matchArr[0].length === beforeText.length) {
        shortcut.format = format;
        shortcut.matchArr = matchArr;
        break;
      }
    }
  }

  return shortcut as Shortcut;
}

function detectShortcut(editor: Editor): Shortcut {
  // First detect whether is mark shortcut.
  const markShortcut = detectMarkShortcut(editor);

  // Otherwise detect whether is block shortcut.
  if (!markShortcut.format) {
    const blockShortcut = deleteBlockShortcut(editor);
    return blockShortcut;
  }

  return markShortcut;
}

function handleMarkShortcut(editor: Editor, shortcut: Shortcut) {
  if (!editor.selection) {
    return;
  }

  const { insertText, children } = editor;
  const { anchor } = editor.selection;
  const { matchArr, format } = shortcut;

  // Delete previous content with markdown syntax.
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

  // Insert nodes.
  const targetInsertText = matchArr[1];
  insertText(targetInsertText);

  // Mark inserted nodes.
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

  if (format === F.LINK) {
    Transforms.setNodes(editor, { url: matchArr[2] }, { match: n => n.link });
  }

  Transforms.collapse(editor, {
    edge: 'end'
  });

  // Remove marks and insert the space.
  toggleMark(editor, format);
  insertText(' ');
}

function handleBlockShortcut(editor: Editor, shortcut: Shortcut) {
  const { matchArr, format, lineRange } = shortcut;
  let nodeProp: any = { type: format };

  Transforms.select(editor, lineRange);
  Transforms.delete(editor);

  if ([F.BLOCK_QUOTE, F.CODE_BLOCK, F.NOTE].includes(format)) {
    if (format === F.CODE_BLOCK) {
      nodeProp = { ...nodeProp, lang: matchArr[1] };
    } else if (format === F.NOTE) {
      nodeProp = { ...nodeProp, level: matchArr[1] };
    }

    if (editor.selection) {
      Transforms.setSelection(editor, editor.selection);
    }
  }

  if (format === F.BULLETED_LIST || format === F.NUMBERED_LIST) {
    nodeProp = { ...nodeProp, level: 0, parent: format, type: F.LIST_ITEM };
  }

  if (format === F.HR) {
    const text = { text: '' };
    Transforms.removeNodes(editor, {
      match: n => n.children && !n.children[0].text
    });
    Transforms.insertNodes(editor, { type: F.HR, children: [text] });
    Transforms.insertNodes(editor, { type: F.PARAGRAPH, children: [text] });
  } else {
    toggleBlock(editor, format, nodeProp);
  }
}

export default function withShortcuts(editor: Editor) {
  const { insertText, insertBreak, deleteBackward, deleteFragment } = editor;

  editor.insertText = text => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const shortcut = detectShortcut(editor);
      const { format } = shortcut;

      if ([F.NOTE, F.CODE_BLOCK, F.HR].includes(format)) {
        insertText(text);
      } else if (BLOCK_TYPES.includes(format)) {
        if (detectBlockFormat(editor, [F.CODE_BLOCK, F.BULLETED_LIST, F.NUMBERED_LIST])) {
          insertText(text);
        } else {
          handleBlockShortcut(editor, shortcut);
        }
      } else if (MARK_TYPES.includes(format)) {
        // Disallow mark shortcuts in code blocks.
        if (isBlockActive(editor, F.CODE_BLOCK)) {
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
    const shortcut = detectShortcut(editor);

    if ([F.CODE_BLOCK, F.NOTE, F.HR].includes(shortcut.format)) {
      const isInBlock = detectBlockFormat(editor, [
        F.CODE_BLOCK,
        F.BULLETED_LIST,
        F.NUMBERED_LIST
      ]);

      if (!isInBlock) {
        handleBlockShortcut(editor, shortcut);
        return;
      } else {
        insertBreak();
      }

      return;
    }

    for (const format of [F.BULLETED_LIST, F.NUMBERED_LIST]) {
      if (isBlockActive(editor, format)) {
        const { beforeText } = getBeforeText(editor);

        // Exit the block if empty.
        if (!beforeText) {
          toggleBlock(editor, format);
        } else {
          insertBreak();
        }

        return;
      }
    }

    insertBreak();

    const headingFormat = detectBlockFormat(editor, [F.H1, F.H2, F.H3, F.H4, F.H5]);
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
          block.type !== F.PARAGRAPH &&
          Point.equals(selection.anchor, start) &&
          detectBlockFormat(editor, [F.H1, F.H2, F.H3, F.H4, F.H5, F.H6])
        ) {
          Transforms.setNodes(editor, { type: F.PARAGRAPH });

          return;
        } else if (
          children.length === 1 &&
          block.type === F.PARAGRAPH &&
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
    deleteFragment();

    const { selection, children } = editor;

    if (!selection) {
      return;
    }

    let res = selection.focus.path[0] === children.length - 1;

    // Detect is deleting all within BLOCK_QUOTE | CODE_BLOCK | NOTE
    const format = detectBlockFormat(editor, [F.BLOCK_QUOTE, F.CODE_BLOCK, F.NOTE]);
    if (format) {
      const node = Editor.above(editor, {
        match: n => n.type === format
      });

      if (node) {
        const [, path] = node;
        const [start, end] = Editor.edges(editor, path);
        const { anchor, focus } = selection;

        const isSameRange = compareNode(start, anchor) && compareNode(end, focus);
        res = isSameRange;
      }
    }

    if (res) {
      const matchNode = Editor.next(editor, {
        match: n =>
          n.type === F.PARAGRAPH ||
          n.type === F.BULLETED_LIST ||
          n.type === F.NUMBERED_LIST ||
          n.type === F.CODE_LINE
      });

      if (
        matchNode &&
        (matchNode[0].type === F.PARAGRAPH || matchNode[0].type === F.CODE_LINE)
      ) {
        const [, path] = matchNode;
        Transforms.select(editor, path);
        Transforms.collapse(editor, {
          edge: 'end'
        });

        Transforms.mergeNodes(editor);

        return;
      }

      if (
        matchNode &&
        (matchNode[0].type === F.BULLETED_LIST || matchNode[0].type === F.NUMBERED_LIST)
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

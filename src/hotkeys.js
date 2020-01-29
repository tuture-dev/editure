import { Transforms, Editor, Element, Node, Text } from "slate";
import isHotkey from "is-hotkey";

import { getBeforeText } from "./utils";
import { toggleMark } from "./marks";
import { toggleBlock, isBlockActive, detectBlockFormat } from "./blocks";
import { decreaseItemDepth, increaseItemDepth } from "./plugins/list";
import {
  BOLD,
  ITALIC,
  UNDERLINE,
  CODE,
  STRIKETHROUGH,
  PARAGRAPH,
  H1,
  H2,
  H3,
  H4,
  CODE_BLOCK,
  LINK,
  IMAGE,
  BLOCK_QUOTE,
  BULLETED_LIST,
  NUMBERED_LIST,
  HR,
  SHORT_CUTS,
  NOTE
} from "./constants";

const MARK_HOTKEYS = {
  "mod+b": BOLD,
  "mod+i": ITALIC,
  "mod+u": UNDERLINE,
  "mod+`": CODE,
  "mod+shift+`": STRIKETHROUGH
};

const BLOCK_HOTKEYS = {
  "mod+0": PARAGRAPH,
  "mod+1": H1,
  "mod+2": H2,
  "mod+3": H3,
  "mod+4": H4,
  "mod+shift+c": CODE_BLOCK,
  "mod+k": LINK,
  "mod+shift+i": IMAGE,
  "mod+shift+u": BLOCK_QUOTE,
  "mod+alt+u": BULLETED_LIST,
  "mod+alt+o": NUMBERED_LIST,
  "mod+alt+-": HR
};

function handleTabKey(editor, event) {
  const { beforeText } = getBeforeText(editor);

  if (!beforeText.length && detectBlockFormat(editor, [BULLETED_LIST, NUMBERED_LIST])) {
    event.preventDefault();

    increaseItemDepth(editor);
  } else if (
    beforeText.length &&
    detectBlockFormat(editor, [BULLETED_LIST, NUMBERED_LIST])
  ) {
    event.preventDefault();
    Transforms.insertText(editor, "\t");
  } else if (isBlockActive(editor, CODE_BLOCK)) {
    event.preventDefault();
    Transforms.insertText(editor, "  ");
  } else {
    event.preventDefault();
    Transforms.insertText(editor, "\t");
  }
}

function handleShiftTabKey(editor, event) {
  event.preventDefault();
  if (isBlockActive(editor, BULLETED_LIST) || isBlockActive(editor, NUMBERED_LIST)) {
    decreaseItemDepth(editor);
  }
}

function handleSelectAll(editor, event) {
  const format = detectBlockFormat(editor, [BLOCK_QUOTE, CODE_BLOCK, NOTE]);
  if (format) {
    event.preventDefault();

    const match = Editor.above(editor, {
      match: n => Element.matches(n, { type: format })
    });

    const path = match[1];

    const anchor = Editor.start(editor, path);
    const focus = Editor.end(editor, path);
    const range = { anchor, focus };
    Transforms.select(editor, range);
  }
}

function handleSelectLeftAll(editor, event) {
  if (detectBlockFormat(editor, [CODE_BLOCK, BLOCK_QUOTE, NOTE])) {
    event.preventDefault();
    const type = detectBlockFormat(editor, [CODE_BLOCK, BLOCK_QUOTE, NOTE]);

    const { selection } = editor;
    const { anchor } = selection;

    const match = Editor.above(editor, {
      match: n => Element.matches(n, { type })
    });

    const path = match[1];

    const start = Editor.start(editor, path);
    const range = { anchor: start, focus: anchor };
    Transforms.select(editor, range);
  }
}

function handleSelectRightAll(editor, event) {
  if (detectBlockFormat(editor, [CODE_BLOCK, BLOCK_QUOTE, NOTE])) {
    event.preventDefault();
    const type = detectBlockFormat(editor, [CODE_BLOCK, BLOCK_QUOTE, NOTE]);

    const { selection } = editor;
    const { anchor } = selection;

    const match = Editor.above(editor, {
      match: n => Element.matches(n, { type })
    });

    const path = match[1];

    const end = Editor.end(editor, path);
    const range = { anchor, focus: end };
    Transforms.select(editor, range);
  }
}

function handleDeleteLine(editor, event) {
  event.preventDefault();

  // 具体就是遍历此代码块/引用的  children 数组
  // 找到最近的一个 \n 字符，然后删除此 \n 之后的字符到光标此时选中的字符
  const { selection, deleteBackward } = editor;
  const { anchor } = selection;
  const { path } = anchor;

  const { beforeText } = getBeforeText(editor);

  if (beforeText) {
    const deletePath = path.slice(0, path.length - 1);
    const start = Editor.start(editor, deletePath);

    Transforms.select(editor, { anchor: start, focus: anchor });
    Transforms.delete(editor);
  } else {
    deleteBackward();
  }
}

function handleExitBlock(editor, event) {
  const format = detectBlockFormat(editor, [CODE_BLOCK, BLOCK_QUOTE, NOTE]);
  if (format) {
    event.preventDefault();

    const match = Editor.above(editor, {
      match: n => Element.matches(n, { type: format })
    });

    const path = match[1];
    const focus = Editor.end(editor, path);
    const range = { anchor: focus, focus };
    Transforms.select(editor, range);
    Transforms.collapse(editor, {
      edge: "end"
    });
    Editor.insertBreak(editor);

    toggleBlock(editor, format, {}, SHORT_CUTS);
  }
}

export default function createHotKeysHandler(editor) {
  return event => {
    for (const hotkey in MARK_HOTKEYS) {
      if (isHotkey(hotkey, event)) {
        event.preventDefault();
        const mark = MARK_HOTKEYS[hotkey];
        toggleMark(editor, mark);
        return;
      }
    }

    for (const hotkey in BLOCK_HOTKEYS) {
      if (isHotkey(hotkey, event)) {
        event.preventDefault();
        const mark = BLOCK_HOTKEYS[hotkey];
        toggleBlock(editor, mark);
        return;
      }
    }

    // 全选，在代码块/引用里面按 mod+a 或者 shift + command + up
    // 应该选择代码块/引用内的内容
    if (isHotkey("mod+a", event)) {
      handleSelectAll(editor, event);
      return;
    }

    if (isHotkey("mod+shift+up", event)) {
      handleSelectLeftAll(editor, event);
      return;
    }

    if (isHotkey("mod+shift+down", event)) {
      handleSelectRightAll(editor, event);
      return;
    }

    // 删除，在代码块/引用里面按 mod+delete 或者 shift + command + up
    // 应该删除代码块/引用中当前行之前的内容
    if (isHotkey("mod+backspace", event)) {
      handleDeleteLine(editor, event);
      return;
    }

    if (isHotkey("mod+enter", event)) {
      handleExitBlock(editor, event);
      return;
    }

    if (isHotkey("shift+tab", event)) {
      handleShiftTabKey(editor, event);
    }

    if (isHotkey("tab", event)) {
      handleTabKey(editor, event);
    }
  };
}

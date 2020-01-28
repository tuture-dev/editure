import { Transforms, Editor, Element, Node, Text } from "slate";
import isHotkey from "is-hotkey";

import { getBeforeText, getChildrenText } from "./utils";
import { toggleMark } from "./marks";
import { toggleBlock, isBlockActive } from "./blocks";
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
  LIST_ITEM
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

function handleSoftBreak(editor, event) {
  event.preventDefault();

  const { insertBreak, deleteBackward } = editor;
  if (isBlockActive(editor, BLOCK_QUOTE)) {
    const { beforeText } = getBeforeText(editor);

    if (!beforeText.split("\n").slice(-1)[0]) {
      // 如果最后一行为空，退出块状引用
      deleteBackward();
      insertBreak();
      toggleBlock(editor, BLOCK_QUOTE);
    } else {
      // 还是软换行
      Transforms.insertText(editor, "\n");
    }
  } else if (isBlockActive(editor, CODE_BLOCK)) {
    // 代码块始终软换行
    Transforms.insertText(editor, "\n");
  } else {
    insertBreak();
  }
}

function handleTabKey(editor, event) {
  const { beforeText } = getBeforeText(editor);

  if (
    !beforeText.length &&
    (isBlockActive(editor, BULLETED_LIST) || isBlockActive(editor, NUMBERED_LIST))
  ) {
    event.preventDefault();

    const type = isBlockActive(editor, BULLETED_LIST) ? BULLETED_LIST : NUMBERED_LIST;

    const [node, _] = Editor.above(editor, {
      match: n => n.type === type
    });
    const { level = 0 } = node;

    // 如果此时 ul 中 li 大于 1 个，那么分出此时的 li，将其变成  ul > li
    if (node && node.children.length > 1) {
      Transforms.liftNodes(editor, {
        match: n => n.type === LIST_ITEM
      });

      Transforms.wrapNodes(
        editor,
        {
          type,
          level: Math.min(level + 1, 8)
        },
        {
          macth: n => n.type === LIST_ITEM
        }
      );
    } else {
      const type = isBlockActive(editor, BULLETED_LIST) ? BULLETED_LIST : NUMBERED_LIST;

      Transforms.setNodes(
        editor,
        {
          level: Math.min(level + 1, 8)
        },
        {
          match: n => n.type === type
        }
      );
    }
  } else if (
    beforeText.length &&
    (isBlockActive(editor, BULLETED_LIST) || isBlockActive(editor, NUMBERED_LIST))
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
    const type = isBlockActive(editor, BULLETED_LIST) ? BULLETED_LIST : NUMBERED_LIST;
    const [node, _] = Editor.above(editor, {
      match: n => n.type === type
    });
    const { level = 0 } = node;

    // 如果此 list-item 所属列表中元素个数大于1，
    // 就要考虑将此元素单独提取出来，成为一个列表
    if (node && node.children.length > 1) {
      Transforms.liftNodes(editor, {
        match: n => n.type === LIST_ITEM
      });

      Transforms.wrapNodes(
        editor,
        {
          type,
          level: Math.max(level - 1, 0)
        },
        {
          macth: n => n.type === LIST_ITEM
        }
      );
    } else {
      // 设置层级
      Transforms.setNodes(
        editor,
        {
          level: Math.max(level - 1, 0)
        },
        {
          match: n => n.type === type
        }
      );

      // 判断如果此时回退层级和之前的同类型列表的 level 一致，就合并进此同类型列表
      const [node, _] = Editor.previous(editor, {
        match: n => n.type === type
      });

      if (node) {
        const { level: previousLevel = 0 } = node;
        if (previousLevel === Math.max(level - 1, 0)) {
          Transforms.mergeNodes(editor, {
            match: n => n.type === type
          });
        }
      }
    }
  }
}

function handleSelectAll(editor, event) {
  if (isBlockActive(editor, BLOCK_QUOTE) || isBlockActive(editor, CODE_BLOCK)) {
    event.preventDefault();
    let type = BLOCK_QUOTE;

    if (isBlockActive(editor, CODE_BLOCK)) {
      type = CODE_BLOCK;
    }

    const match = Editor.above(editor, {
      match: n => Element.matches(n, { type })
    });

    const path = match[1];

    const anchor = Editor.start(editor, path);
    const focus = Editor.end(editor, path);
    const range = { anchor, focus };
    Transforms.select(editor, range);
  }
}

function handleDeleteLine(editor, event) {
  event.preventDefault();

  // 具体就是遍历此代码块/引用的  children 数组
  // 找到最近的一个 \n 字符，然后删除此 \n 之后的字符到光标此时选中的字符
  const { selection, children } = editor;
  const { anchor } = selection;
  const { path, offset } = anchor;

  console.log("path", path);

  for (let i = 0; i <= anchor.path[1]; i++) {
    const nowSelectionText = getChildrenText(children, [path[0], i, path.slice(2)]) || "";

    console.log("");

    const sliceOffset = i === anchor.path[1] ? offset : nowSelectionText.length;

    if (nowSelectionText.slice(0, sliceOffset).includes("\n")) {
      const enterLocation = nowSelectionText.lastIndexOf("\n");

      const focus = {
        path: [path[0], i],
        offset: enterLocation + 1
      };
      const range = { anchor: focus, focus: anchor };
      Transforms.select(editor, range);
      Transforms.delete(editor);
    } else if (i === 0) {
      const range = {
        anchor: { path: [path[0], 0], offset: 0 },
        focus: anchor
      };
      Transforms.select(editor, range);
      Transforms.delete(editor);
    }
  }
}

function handleExitBlock(editor, event) {
  if (isBlockActive(editor, CODE_BLOCK) || isBlockActive(editor, BLOCK_QUOTE)) {
    event.preventDefault();

    const match = Editor.above(editor, {
      match: n =>
        Element.matches(n, {
          type: isBlockActive(editor, CODE_BLOCK) ? CODE_BLOCK : BLOCK_QUOTE
        })
    });

    const path = match[1];
    const focus = Editor.end(editor, path);
    const range = { anchor: focus, focus };
    Transforms.select(editor, range);
    Transforms.collapse(editor, {
      edge: "end"
    });
    Editor.insertBreak(editor);
    toggleBlock(editor, isBlockActive(editor, CODE_BLOCK) ? CODE_BLOCK : BLOCK_QUOTE);
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
    if (isHotkey("mod+a", event) || isHotkey("mod+shift+up", event)) {
      handleSelectAll(editor, event);
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

    if (event.key === "Enter") {
      handleSoftBreak(editor, event);
    }

    if (isHotkey("shift+tab", event)) {
      handleShiftTabKey(editor, event);
    }

    console.log("event", event.key);
    if (isHotkey("tab", event)) {
      handleTabKey(editor, event);
    }
  };
}

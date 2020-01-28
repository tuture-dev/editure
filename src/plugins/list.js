import { Transforms, Editor, Point, Range } from "slate";

import { isBlockActive } from "../blocks";
import { LIST_ITEM, BULLETED_LIST, NUMBERED_LIST, PARAGRAPH } from "../constants";

export const increaseItemDepth = editor => {
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
};

export const decreaseItemDepth = editor => {
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
};

export const withList = editor => {
  const { insertText, deleteBackward } = editor;

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
          isBlockActive(editor, LIST_ITEM)
        ) {
          const type = isBlockActive(editor, BULLETED_LIST)
            ? BULLETED_LIST
            : NUMBERED_LIST;

          const [node, _] = Editor.above(editor, {
            match: n => n.type === type
          });

          const { level = 0 } = node;

          if (level === 0) {
            Transforms.liftNodes(editor, {
              match: n => n.type === LIST_ITEM
            });

            Transforms.setNodes(editor, { type: PARAGRAPH });
          } else {
            decreaseItemDepth(editor);
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
};

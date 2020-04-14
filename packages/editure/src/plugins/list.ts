import { Transforms, Editor, Range, Element, Node } from 'tuture-slate';
import { LIST_ITEM, BULLETED_LIST, NUMBERED_LIST, PARAGRAPH } from 'editure-constants';

import { EditorWithBlock } from './base-block';
import { getBeforeText, getLineText } from '../utils';
import { detectShortcut } from '../shortcuts';

export interface EditorWithList extends EditorWithBlock {
  increaseItemDepth(): void;
  decreaseItemDepth(): void;
}

const shortcutRegexes: [string, RegExp[]][] = [
  [BULLETED_LIST, [/^\*$/, /^-$/, /^\+$/]],
  [NUMBERED_LIST, [/^[0-9]\.$/]],
];

const toggleList = (editor: EditorWithBlock, format: string, props?: any) => {
  if ([BULLETED_LIST, NUMBERED_LIST].includes(format)) {
    const isActive = !!editor.detectBlockFormat([BULLETED_LIST, NUMBERED_LIST]);

    Editor.withoutNormalizing(editor, () => {
      if (!isActive) {
        Transforms.setNodes(editor, {
          ...props,
          type: LIST_ITEM,
        });

        const block = { type: format, children: [] };
        Transforms.wrapNodes(editor, block, props);
      } else {
        Transforms.unwrapNodes(editor, {
          match: (n) => [BULLETED_LIST, NUMBERED_LIST].includes(n.type),
          split: true,
        });

        Transforms.setNodes(editor, {
          type: PARAGRAPH,
        });

        Transforms.unsetNodes(editor, ['parent', 'number', 'level']);
      }
    });
  }
};

export const withList = (editor: EditorWithBlock) => {
  const e = editor as EditorWithList;
  const { insertText, insertBreak, deleteBackward, normalizeNode, toggleBlock } = e;

  e.insertText = (text) => {
    if (text === ' ' && Range.isCollapsed(editor.selection!)) {
      for (const [format, regexes] of shortcutRegexes) {
        const matchArr = detectShortcut(e, regexes);

        if (matchArr && !editor.detectBlockFormat([NUMBERED_LIST, BULLETED_LIST])) {
          Transforms.select(e, getBeforeText(e).range!);
          Transforms.delete(e);

          const nodeProp = { type: LIST_ITEM, level: 0, parent: format };
          return toggleList(e, format, nodeProp);
        }
      }

      return insertText(' ');
    }

    insertText(text);
  };

  e.insertBreak = () => {
    for (const format of [BULLETED_LIST, NUMBERED_LIST]) {
      if (e.isBlockActive(format)) {
        const { wholeLineText } = getLineText(e);

        // Exit the list if empty.
        if (!wholeLineText) {
          return toggleList(e, format);
        }

        return insertBreak();
      }
    }

    insertBreak();
  };

  e.deleteBackward = (unit) => {
    if (unit !== 'character') {
      return deleteBackward(unit);
    }

    const [match] = Editor.nodes(e, {
      match: (n) => n.type === LIST_ITEM,
    });

    if (match) {
      const [node] = match;
      const { level = 0 } = node;
      const { beforeText } = getBeforeText(e);

      if (beforeText) {
        return deleteBackward('character');
      }

      if (level === 0) {
        Transforms.liftNodes(e, {
          match: (n) => n.type === LIST_ITEM,
        });

        Transforms.setNodes(e, { type: PARAGRAPH });
        Transforms.unsetNodes(e, ['level', 'parent', 'number']);
      } else {
        e.decreaseItemDepth();
      }

      return;
    }

    deleteBackward(unit);
  };

  e.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (!Element.isElement(node)) {
      return normalizeNode(entry);
    }

    if (node.type === BULLETED_LIST) {
      for (const [child, childPath] of Node.children(e, path)) {
        const { level = 0, children = [] } = child;
        Transforms.setNodes(e, { level, parent: node.type }, { at: childPath });

        // List item should not have any block child.
        if (children.length === 1 && Element.isElement(children[0])) {
          Transforms.unwrapNodes(e, { at: [...childPath, 0] });
        }
      }
      return;
    }

    // If the element is a numbered-list, ensure each item has correct number.
    if (node.type === NUMBERED_LIST) {
      const counterStack: number[] = [];
      let counter = 0;
      let lastLevel = 0;

      for (const [child, childPath] of Node.children(e, path)) {
        const { level = 0, children = [] } = child;
        if (level > lastLevel) {
          counterStack.push(counter);
          counter = 1;
        } else if (level < lastLevel) {
          while (level < lastLevel) {
            counter = Number(counterStack.pop()) + 1;
            lastLevel--;
          }
        } else {
          counter++;
        }

        Transforms.setNodes(e, { level, parent: node.type, number: counter }, { at: childPath });

        lastLevel = level;

        // List item should not have any block child.
        if (children.length === 1 && Element.isElement(children[0])) {
          Transforms.unwrapNodes(e, { at: [...childPath, 0] });
        }
      }
      return;
    }

    if (node.type === LIST_ITEM) {
      const parent = Editor.parent(editor, path);
      if (![BULLETED_LIST, NUMBERED_LIST].includes(parent[0].type)) {
        Transforms.setNodes(editor, { type: PARAGRAPH }, { at: path });
        Transforms.unsetNodes(editor, ['parent', 'number', 'level']);
      }
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry);
  };

  e.toggleBlock = (format, props) => {
    if (![NUMBERED_LIST, BULLETED_LIST].includes(format)) {
      return toggleBlock(format, props);
    }

    if (!e.isBlockActive(format)) {
      const nodeProp = { type: LIST_ITEM, level: 0, parent: format };
      toggleList(e, format, nodeProp);
    } else {
      Transforms.unwrapNodes(editor, { match: (n) => n.type === format, split: true });
      Transforms.setNodes(editor, {
        type: PARAGRAPH,
      });

      // Remove other fields.
      Transforms.unsetNodes(editor, ['parent', 'level']);
    }
  };

  e.increaseItemDepth = () => {
    const block = Editor.above(e, {
      match: (n) => n.type === LIST_ITEM,
    });

    if (block) {
      const [node] = block;
      const { level = 0, parent } = node;

      Transforms.setNodes(
        e,
        { parent, level: Math.min(level + 1, 8) },
        { match: (n) => n.type === LIST_ITEM },
      );
    }
  };

  e.decreaseItemDepth = () => {
    const block = Editor.above(editor, {
      match: (n) => n.type === LIST_ITEM,
    });

    if (block) {
      const [node] = block;
      const { level = 0, parent } = node;

      Transforms.setNodes(
        editor,
        { parent, level: Math.max(level - 1, 0) },
        { match: (n) => n.type === LIST_ITEM },
      );
    }
  };

  return e;
};

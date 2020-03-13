import { Transforms, Editor, Point, Range, Element, Node } from 'tuture-slate';
import { LIST_ITEM, BULLETED_LIST, NUMBERED_LIST, PARAGRAPH } from 'editure-constants';

import { withBaseBlock } from './base-block';
import { getBeforeText } from '../utils';
import { detectShortcut } from '../shortcuts';
import { decreaseItemDepth } from '../helpers';

const shortcutRegexes: [string, RegExp[]][] = [
  [BULLETED_LIST, [/^\*$/, /^-$/, /^\+$/]],
  [NUMBERED_LIST, [/^[0-9]\.$/]]
];

export const withList = (editor: Editor) => {
  const e = withBaseBlock(editor);
  const { insertText, insertBreak, deleteBackward, normalizeNode, toggleBlock } = e;

  e.insertText = text => {
    const { selection } = e;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      for (const [format, regexes] of shortcutRegexes) {
        const matchArr = detectShortcut(e, regexes);

        if (matchArr) {
          Transforms.select(e, getBeforeText(e).range!);
          Transforms.delete(e);

          const nodeProp = { type: LIST_ITEM, level: 0, parent: format };
          return e.toggleBlock(format, nodeProp);
        }
      }

      return insertText(' ');
    }

    insertText(text);
  };

  e.insertBreak = () => {
    for (const format of [BULLETED_LIST, NUMBERED_LIST]) {
      if (e.isBlockActive(format)) {
        const { beforeText } = getBeforeText(e);

        // Exit the list if empty.
        if (!beforeText) {
          e.toggleBlock(format);
          Transforms.unsetNodes(editor, ['parent', 'number', 'level']);

          return;
        }

        return insertBreak();
      }
    }

    insertBreak();
  };

  e.deleteBackward = (...args) => {
    const { selection } = e;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(e, {
        match: n => n.type === LIST_ITEM
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(e, path);

        const parentAbove = Editor.above(e, {
          match: n => n.type === BULLETED_LIST || n.type === NUMBERED_LIST
        });

        if (
          block.type !== PARAGRAPH &&
          Point.equals(selection.anchor, start) &&
          parentAbove
        ) {
          const type = e.isBlockActive(BULLETED_LIST) ? BULLETED_LIST : NUMBERED_LIST;

          const block = Editor.above(e, {
            match: n => n.type === type
          });

          if (block) {
            const [node] = block;
            const { level = 0 } = node;

            if (level === 0) {
              Transforms.liftNodes(e, {
                match: n => n.type === LIST_ITEM
              });

              Transforms.setNodes(e, { type: PARAGRAPH });
              Transforms.unsetNodes(e, ['level', 'parent', 'number']);

              return;
            } else {
              decreaseItemDepth(e);

              return;
            }
          }
        } else if (block.type !== PARAGRAPH && Point.equals(selection.anchor, start)) {
          Transforms.setNodes(e, { type: PARAGRAPH });
          Transforms.unsetNodes(e, ['level', 'parent', 'number']);

          return;
        }
      }
    }

    deleteBackward(...args);
  };

  e.normalizeNode = entry => {
    const [node, path] = entry;

    if (!Element.isElement(node)) {
      return normalizeNode(entry);
    }

    if (node.type === BULLETED_LIST) {
      for (const [child, childPath] of Node.children(e, path)) {
        const { level = 0, children } = child;
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
        const { level = 0, children } = child;
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

        Transforms.setNodes(
          e,
          { level, parent: node.type, number: counter },
          { at: childPath }
        );

        lastLevel = level;

        // List item should not have any block child.
        if (children.length === 1 && Element.isElement(children[0])) {
          Transforms.unwrapNodes(e, { at: [...childPath, 0] });
        }
      }
      return;
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry);
  };

  e.toggleBlock = (format, props) => {
    const isActive = !!e.detectBlockFormat([BULLETED_LIST, NUMBERED_LIST]);
    if ([BULLETED_LIST, NUMBERED_LIST].includes(format)) {
      if (!isActive) {
        Transforms.setNodes(editor, {
          ...props,
          type: LIST_ITEM
        });

        const block = { type: format, children: [] };
        Transforms.wrapNodes(editor, block, props);
      } else {
        Transforms.unwrapNodes(editor, {
          match: n => [BULLETED_LIST, NUMBERED_LIST].includes(n.type),
          split: true
        });

        Transforms.setNodes(editor, {
          type: PARAGRAPH
        });

        Transforms.unsetNodes(editor, ['parent', 'number', 'level']);
      }

      return;
    }

    toggleBlock(format, props);
  };

  return e;
};

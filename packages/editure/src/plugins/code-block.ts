import { Transforms, Editor, Point, Range, Element, Node } from 'tuture-slate';
import { CODE_BLOCK, CODE_LINE, PARAGRAPH } from 'editure-constants';

import { withBaseContainer } from './base-container';
import { getLineText, getBeforeText } from '../utils';
import { detectShortcut } from '../shortcuts';

const shortcutRegexes = [/^\s*```\s*([a-zA-Z]*)$/];

export const withCodeBlock = (editor: Editor) => {
  const e = withBaseContainer(editor);
  const {
    insertText,
    insertBreak,
    deleteBackward,
    normalizeNode,
    getChildFormat,
    unwrapBlock,
    exitBlock
  } = e;

  e.insertText = text => {
    // Disable any shortcuts in code blocks.
    if (text === ' ' && e.isBlockActive(CODE_BLOCK)) {
      return Transforms.insertText(e, ' ');
    }

    insertText(text);
  };

  e.insertBreak = () => {
    const { selection } = e;

    if (selection && Range.isCollapsed(selection)) {
      const matchArr = detectShortcut(e, shortcutRegexes);

      if (matchArr) {
        if (e.isBlockActive(CODE_BLOCK)) {
          // Already in a code block.
          return insertBreak();
        }

        Transforms.select(e, getBeforeText(e).range!);
        Transforms.delete(e);

        return e.toggleBlock(CODE_BLOCK, { lang: matchArr[1] });
      }

      return insertBreak();
    }

    insertBreak();
  };

  e.deleteBackward = (...args) => {
    const { selection } = e;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(e, {
        match: n => n.type === CODE_BLOCK
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(e, path);

        if (
          block.type !== PARAGRAPH &&
          Point.equals(selection.anchor, start) &&
          e.isBlockActive(CODE_LINE)
        ) {
          const block = Editor.above(e, {
            match: n => n.type === CODE_BLOCK
          });

          if (block) {
            const [node] = block;

            const { wholeLineText } = getLineText(e);
            const { children = [] } = node;

            Editor.withoutNormalizing(e, () => {
              if (children.length === 1 && !wholeLineText) {
                e.toggleBlock(CODE_BLOCK);
              } else if (children.length > 1) {
                Transforms.mergeNodes(e);
              }
            });
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  e.normalizeNode = entry => {
    const [node, path] = entry;

    if (Element.isElement(node) && node.type === CODE_BLOCK) {
      for (const [child, childPath] of Node.children(e, path)) {
        if (Element.isElement(child) && child.type !== CODE_LINE) {
          Transforms.setNodes(e, { type: CODE_LINE }, { at: childPath });
        }
      }
      return;
    }

    normalizeNode(entry);
  };

  e.getChildFormat = format => {
    return format === CODE_BLOCK ? CODE_LINE : getChildFormat(format);
  };

  e.unwrapBlock = format => {
    if (format === CODE_BLOCK) {
      const block = Editor.above(editor, {
        match: n => n.type === CODE_BLOCK
      });

      if (block) {
        const [, path] = block;
        const anchor = Editor.start(editor, path);
        const focus = Editor.end(editor, path);
        const range = { anchor, focus };

        Transforms.setNodes(
          editor,
          { type: PARAGRAPH },
          {
            at: range,
            match: n => n.type === CODE_LINE
          }
        );
        Transforms.unwrapNodes(editor, {
          at: range,
          match: n => n.type === CODE_BLOCK
        });
      }

      return;
    }

    unwrapBlock(format);
  };

  e.exitBlock = format => {
    if (format === CODE_BLOCK) {
      Transforms.setNodes(
        editor,
        { type: PARAGRAPH },
        { match: n => n.type === CODE_LINE }
      );

      Transforms.unwrapNodes(editor, {
        match: n => n.type === CODE_BLOCK,
        split: true
      });

      return;
    }

    exitBlock(format);
  };

  return e;
};

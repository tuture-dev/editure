import { Transforms, Editor, Range, Element, Node, Point } from 'tuture-slate';
import { CODE_BLOCK, CODE_LINE, PARAGRAPH } from 'editure-constants';

import { EditorWithContainer } from './base-container';
import { getBeforeText, getLineText } from '../utils';
import { detectShortcut } from '../shortcuts';

const shortcutRegexes = [/^\s*```\s*([a-zA-Z]*)$/];

export const withCodeBlock = (editor: EditorWithContainer) => {
  const {
    insertText,
    insertBreak,
    deleteBackward,
    normalizeNode,
    getChildFormat,
    unwrapBlock,
    exitBlock,
    toggleBlock
  } = editor;

  editor.insertText = text => {
    // Disable any shortcuts in code blocks.
    if (text === ' ' && editor.isBlockActive(CODE_BLOCK)) {
      return Transforms.insertText(editor, ' ');
    }

    insertText(text);
  };

  editor.insertBreak = () => {
    const { selection } = editor;

    if (!selection) return;

    if (Range.isCollapsed(selection)) {
      const matchArr = detectShortcut(editor, shortcutRegexes);

      if (matchArr) {
        if (editor.isBlockActive(CODE_BLOCK)) {
          // Already in a code block.
          return insertBreak();
        }

        Transforms.select(editor, getBeforeText(editor).range!);
        Transforms.delete(editor);

        return editor.toggleBlock(CODE_BLOCK, { lang: matchArr[1] });
      }

      return insertBreak();
    }

    insertBreak();
  };

  editor.deleteBackward = unit => {
    const { selection } = editor;

    if (!selection) return;

    if (unit !== 'character') {
      return deleteBackward(unit);
    }

    const match = Editor.above(editor, {
      match: n => n.type === CODE_BLOCK
    });

    if (match) {
      const [block, path] = match;
      const start = Editor.start(editor, path);

      if (
        block.type !== PARAGRAPH &&
        Point.equals(selection.anchor, start) &&
        editor.isBlockActive(editor.getChildFormat(CODE_BLOCK))
      ) {
        const { wholeLineText } = getLineText(editor);
        const { children = [] } = block;

        Editor.withoutNormalizing(editor, () => {
          if (children.length === 1 && !wholeLineText) {
            editor.toggleBlock(CODE_BLOCK);
          } else if (children.length > 1) {
            Transforms.mergeNodes(editor);
          }
        });

        return;
      }

      return deleteBackward(unit);
    }

    deleteBackward(unit);
  };

  editor.normalizeNode = entry => {
    const [node, path] = entry;

    if (Element.isElement(node) && node.type === CODE_BLOCK) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && child.type !== CODE_LINE) {
          Transforms.setNodes(editor, { type: CODE_LINE }, { at: childPath });
        }
      }
      return;
    }

    normalizeNode(entry);
  };

  editor.getChildFormat = format => {
    return format === CODE_BLOCK ? CODE_LINE : getChildFormat(format);
  };

  editor.unwrapBlock = format => {
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

  editor.exitBlock = format => {
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

  editor.toggleBlock = (format, props?) => {
    if (format === CODE_BLOCK) {
      return Editor.withoutNormalizing(editor, () => {
        const isActive = editor.isBlockActive(format);

        if (isActive) {
          editor.unwrapBlock(format);
        } else {
          editor.wrapBlock(format, props);
        }
      });
    }

    toggleBlock(format, props);
  };

  return editor;
};

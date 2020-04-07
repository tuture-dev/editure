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
    toggleBlock,
  } = editor;

  editor.insertText = (text) => {
    // Disable any shortcuts in code blocks.
    if (text === ' ' && editor.isBlockActive(CODE_BLOCK)) {
      return Transforms.insertText(editor, ' ');
    }

    insertText(text);
  };

  editor.insertBreak = () => {
    if (editor.isBlockActive(CODE_BLOCK)) {
      // Disable any shortcuts in a code block.
      return Transforms.splitNodes(editor, { always: true });
    }

    if (Range.isCollapsed(editor.selection!)) {
      const matchArr = detectShortcut(editor, shortcutRegexes);

      if (matchArr) {
        Transforms.select(editor, getBeforeText(editor).range!);
        Transforms.delete(editor);

        return editor.toggleBlock(CODE_BLOCK, { lang: matchArr[1] });
      }

      return insertBreak();
    }

    insertBreak();
  };

  editor.deleteBackward = (unit) => {
    if (unit !== 'character') {
      return deleteBackward(unit);
    }

    const match = Editor.above(editor, {
      match: (n) => n.type === CODE_BLOCK,
    });

    if (match) {
      const { beforeText } = getBeforeText(editor);

      if (beforeText) {
        return deleteBackward('character');
      }

      const [block] = match;
      const { wholeLineText } = getLineText(editor);
      const { children } = block;

      if (children.length === 1 && !wholeLineText) {
        editor.toggleBlock(CODE_BLOCK);
      } else {
        Transforms.mergeNodes(editor);
      }

      return;
    }

    deleteBackward(unit);
  };

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (Element.isElement(node) && node.type === CODE_BLOCK) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && child.type !== CODE_LINE) {
          Transforms.setNodes(editor, { type: CODE_LINE }, { at: childPath });
        }
      }
      return;
    }

    if (Element.isElement(node) && node.type === CODE_LINE) {
      const parent = Editor.parent(editor, path);
      if (parent[0].type !== CODE_BLOCK) {
        Transforms.setNodes(editor, { type: PARAGRAPH }, { at: path });
      }
    }

    normalizeNode(entry);
  };

  editor.getChildFormat = (format) => {
    return format === CODE_BLOCK ? CODE_LINE : getChildFormat(format);
  };

  editor.unwrapBlock = (format) => {
    if (format !== CODE_BLOCK) {
      return unwrapBlock(format);
    }

    const block = Editor.above(editor, {
      match: (n) => n.type === CODE_BLOCK,
    });

    if (block) {
      const [, path] = block;
      const anchor = Editor.start(editor, path);
      const focus = Editor.end(editor, path);
      const range = { anchor, focus };

      Editor.withoutNormalizing(editor, () => {
        Transforms.setNodes(
          editor,
          { type: PARAGRAPH },
          {
            at: range,
            match: (n) => n.type === CODE_LINE,
          },
        );

        Transforms.unwrapNodes(editor, {
          at: range,
          match: (n) => n.type === CODE_BLOCK,
        });
      });
    }
  };

  editor.exitBlock = (format) => {
    if (format !== CODE_BLOCK) {
      return exitBlock(format);
    }

    Editor.withoutNormalizing(editor, () => {
      Transforms.setNodes(editor, { type: PARAGRAPH }, { match: (n) => n.type === CODE_LINE });

      Transforms.unwrapNodes(editor, {
        match: (n) => n.type === CODE_BLOCK,
        split: true,
      });
    });
  };

  editor.toggleBlock = (format, props?) => {
    if (format !== CODE_BLOCK) {
      return toggleBlock(format, props);
    }

    if (editor.isBlockActive(format)) {
      editor.unwrapBlock(format);
    } else {
      editor.wrapBlock(format, props);
    }
  };

  return editor;
};

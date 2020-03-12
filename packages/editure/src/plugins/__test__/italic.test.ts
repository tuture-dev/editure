import { createEditor, Editor, Transforms, Range } from 'tuture-slate';
import * as F from 'editure-constants';

import { withItalic } from '../italic';
import { reset, inputText } from './utils';

describe('withItalic', () => {
  const editor = withItalic(createEditor());
  reset(editor);

  afterEach(() => reset(editor));

  describe('insertText', () => {
    test('regular (syntax 1)', () => {
      inputText(editor, '*italic* ');

      const nodes = [
        { type: F.PARAGRAPH, children: [{ text: 'italic', italic: true }, { text: ' ' }] }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(Editor.marks(editor)).toStrictEqual({});
    });

    test('regular (syntax 2)', () => {
      inputText(editor, '_italic_ ');

      const nodes = [
        { type: F.PARAGRAPH, children: [{ text: 'italic', italic: true }, { text: ' ' }] }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(Editor.marks(editor)).toStrictEqual({});
    });

    test('end of a sentence', () => {
      inputText(editor, 'foo *bar* ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo ' }, { text: 'bar', italic: true }, { text: ' ' }]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(Editor.marks(editor)).toStrictEqual({});
    });

    test('start of a sentence', () => {
      editor.children = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo' }]
        }
      ];

      const point = { path: [0, 0], offset: 0 };
      Transforms.select(editor, point);
      inputText(editor, '*bar* ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'bar', italic: true }, { text: ' foo' }]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(Editor.marks(editor)).toStrictEqual({});
    });

    test('middle of a sentence', () => {
      editor.children = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo bar' }]
        }
      ];

      const point = { path: [0, 0], offset: 4 };
      Transforms.select(editor, point);
      inputText(editor, '*baz* ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo ' }, { text: 'baz', italic: true }, { text: ' bar' }]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(Editor.marks(editor)).toStrictEqual({});
    });
  });
});

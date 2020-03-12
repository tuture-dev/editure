import { createEditor, Editor, Transforms, Range } from 'tuture-slate';
import * as F from 'editure-constants';

import withBold from '../bold';
import { reset, inputText } from './utils';

describe('withBold', () => {
  const editor = withBold(createEditor());
  reset(editor);

  afterEach(() => reset(editor));

  describe('insertText', () => {
    test('regular (syntax 1)', () => {
      inputText(editor, '**bold** ');

      const nodes = [
        { type: F.PARAGRAPH, children: [{ text: 'bold', bold: true }, { text: ' ' }] }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(Editor.marks(editor)).toStrictEqual({});
    });

    test('regular (syntax 2)', () => {
      inputText(editor, '__bold__ ');

      const nodes = [
        { type: F.PARAGRAPH, children: [{ text: 'bold', bold: true }, { text: ' ' }] }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(Editor.marks(editor)).toStrictEqual({});
    });

    test('end of a sentence', () => {
      inputText(editor, 'foo **bar** ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo ' }, { text: 'bar', bold: true }, { text: ' ' }]
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
      inputText(editor, '**bar** ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'bar', bold: true }, { text: ' foo' }]
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
      inputText(editor, '**baz** ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo ' }, { text: 'baz', bold: true }, { text: ' bar' }]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(Editor.marks(editor)).toStrictEqual({});
    });
  });
});

import { createEditor, Transforms, Range } from 'tuture-slate';
import * as F from 'editure-constants';

import withInlineCode from '../inline-code';
import { reset, inputText } from './utils';

describe('withInlineCode', () => {
  const editor = withInlineCode(createEditor());
  reset(editor);

  afterEach(() => reset(editor));

  describe('insertText', () => {
    test('regular', () => {
      inputText(editor, '`code` ');

      const nodes = [
        { type: F.PARAGRAPH, children: [{ text: 'code', code: true }, { text: ' ' }] }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(editor.marks).toBe(null);
    });

    test('end of a sentence', () => {
      inputText(editor, 'foo `bar` ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo ' }, { text: 'bar', code: true }, { text: ' ' }]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(editor.marks).toBe(null);
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
      inputText(editor, '`bar` ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'bar', code: true }, { text: ' foo' }]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(editor.marks).toBe(null);
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
      inputText(editor, '`baz` ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo ' }, { text: 'baz', code: true }, { text: ' bar' }]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(editor.marks).toBe(null);
    });
  });
});

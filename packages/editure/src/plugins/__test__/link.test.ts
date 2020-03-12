import { createEditor, Editor, Transforms, Range } from 'tuture-slate';
import * as F from 'editure-constants';

import { withLink } from '../link';
import { reset, inputText } from './utils';

describe('withInlineCode', () => {
  const editor = withLink(createEditor());
  reset(editor);

  afterEach(() => reset(editor));

  describe('insertText', () => {
    test('regular', () => {
      inputText(editor, '[foo](https://test.com) ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo', link: true, url: 'https://test.com' }, { text: ' ' }]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(Editor.marks(editor)).toStrictEqual({});
    });

    test('end of a sentence', () => {
      inputText(editor, 'foo [bar](https://test.com) ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [
            { text: 'foo ' },
            { text: 'bar', link: true, url: 'https://test.com' },
            { text: ' ' }
          ]
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
      inputText(editor, '[bar](https://test.com) ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [
            { text: 'bar', link: true, url: 'https://test.com' },
            { text: ' foo' }
          ]
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
      inputText(editor, '[baz](https://test.com) ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [
            { text: 'foo ' },
            { text: 'baz', link: true, url: 'https://test.com' },
            { text: ' bar' }
          ]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(Editor.marks(editor)).toStrictEqual({});
    });
  });
});

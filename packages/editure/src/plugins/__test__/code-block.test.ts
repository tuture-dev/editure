import { Transforms, Editor, Range } from 'tuture-slate';
import * as F from 'editure-constants';

import { withCodeBlock } from '../code-block';
import { withBold } from '../bold';
import { configureEditor, reset, inputText, deleteNTimes } from './utils';

describe('withCodeBlock', () => {
  const editor = configureEditor({ marks: [withBold], containers: [withCodeBlock] });
  reset(editor);

  afterEach(() => reset(editor));

  describe('insertText', () => {
    test('should disable any shortcuts', () => {
      inputText(editor, '```\nfoo **bar** ');

      const nodes = [
        {
          type: F.CODE_BLOCK,
          lang: '',
          children: [{ type: F.CODE_LINE, children: [{ text: 'foo **bar** ' }] }]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });
  });

  describe('insertBreak', () => {
    test('regular code block', () => {
      inputText(editor, '```\nconst a = 1;\nconsole.log("hello");');

      const nodes = [
        {
          type: F.CODE_BLOCK,
          lang: '',
          children: [
            { type: F.CODE_LINE, children: [{ text: 'const a = 1;' }] },
            { type: F.CODE_LINE, children: [{ text: 'console.log("hello");' }] }
          ]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('regular code block with lang', () => {
      inputText(editor, '```js\nconst a = 1;\nconsole.log("hello");');

      const nodes = [
        {
          type: F.CODE_BLOCK,
          lang: 'js',
          children: [
            { type: F.CODE_LINE, children: [{ text: 'const a = 1;' }] },
            { type: F.CODE_LINE, children: [{ text: 'console.log("hello");' }] }
          ]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('regular code block with lang (edge case with extra spaces)', () => {
      inputText(editor, '   ```  js\nconst a = 1;\nconsole.log("hello");');

      const nodes = [
        {
          type: F.CODE_BLOCK,
          lang: 'js',
          children: [
            { type: F.CODE_LINE, children: [{ text: 'const a = 1;' }] },
            { type: F.CODE_LINE, children: [{ text: 'console.log("hello");' }] }
          ]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('already in a code block', () => {
      inputText(editor, '```typescript\nfoo bar\n```\nbaz');

      const nodes = [
        {
          type: F.CODE_BLOCK,
          lang: 'typescript',
          children: [
            { type: F.CODE_LINE, children: [{ text: 'foo bar' }] },
            { type: F.CODE_LINE, children: [{ text: '```' }] },
            { type: F.CODE_LINE, children: [{ text: 'baz' }] }
          ]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('range not collapsed', () => {
      inputText(editor, '```');

      const path = [0, 0];
      Transforms.select(editor, {
        anchor: { path, offset: 2 },
        focus: { path, offset: 3 }
      });
      editor.insertBreak();

      const nodes = [
        { type: F.PARAGRAPH, children: [{ text: '``' }] },
        { type: F.PARAGRAPH, children: [{ text: '' }] }
      ];

      expect(editor.children).toStrictEqual(nodes);
    });
  });

  describe('deleteBackward', () => {
    test('delete by character (single paragraph)', () => {
      inputText(editor, '```js\nfoo bar');

      deleteNTimes(editor, 4);
      expect(editor.children).toStrictEqual([
        {
          type: F.CODE_BLOCK,
          lang: 'js',
          children: [{ type: F.CODE_LINE, children: [{ text: 'foo' }] }]
        }
      ]);

      deleteNTimes(editor, 3);
      expect(editor.children).toStrictEqual([
        {
          type: F.CODE_BLOCK,
          lang: 'js',
          children: [{ type: F.CODE_LINE, children: [{ text: '' }] }]
        }
      ]);

      deleteNTimes(editor, 1);
      expect(editor.children).toStrictEqual([
        {
          type: F.PARAGRAPH,
          children: [{ text: '' }]
        }
      ]);
    });

    test('delete by character (multiple paragraphs)', () => {
      inputText(editor, 'test\n```js\nfoo bar');

      deleteNTimes(editor, 4);
      expect(editor.children).toStrictEqual([
        {
          type: F.PARAGRAPH,
          children: [{ text: 'test' }]
        },
        {
          type: F.CODE_BLOCK,
          lang: 'js',
          children: [{ type: F.CODE_LINE, children: [{ text: 'foo' }] }]
        }
      ]);

      deleteNTimes(editor, 3);
      expect(editor.children).toStrictEqual([
        {
          type: F.PARAGRAPH,
          children: [{ text: 'test' }]
        },
        {
          type: F.CODE_BLOCK,
          lang: 'js',
          children: [{ type: F.CODE_LINE, children: [{ text: '' }] }]
        }
      ]);

      deleteNTimes(editor, 1);
      expect(editor.children).toStrictEqual([
        {
          type: F.PARAGRAPH,
          children: [{ text: 'test' }]
        },
        {
          type: F.PARAGRAPH,
          children: [{ text: '' }]
        }
      ]);
    });

    test('delete by line', () => {
      inputText(editor, '```js\nfoo bar');
      editor.deleteBackward('line');

      expect(editor.children).toStrictEqual([
        {
          type: F.CODE_BLOCK,
          lang: 'js',
          children: [{ type: F.CODE_LINE, children: [{ text: '' }] }]
        }
      ]);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });
  });

  describe('normalizeNode', () => {
    test('validate children of code blocks', () => {
      editor.children = [
        {
          type: F.CODE_BLOCK,
          lang: 'js',
          children: [{ children: [{ text: 'foo' }] }, { children: [{ text: 'bar' }] }]
        }
      ];

      Editor.normalize(editor, { force: true });

      const nodes = [
        {
          type: F.CODE_BLOCK,
          lang: 'js',
          children: [
            { type: F.CODE_LINE, children: [{ text: 'foo' }] },
            { type: F.CODE_LINE, children: [{ text: 'bar' }] }
          ]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
    });
  });
});

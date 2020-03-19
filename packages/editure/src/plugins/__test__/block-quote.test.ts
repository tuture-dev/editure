import { Range } from 'tuture-slate';
import * as F from 'editure-constants';

import { EditorWithContainer } from '../base-container';
import { withBlockquote } from '../block-quote';
import { configureEditor, reset, inputText, deleteNTimes } from './utils';

describe('withBlockquote', () => {
  const editor = configureEditor({ containers: [withBlockquote] }) as EditorWithContainer;
  reset(editor);

  afterEach(() => reset(editor));

  describe('insertText', () => {
    test('block quote with single paragraph', () => {
      inputText(editor, '> test');

      const nodes = [
        {
          type: F.BLOCK_QUOTE,
          children: [{ type: F.PARAGRAPH, children: [{ text: 'test' }] }]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });
  });

  test('block quote with multiple paragraphs', () => {
    inputText(editor, '> foo\nbar');

    const nodes = [
      {
        type: F.BLOCK_QUOTE,
        children: [
          { type: F.PARAGRAPH, children: [{ text: 'foo' }] },
          { type: F.PARAGRAPH, children: [{ text: 'bar' }] }
        ]
      }
    ];

    expect(editor.children).toStrictEqual(nodes);
    expect(Range.isCollapsed(editor.selection!)).toBe(true);
  });

  describe('insertBreak', () => {
    test('should exit if last line is empty', () => {
      inputText(editor, '> foo');

      editor.insertBreak();
      expect(editor.children).toStrictEqual([
        {
          type: F.BLOCK_QUOTE,
          children: [
            { type: F.PARAGRAPH, children: [{ text: 'foo' }] },
            { type: F.PARAGRAPH, children: [{ text: '' }] }
          ]
        }
      ]);

      editor.insertBreak();
      expect(editor.children).toStrictEqual([
        {
          type: F.BLOCK_QUOTE,
          children: [{ type: F.PARAGRAPH, children: [{ text: 'foo' }] }]
        },
        { type: F.PARAGRAPH, children: [{ text: '' }] }
      ]);
    });
  });

  describe('deleteBackward', () => {
    test('delete by character', () => {
      inputText(editor, '> foo');

      deleteNTimes(editor, 2);
      expect(editor.children).toStrictEqual([
        {
          type: F.BLOCK_QUOTE,
          children: [{ type: F.PARAGRAPH, children: [{ text: 'f' }] }]
        }
      ]);

      deleteNTimes(editor, 1);
      expect(editor.children).toStrictEqual([
        {
          type: F.BLOCK_QUOTE,
          children: [{ type: F.PARAGRAPH, children: [{ text: '' }] }]
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

    test('delete by line', () => {
      inputText(editor, '> foo');
      editor.deleteBackward('line');

      expect(editor.children).toStrictEqual([
        {
          type: F.BLOCK_QUOTE,
          children: [{ type: F.PARAGRAPH, children: [{ text: '' }] }]
        }
      ]);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });
  });
});

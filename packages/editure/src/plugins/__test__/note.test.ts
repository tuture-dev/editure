import { createEditor, Range } from 'tuture-slate';
import * as F from 'editure-constants';

import withNote from '../note';
import { withBold } from '../bold';
import { reset, inputText, deleteNTimes } from './utils';

describe('withNote', () => {
  const editor = withNote(withBold(createEditor()));
  reset(editor);

  afterEach(() => reset(editor));

  describe('insertBreak', () => {
    test('regular note', () => {
      inputText(editor, ':::\nfoo\nbar');

      const nodes = [
        {
          type: F.NOTE,
          level: '',
          children: [
            { type: F.PARAGRAPH, children: [{ text: 'foo' }] },
            { type: F.PARAGRAPH, children: [{ text: 'bar' }] }
          ]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('regular note with level', () => {
      inputText(editor, '::: warning\nfoo\nbar');

      const nodes = [
        {
          type: F.NOTE,
          level: 'warning',
          children: [
            { type: F.PARAGRAPH, children: [{ text: 'foo' }] },
            { type: F.PARAGRAPH, children: [{ text: 'bar' }] }
          ]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('regular note with level (edge case with extra spaces)', () => {
      inputText(editor, '   :::  danger\nfoo\nbar');

      const nodes = [
        {
          type: F.NOTE,
          level: 'danger',
          children: [
            { type: F.PARAGRAPH, children: [{ text: 'foo' }] },
            { type: F.PARAGRAPH, children: [{ text: 'bar' }] }
          ]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('already in a note', () => {
      inputText(editor, ':::\nfoo bar\n:::\nbaz');

      const nodes = [
        {
          type: F.NOTE,
          level: '',
          children: [
            { type: F.PARAGRAPH, children: [{ text: 'foo bar' }] },
            { type: F.PARAGRAPH, children: [{ text: ':::' }] },
            { type: F.PARAGRAPH, children: [{ text: 'baz' }] }
          ]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });
  });

  describe('deleteBackward', () => {
    test('delete by character', () => {
      inputText(editor, '::: info\nfoo bar');

      deleteNTimes(editor, 4);
      expect(editor.children).toStrictEqual([
        {
          type: F.NOTE,
          level: 'info',
          children: [{ type: F.PARAGRAPH, children: [{ text: 'foo' }] }]
        }
      ]);

      deleteNTimes(editor, 3);
      expect(editor.children).toStrictEqual([
        {
          type: F.NOTE,
          level: 'info',
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
      inputText(editor, '::: info\nfoo bar');
      editor.deleteBackward('line');

      expect(editor.children).toStrictEqual([
        {
          type: F.NOTE,
          level: 'info',
          children: [{ type: F.PARAGRAPH, children: [{ text: '' }] }]
        }
      ]);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });
  });
});

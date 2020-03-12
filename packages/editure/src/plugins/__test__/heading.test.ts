import { createEditor, Transforms, Range } from 'tuture-slate';
import * as F from 'editure-constants';

import withHeading from '../heading';
import { withBold } from '../bold';
import { reset, inputText, deleteNTimes } from './utils';

describe('withHeading', () => {
  const editor = withHeading(withBold(createEditor()));
  reset(editor);

  afterEach(() => reset(editor));

  describe('insertText', () => {
    test('h1', () => {
      inputText(editor, '# test');

      const nodes = [
        {
          type: F.H1,
          children: [{ text: 'test' }]
        }
      ];

      expect(editor.children[0].id).toBeTruthy();
      expect(editor.children).toMatchObject(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('h2', () => {
      inputText(editor, '## test');

      const nodes = [
        {
          type: F.H2,
          children: [{ text: 'test' }]
        }
      ];

      expect(editor.children[0].id).toBeTruthy();
      expect(editor.children).toMatchObject(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('h3', () => {
      inputText(editor, '### test');

      const nodes = [
        {
          type: F.H3,
          children: [{ text: 'test' }]
        }
      ];

      expect(editor.children[0].id).toBeTruthy();
      expect(editor.children).toMatchObject(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('h4', () => {
      inputText(editor, '#### test');

      const nodes = [
        {
          type: F.H4,
          children: [{ text: 'test' }]
        }
      ];

      expect(editor.children[0].id).toBeTruthy();
      expect(editor.children).toMatchObject(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('h5', () => {
      inputText(editor, '##### test');

      const nodes = [
        {
          type: F.H5,
          children: [{ text: 'test' }]
        }
      ];

      expect(editor.children[0].id).toBeTruthy();
      expect(editor.children).toMatchObject(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('h6', () => {
      inputText(editor, '###### test');

      const nodes = [
        {
          type: F.H6,
          children: [{ text: 'test' }]
        }
      ];

      expect(editor.children[0].id).toBeTruthy();
      expect(editor.children).toMatchObject(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('edge case (spaces before #)', () => {
      inputText(editor, '   ## test');

      const nodes = [
        {
          type: F.H2,
          children: [{ text: 'test' }]
        }
      ];

      expect(editor.children[0].id).toBeTruthy();
      expect(editor.children).toMatchObject(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('heading with marks', () => {
      inputText(editor, '## foo **bar** ');

      const nodes = [
        {
          type: F.H2,
          children: [{ text: 'foo ' }, { text: 'bar', bold: true }, { text: ' ' }]
        }
      ];

      expect(editor.children[0].id).toBeTruthy();
      expect(editor.children).toMatchObject(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });
  });

  describe('insertBreak', () => {
    test('toggle heading after insertBreak', () => {
      inputText(editor, '## test\n');

      const nodes = [
        {
          type: F.H2,
          children: [{ text: 'test' }]
        },
        {
          type: F.PARAGRAPH,
          children: [{ text: '' }]
        }
      ];

      expect(editor.children).toMatchObject(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(editor.selection!.anchor).toStrictEqual({ path: [1, 0], offset: 0 });
    });
  });

  describe('deleteBackward', () => {
    describe('delete by character', () => {
      test('from the end', () => {
        inputText(editor, '# test');

        deleteNTimes(editor, 3);
        expect(editor.children).toMatchObject([
          { type: F.H1, children: [{ text: 't' }] }
        ]);

        deleteNTimes(editor, 1);
        expect(editor.children).toMatchObject([{ type: F.H1, children: [{ text: '' }] }]);

        deleteNTimes(editor, 1);
        expect(editor.children).toMatchObject([
          { type: F.PARAGRAPH, children: [{ text: '' }] }
        ]);
      });

      test('from the middle and beginning', () => {
        inputText(editor, '# test');

        Transforms.select(editor, { path: [0, 0], offset: 1 });

        // Delete from the middle.
        deleteNTimes(editor, 1);
        expect(editor.children).toMatchObject([
          { type: F.H1, children: [{ text: 'est' }] }
        ]);

        // Delete from the beginning.
        deleteNTimes(editor, 1);
        expect(editor.children).toMatchObject([
          { type: F.PARAGRAPH, children: [{ text: 'est' }] }
        ]);
      });
    });

    describe('delete by line', () => {
      test('from the end', () => {
        inputText(editor, '# test');

        editor.deleteBackward('line');

        const nodes = [
          {
            type: F.H1,
            children: [{ text: '' }]
          }
        ];

        expect(editor.children).toMatchObject(nodes);
        expect(Range.isCollapsed(editor.selection!)).toBe(true);
      });

      test('from the middle', () => {
        inputText(editor, '# test');

        Transforms.select(editor, { path: [0, 0], offset: 2 });
        editor.deleteBackward('line');

        const nodes = [
          {
            type: F.H1,
            children: [{ text: 'st' }]
          }
        ];

        expect(editor.children).toMatchObject(nodes);
        expect(Range.isCollapsed(editor.selection!)).toBe(true);
      });
    });
  });
});

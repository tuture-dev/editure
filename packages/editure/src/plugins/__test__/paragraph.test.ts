import { Editor, Transforms } from 'tuture-slate';
import * as F from 'editure-constants';

import { withBold } from '../bold';
import { configureEditor, reset, inputText, deleteNTimes } from './utils';

describe('withParagraph', () => {
  const editor = configureEditor({ marks: [withBold] });
  reset(editor);

  afterEach(() => reset(editor));

  describe('insertText', () => {
    test('regular', () => {
      inputText(editor, 'foo bar');

      const nodes = [{ type: F.PARAGRAPH, children: [{ text: 'foo bar' }] }];

      expect(editor.children).toStrictEqual(nodes);
    });

    test('insert within marks', () => {
      inputText(editor, 'foo **bar** baz');

      Transforms.select(editor, { path: [0, 1], offset: 1 });

      inputText(editor, 'test');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo ' }, { text: 'btestar', bold: true }, { text: ' baz' }],
        },
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Editor.marks(editor)).toStrictEqual({ bold: true });
    });
  });

  describe('deleteBackward', () => {
    describe('delete by character', () => {
      test('from the end of single paragraph', () => {
        inputText(editor, 'foo bar');

        deleteNTimes(editor, 4);
        expect(editor.children).toStrictEqual([{ type: F.PARAGRAPH, children: [{ text: 'foo' }] }]);

        deleteNTimes(editor, 3);
        expect(editor.children).toStrictEqual([{ type: F.PARAGRAPH, children: [{ text: '' }] }]);

        deleteNTimes(editor, 1);
        expect(editor.children).toStrictEqual([{ type: F.PARAGRAPH, children: [{ text: '' }] }]);
      });

      test('from the end of single paragraph with marks', () => {
        inputText(editor, 'foo **bar** baz');

        deleteNTimes(editor, 5);
        expect(editor.children).toStrictEqual([
          { type: F.PARAGRAPH, children: [{ text: 'foo ' }, { text: 'ba', bold: true }] },
        ]);
        expect(Editor.marks(editor)).toStrictEqual({ bold: true });

        deleteNTimes(editor, 3);
        expect(editor.children).toStrictEqual([{ type: F.PARAGRAPH, children: [{ text: 'foo' }] }]);
        expect(Editor.marks(editor)).toStrictEqual({});
      });
    });

    describe('delete by line', () => {
      describe('single paragraph', () => {
        test('from the end', () => {
          inputText(editor, 'foo bar');

          editor.deleteBackward('line');
          expect(editor.children).toStrictEqual([{ type: F.PARAGRAPH, children: [{ text: '' }] }]);
        });

        test('from the middle', () => {
          inputText(editor, 'foo bar');

          Transforms.select(editor, { path: [0, 0], offset: 4 });
          editor.deleteBackward('line');
          expect(editor.children).toStrictEqual([
            { type: F.PARAGRAPH, children: [{ text: 'bar' }] },
          ]);
        });
      });

      describe('single paragraph with marks', () => {
        test('from the end', () => {
          inputText(editor, 'foo **bar** baz');

          editor.deleteBackward('line');
          expect(editor.children).toStrictEqual([{ type: F.PARAGRAPH, children: [{ text: '' }] }]);
        });

        test('from the middle', () => {
          inputText(editor, 'foo **bar** baz');

          Transforms.select(editor, { path: [0, 1], offset: 2 });
          editor.deleteBackward('line');
          expect(editor.children).toStrictEqual([
            { type: F.PARAGRAPH, children: [{ text: 'r', bold: true }, { text: ' baz' }] },
          ]);
          expect(Editor.marks(editor)).toStrictEqual({ bold: true });
        });
      });

      describe('multiple paragraphs', () => {
        test('from the end', () => {
          inputText(editor, 'First line\nSecond line\nThird line');

          Transforms.select(editor, { path: [1, 0], offset: 11 });
          editor.deleteBackward('line');
          expect(editor.children).toStrictEqual([
            { type: F.PARAGRAPH, children: [{ text: 'First line' }] },
            { type: F.PARAGRAPH, children: [{ text: '' }] },
            { type: F.PARAGRAPH, children: [{ text: 'Third line' }] },
          ]);
        });

        test('from the middle', () => {
          inputText(editor, 'First line\nSecond line\nThird line');

          Transforms.select(editor, { path: [1, 0], offset: 7 });
          editor.deleteBackward('line');
          expect(editor.children).toStrictEqual([
            { type: F.PARAGRAPH, children: [{ text: 'First line' }] },
            { type: F.PARAGRAPH, children: [{ text: 'line' }] },
            { type: F.PARAGRAPH, children: [{ text: 'Third line' }] },
          ]);
        });
      });

      describe('multiple paragraphs with marks', () => {
        test('from the end', () => {
          inputText(editor, '**First** line\n**Second** line\n**Third** line');

          Transforms.select(editor, { path: [1, 1], offset: 5 });
          editor.deleteBackward('line');
          expect(editor.children).toStrictEqual([
            {
              type: F.PARAGRAPH,
              children: [{ text: 'First', bold: true }, { text: ' line' }],
            },
            { type: F.PARAGRAPH, children: [{ text: '' }] },
            {
              type: F.PARAGRAPH,
              children: [{ text: 'Third', bold: true }, { text: ' line' }],
            },
          ]);
        });

        test('from the middle', () => {
          inputText(editor, '**First** line\n**Second** line\n**Third** line');

          Transforms.select(editor, { path: [1, 0], offset: 3 });
          editor.deleteBackward('line');
          expect(editor.children).toStrictEqual([
            {
              type: F.PARAGRAPH,
              children: [{ text: 'First', bold: true }, { text: ' line' }],
            },
            {
              type: F.PARAGRAPH,
              children: [{ text: 'ond', bold: true }, { text: ' line' }],
            },
            {
              type: F.PARAGRAPH,
              children: [{ text: 'Third', bold: true }, { text: ' line' }],
            },
          ]);
        });
      });
    });
  });

  describe('normalizeNode', () => {
    test('normalize elements without type', () => {
      editor.children = [{ children: [{ text: 'foo ' }] }];
      Editor.normalize(editor, { force: true });

      const nodes = [{ type: F.PARAGRAPH, children: [{ text: 'foo ' }] }];

      expect(editor.children).toStrictEqual(nodes);
    });

    test('normalize invalid children', () => {
      editor.children = [
        {
          type: F.PARAGRAPH,
          children: [{ type: F.PARAGRAPH, children: [{ text: 'foo ' }] }],
        },
      ];
      Editor.normalize(editor, { force: true });

      const nodes = [{ type: F.PARAGRAPH, children: [{ text: 'foo ' }] }];

      expect(editor.children).toStrictEqual(nodes);
    });
  });
});

import { Transforms, Range } from 'tuture-slate';
import * as F from 'editure-constants';

import { EditorWithContainer } from '../base-container';
import { withBlockquote } from '../block-quote';
import {
  configureEditor,
  createEditorWithContainer,
  reset,
  inputText,
  deleteNTimes,
} from './utils';

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
          children: [{ type: F.PARAGRAPH, children: [{ text: 'test' }] }],
        },
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('block quote with multiple paragraphs', () => {
      inputText(editor, '> foo\nbar');

      const nodes = [
        {
          type: F.BLOCK_QUOTE,
          children: [
            { type: F.PARAGRAPH, children: [{ text: 'foo' }] },
            { type: F.PARAGRAPH, children: [{ text: 'bar' }] },
          ],
        },
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('should not toggle when in a blockquote already', () => {
      inputText(editor, '> > ');

      const nodes = [
        {
          type: F.BLOCK_QUOTE,
          children: [{ type: F.PARAGRAPH, children: [{ text: '> ' }] }],
        },
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('should not interfere with regular space inserting', () => {
      inputText(editor, '*test* ');

      const nodes = [{ type: F.PARAGRAPH, children: [{ text: '*test* ' }] }];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });
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
            { type: F.PARAGRAPH, children: [{ text: '' }] },
          ],
        },
      ]);

      editor.insertBreak();
      expect(editor.children).toStrictEqual([
        {
          type: F.BLOCK_QUOTE,
          children: [{ type: F.PARAGRAPH, children: [{ text: 'foo' }] }],
        },
        { type: F.PARAGRAPH, children: [{ text: '' }] },
      ]);
    });

    test('should not interfere with regular break', () => {
      inputText(editor, 'foo\nbar');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo' }],
        },
        {
          type: F.PARAGRAPH,
          children: [{ text: 'bar' }],
        },
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('should call insertBreak in a list within a blockquote', () => {
      const baseEditor = createEditorWithContainer();
      const insertBreakSpy = jest.spyOn(baseEditor, 'insertBreak');

      const blockquoteEditor = withBlockquote(baseEditor);

      blockquoteEditor.children = [
        {
          type: F.BLOCK_QUOTE,
          children: [
            { type: F.BULLETED_LIST, children: [{ type: F.LIST_ITEM, children: [{ text: '' }] }] },
          ],
        },
      ];

      Transforms.select(blockquoteEditor, { path: [0, 0, 0], offset: 0 });
      blockquoteEditor.insertBreak();

      expect(insertBreakSpy).toBeCalled();
    });
  });

  describe('deleteBackward', () => {
    test('delete by character', () => {
      inputText(editor, '> foo');

      deleteNTimes(editor, 2);
      expect(editor.children).toStrictEqual([
        {
          type: F.BLOCK_QUOTE,
          children: [{ type: F.PARAGRAPH, children: [{ text: 'f' }] }],
        },
      ]);

      deleteNTimes(editor, 1);
      expect(editor.children).toStrictEqual([
        {
          type: F.BLOCK_QUOTE,
          children: [{ type: F.PARAGRAPH, children: [{ text: '' }] }],
        },
      ]);

      deleteNTimes(editor, 1);
      expect(editor.children).toStrictEqual([
        {
          type: F.PARAGRAPH,
          children: [{ text: '' }],
        },
      ]);
    });

    test('delete by character from middle', () => {
      inputText(editor, '> foo');
      Transforms.select(editor, { path: [0, 0, 0], offset: 1 });

      deleteNTimes(editor, 1);
      expect(editor.children).toStrictEqual([
        {
          type: F.BLOCK_QUOTE,
          children: [{ type: F.PARAGRAPH, children: [{ text: 'oo' }] }],
        },
      ]);

      deleteNTimes(editor, 1);
      expect(editor.children).toStrictEqual([{ type: F.PARAGRAPH, children: [{ text: 'oo' }] }]);
    });

    test('delete by character within multiple paragraphs', () => {
      inputText(editor, '> foo\nbar\nbaz');
      Transforms.select(editor, { path: [0, 1, 0], offset: 1 });

      deleteNTimes(editor, 1);
      expect(editor.children).toStrictEqual([
        {
          type: F.BLOCK_QUOTE,
          children: [
            { type: F.PARAGRAPH, children: [{ text: 'foo' }] },
            { type: F.PARAGRAPH, children: [{ text: 'ar' }] },
            { type: F.PARAGRAPH, children: [{ text: 'baz' }] },
          ],
        },
      ]);

      deleteNTimes(editor, 1);
      expect(editor.children).toStrictEqual([
        {
          type: F.BLOCK_QUOTE,
          children: [
            { type: F.PARAGRAPH, children: [{ text: 'fooar' }] },
            { type: F.PARAGRAPH, children: [{ text: 'baz' }] },
          ],
        },
      ]);
    });

    test('delete by line', () => {
      inputText(editor, '> foo');
      editor.deleteBackward('line');

      expect(editor.children).toStrictEqual([
        {
          type: F.BLOCK_QUOTE,
          children: [{ type: F.PARAGRAPH, children: [{ text: '' }] }],
        },
      ]);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('should not interfere with regular delete', () => {
      inputText(editor, 'foo');
      deleteNTimes(editor, 1);

      const nodes = [{ type: F.PARAGRAPH, children: [{ text: 'fo' }] }];

      expect(editor.children).toStrictEqual(nodes);
    });
  });

  describe('toggleBlock', () => {
    test('toggle empty paragraph', () => {
      inputText(editor, 'foo\n');
      editor.toggleBlock(F.BLOCK_QUOTE);

      const nodes = [
        { type: F.PARAGRAPH, children: [{ text: 'foo' }] },
        {
          type: F.BLOCK_QUOTE,
          children: [{ type: F.PARAGRAPH, children: [{ text: '' }] }],
        },
      ];

      expect(editor.children).toStrictEqual(nodes);
    });

    test('toggle non-empty paragraph', () => {
      inputText(editor, 'foo\nbar');
      editor.toggleBlock(F.BLOCK_QUOTE);

      const nodes = [
        { type: F.PARAGRAPH, children: [{ text: 'foo' }] },
        {
          type: F.BLOCK_QUOTE,
          children: [{ type: F.PARAGRAPH, children: [{ text: 'bar' }] }],
        },
      ];

      expect(editor.children).toStrictEqual(nodes);
    });

    test('should be able delegate to downstream toggleBlock ', () => {
      const baseEditor = createEditorWithContainer();
      const toggleBlock = jest.spyOn(baseEditor, 'toggleBlock');

      withBlockquote(baseEditor).toggleBlock('some-other-block');

      expect(toggleBlock).toBeCalled();
    });
  });
});

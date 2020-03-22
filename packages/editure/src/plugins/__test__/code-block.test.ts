import { Transforms, Editor, Range } from 'tuture-slate';
import * as F from 'editure-constants';

import { EditorWithContainer } from '../base-container';
import { EditorWithMark } from '../base-mark';
import { withCodeBlock } from '../code-block';
import { withBold } from '../bold';
import { withHr } from '../hr';
import {
  reset,
  inputText,
  deleteNTimes,
  configureEditor,
  createEditorWithContainer,
} from './utils';

describe('withCodeBlock', () => {
  const editor = configureEditor({
    marks: [withBold],
    containers: [withCodeBlock],
  }) as EditorWithMark & EditorWithContainer;
  reset(editor);

  afterEach(() => reset(editor));

  describe('insertText', () => {
    test('should disable any shortcuts', () => {
      inputText(editor, '```\nfoo **bar** ');

      const nodes = [
        {
          type: F.CODE_BLOCK,
          lang: '',
          children: [{ type: F.CODE_LINE, children: [{ text: 'foo **bar** ' }] }],
        },
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('insert characters other than space outside code block', () => {
      inputText(editor, 'foo');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo' }],
        },
      ];

      expect(editor.children).toStrictEqual(nodes);
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
            { type: F.CODE_LINE, children: [{ text: 'console.log("hello");' }] },
          ],
        },
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
            { type: F.CODE_LINE, children: [{ text: 'console.log("hello");' }] },
          ],
        },
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
            { type: F.CODE_LINE, children: [{ text: 'console.log("hello");' }] },
          ],
        },
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
            { type: F.CODE_LINE, children: [{ text: 'baz' }] },
          ],
        },
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('disable any shortcuts in a code block', () => {
      const newEditor = configureEditor({
        commons: [withHr],
        containers: [withCodeBlock],
      });
      reset(newEditor);
      inputText(newEditor, '```\n---\n');

      const nodes = [
        {
          type: F.CODE_BLOCK,
          lang: '',
          children: [
            { type: F.CODE_LINE, children: [{ text: '---' }] },
            { type: F.CODE_LINE, children: [{ text: '' }] },
          ],
        },
      ];

      expect(newEditor.children).toStrictEqual(nodes);
    });

    test('range not collapsed', () => {
      inputText(editor, '```');

      const path = [0, 0];
      Transforms.select(editor, {
        anchor: { path, offset: 2 },
        focus: { path, offset: 3 },
      });
      editor.insertBreak();

      const nodes = [
        { type: F.PARAGRAPH, children: [{ text: '``' }] },
        { type: F.PARAGRAPH, children: [{ text: '' }] },
      ];

      expect(editor.children).toStrictEqual(nodes);
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
  });

  describe('deleteBackward', () => {
    test('delete by character (single paragraph)', () => {
      inputText(editor, '```js\nfoo bar');

      deleteNTimes(editor, 4);
      expect(editor.children).toStrictEqual([
        {
          type: F.CODE_BLOCK,
          lang: 'js',
          children: [{ type: F.CODE_LINE, children: [{ text: 'foo' }] }],
        },
      ]);

      deleteNTimes(editor, 3);
      expect(editor.children).toStrictEqual([
        {
          type: F.CODE_BLOCK,
          lang: 'js',
          children: [{ type: F.CODE_LINE, children: [{ text: '' }] }],
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

    test('delete by character (multiple paragraphs)', () => {
      inputText(editor, 'test\n```js\nfoo bar');

      deleteNTimes(editor, 4);
      expect(editor.children).toStrictEqual([
        {
          type: F.PARAGRAPH,
          children: [{ text: 'test' }],
        },
        {
          type: F.CODE_BLOCK,
          lang: 'js',
          children: [{ type: F.CODE_LINE, children: [{ text: 'foo' }] }],
        },
      ]);

      deleteNTimes(editor, 3);
      expect(editor.children).toStrictEqual([
        {
          type: F.PARAGRAPH,
          children: [{ text: 'test' }],
        },
        {
          type: F.CODE_BLOCK,
          lang: 'js',
          children: [{ type: F.CODE_LINE, children: [{ text: '' }] }],
        },
      ]);

      deleteNTimes(editor, 1);
      expect(editor.children).toStrictEqual([
        {
          type: F.PARAGRAPH,
          children: [{ text: 'test' }],
        },
        {
          type: F.PARAGRAPH,
          children: [{ text: '' }],
        },
      ]);
    });

    test('delete by character (multiple code lines)', () => {
      inputText(editor, '```js\nfoo\nbar\nbaz');
      Transforms.select(editor, { path: [0, 1, 0], offset: 1 });

      deleteNTimes(editor, 1);
      expect(editor.children).toStrictEqual([
        {
          type: F.CODE_BLOCK,
          lang: 'js',
          children: [
            { type: F.CODE_LINE, children: [{ text: 'foo' }] },
            { type: F.CODE_LINE, children: [{ text: 'ar' }] },
            { type: F.CODE_LINE, children: [{ text: 'baz' }] },
          ],
        },
      ]);

      deleteNTimes(editor, 1);
      expect(editor.children).toStrictEqual([
        {
          type: F.CODE_BLOCK,
          lang: 'js',
          children: [
            { type: F.CODE_LINE, children: [{ text: 'fooar' }] },
            { type: F.CODE_LINE, children: [{ text: 'baz' }] },
          ],
        },
      ]);
    });

    test('delete by line', () => {
      inputText(editor, '```js\nfoo bar');
      editor.deleteBackward('line');

      expect(editor.children).toStrictEqual([
        {
          type: F.CODE_BLOCK,
          lang: 'js',
          children: [{ type: F.CODE_LINE, children: [{ text: '' }] }],
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

  describe('normalizeNode', () => {
    test('validate children of code blocks', () => {
      editor.children = [
        {
          type: F.CODE_BLOCK,
          lang: 'js',
          children: [{ children: [{ text: 'foo' }] }, { children: [{ text: 'bar' }] }],
        },
      ];

      Editor.normalize(editor, { force: true });

      const nodes = [
        {
          type: F.CODE_BLOCK,
          lang: 'js',
          children: [
            { type: F.CODE_LINE, children: [{ text: 'foo' }] },
            { type: F.CODE_LINE, children: [{ text: 'bar' }] },
          ],
        },
      ];

      expect(editor.children).toStrictEqual(nodes);
    });
  });

  describe('getChildFormat', () => {
    test('get child format of code block', () => {
      expect(editor.getChildFormat(F.CODE_BLOCK)).toStrictEqual(F.CODE_LINE);
    });

    test('get child format of non-note', () => {
      const baseEditor = createEditorWithContainer();
      const getChildFormatSpy = jest.spyOn(baseEditor, 'getChildFormat');

      withCodeBlock(baseEditor).getChildFormat('other-container');
      expect(getChildFormatSpy).toBeCalled();
    });
  });

  describe('unwrapBlock', () => {
    test('unwrap a code block', () => {
      inputText(editor, '```\ntest');
      editor.unwrapBlock(F.CODE_BLOCK);

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'test' }],
        },
      ];

      expect(editor.children).toStrictEqual(nodes);
    });

    test('unwrap other blocks', () => {
      const baseEditor = createEditorWithContainer();
      const unwrapBlock = jest.spyOn(baseEditor, 'unwrapBlock');
      withCodeBlock(baseEditor).unwrapBlock('some-other-block');

      expect(unwrapBlock).toBeCalled();
    });
  });

  describe('exitBlock', () => {
    test('exit code block', () => {
      inputText(editor, '```ts\nfoo\n');
      editor.exitBlock(F.CODE_BLOCK);

      const nodes = [
        {
          type: F.CODE_BLOCK,
          lang: 'ts',
          children: [{ type: F.CODE_LINE, children: [{ text: 'foo' }] }],
        },
        {
          type: F.PARAGRAPH,
          children: [{ text: '' }],
        },
      ];

      const point = { path: [1, 0], offset: 0 };

      expect(editor.children).toStrictEqual(nodes);
      expect(editor.selection).toStrictEqual({ anchor: point, focus: point });
    });

    test('should be able to delegate to downstream exitBlock', () => {
      const baseEditor = createEditorWithContainer();
      const exitBlockSpy = jest.spyOn(baseEditor, 'exitBlock');

      withCodeBlock(baseEditor).exitBlock('some-other-block');

      expect(exitBlockSpy).toBeCalled();
    });
  });

  describe('toggleBlock', () => {
    const baseEditor = createEditorWithContainer();
    const toggleBlockSpy = jest.spyOn(baseEditor, 'toggleBlock');

    const codeBlockEditor = withCodeBlock(baseEditor);
    const wrapBlockSpy = jest.spyOn(codeBlockEditor, 'wrapBlock');
    const unwrapBlockSpy = jest.spyOn(codeBlockEditor, 'unwrapBlock');

    afterEach(() => reset(codeBlockEditor));

    test('should call wrapBlock to activate code block', () => {
      inputText(codeBlockEditor, 'foo');
      codeBlockEditor.toggleBlock(F.CODE_BLOCK);

      expect(wrapBlockSpy).toBeCalled();
    });

    test('should call unwrapBlock to deactivate code block', () => {
      inputText(codeBlockEditor, '```\nfoo');
      codeBlockEditor.toggleBlock(F.CODE_BLOCK);

      expect(unwrapBlockSpy).toBeCalled();
    });

    test('should be able to delegate to downstream toggleBlock', () => {
      inputText(codeBlockEditor, 'foo');
      codeBlockEditor.toggleBlock('some-other-block');

      expect(toggleBlockSpy).toBeCalled();
    });
  });
});

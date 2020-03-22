import { Transforms, Range } from 'tuture-slate';
import * as F from 'editure-constants';

import { EditorWithContainer } from '../base-container';
import { EditorWithMark } from '../base-mark';
import { withNote } from '../note';
import { withBold } from '../bold';
import {
  reset,
  inputText,
  deleteNTimes,
  configureEditor,
  createEditorWithContainer
} from './utils';

describe('withNote', () => {
  const editor = configureEditor({
    marks: [withBold],
    containers: [withNote]
  }) as EditorWithMark & EditorWithContainer;
  reset(editor);

  afterEach(() => reset(editor));

  describe('getChildFormat', () => {
    test('get child format of note', () => {
      expect(editor.getChildFormat(F.NOTE)).toStrictEqual(F.PARAGRAPH);
    });

    test('get child format of non-note', () => {
      const baseEditor = createEditorWithContainer();
      const getChildFormatSpy = jest.spyOn(baseEditor, 'getChildFormat');

      withNote(baseEditor).getChildFormat('other-container');
      expect(getChildFormatSpy).toBeCalled();
    });
  });

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

    test('range not collapsed', () => {
      inputText(editor, ':::');

      const path = [0, 0];
      Transforms.select(editor, {
        anchor: { path, offset: 1 },
        focus: { path, offset: 3 }
      });
      editor.insertBreak();

      const nodes = [
        { type: F.PARAGRAPH, children: [{ text: ':' }] },
        { type: F.PARAGRAPH, children: [{ text: '' }] }
      ];

      expect(editor.children).toStrictEqual(nodes);
    });

    test('should not interfere with regular break', () => {
      inputText(editor, 'foo\nbar');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo' }]
        },
        {
          type: F.PARAGRAPH,
          children: [{ text: 'bar' }]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });
  });

  describe('deleteBackward', () => {
    test('delete by character (single paragraph)', () => {
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

    test('delete by character (multiple paragraphs)', () => {
      inputText(editor, 'test\n:::info\nfoo bar');

      deleteNTimes(editor, 4);
      expect(editor.children).toStrictEqual([
        {
          type: F.PARAGRAPH,
          children: [{ text: 'test' }]
        },
        {
          type: F.NOTE,
          level: 'info',
          children: [{ type: F.PARAGRAPH, children: [{ text: 'foo' }] }]
        }
      ]);

      deleteNTimes(editor, 3);
      expect(editor.children).toStrictEqual([
        {
          type: F.PARAGRAPH,
          children: [{ text: 'test' }]
        },
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
          children: [{ text: 'test' }]
        },
        {
          type: F.PARAGRAPH,
          children: [{ text: '' }]
        }
      ]);
    });

    test('delete by character (multiple child paragraphs)', () => {
      inputText(editor, '::: info\nfoo\nbar\nbaz');
      Transforms.select(editor, { path: [0, 1, 0], offset: 1 });

      deleteNTimes(editor, 1);
      expect(editor.children).toStrictEqual([
        {
          type: F.NOTE,
          level: 'info',
          children: [
            { type: F.PARAGRAPH, children: [{ text: 'foo' }] },
            { type: F.PARAGRAPH, children: [{ text: 'ar' }] },
            { type: F.PARAGRAPH, children: [{ text: 'baz' }] }
          ]
        }
      ]);

      deleteNTimes(editor, 1);
      expect(editor.children).toStrictEqual([
        {
          type: F.NOTE,
          level: 'info',
          children: [
            { type: F.PARAGRAPH, children: [{ text: 'fooar' }] },
            { type: F.PARAGRAPH, children: [{ text: 'baz' }] }
          ]
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

    test('should not interfere with regular delete', () => {
      inputText(editor, 'foo');
      deleteNTimes(editor, 1);

      const nodes = [{ type: F.PARAGRAPH, children: [{ text: 'fo' }] }];

      expect(editor.children).toStrictEqual(nodes);
    });
  });

  describe('toggleBlock', () => {
    const baseEditor = createEditorWithContainer();
    const toggleBlockSpy = jest.spyOn(baseEditor, 'toggleBlock');

    const noteEditor = withNote(baseEditor);
    const wrapBlockSpy = jest.spyOn(noteEditor, 'wrapBlock');
    const unwrapBlockSpy = jest.spyOn(noteEditor, 'unwrapBlock');

    afterEach(() => reset(noteEditor));

    test('should call wrapBlock to activate code block', () => {
      inputText(noteEditor, 'foo');
      noteEditor.toggleBlock(F.NOTE);

      expect(wrapBlockSpy).toBeCalled();
    });

    test('should call unwrapBlock to deactivate code block', () => {
      inputText(noteEditor, ':::\nfoo');
      noteEditor.toggleBlock(F.NOTE);

      expect(unwrapBlockSpy).toBeCalled();
    });

    test('should be able to delegate to downstream toggleBlock', () => {
      inputText(noteEditor, 'foo');
      noteEditor.toggleBlock('some-other-block');

      expect(toggleBlockSpy).toBeCalled();
    });
  });
});

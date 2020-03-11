import { createEditor, Range, Editor } from 'tuture-slate';
import * as F from 'editure-constants';

import withList from '../list';
import withParagraph from '../paragraph';
import { reset, inputText, deleteNTimes } from './utils';

describe('withList', () => {
  const editor = withList(withParagraph(createEditor()));
  reset(editor);

  afterEach(() => reset(editor));

  describe('bulleted list', () => {
    describe('insertText', () => {
      test('single item', () => {
        inputText(editor, '- hello');

        const nodes = [
          {
            type: F.BULLETED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 0,
                children: [{ text: 'hello' }]
              }
            ]
          }
        ];

        expect(editor.children).toStrictEqual(nodes);
        expect(Range.isCollapsed(editor.selection!)).toBe(true);
      });

      test('multiple items', () => {
        inputText(editor, '- foo\nbar');

        const nodes = [
          {
            type: F.BULLETED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 0,
                children: [{ text: 'foo' }]
              },
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 0,
                children: [{ text: 'bar' }]
              }
            ]
          }
        ];

        expect(editor.children).toStrictEqual(nodes);
        expect(Range.isCollapsed(editor.selection!)).toBe(true);
      });
    });

    describe('insertBreak', () => {
      test('should exit if last item is empty', () => {
        inputText(editor, '- foo\nbar\n\n');

        const nodes = [
          {
            type: F.BULLETED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 0,
                children: [{ text: 'foo' }]
              },
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 0,
                children: [{ text: 'bar' }]
              }
            ]
          },
          { type: F.PARAGRAPH, children: [{ text: '' }] }
        ];

        expect(editor.children).toStrictEqual(nodes);
        expect(Range.isCollapsed(editor.selection!)).toBe(true);
      });
    });

    describe('deleteBackward', () => {
      test('delete by character', () => {
        inputText(editor, '- foo');

        deleteNTimes(editor, 2);
        expect(editor.children).toStrictEqual([
          {
            type: F.BULLETED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                level: 0,
                parent: F.BULLETED_LIST,
                children: [{ text: 'f' }]
              }
            ]
          }
        ]);

        deleteNTimes(editor, 1);
        expect(editor.children).toStrictEqual([
          {
            type: F.BULLETED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                level: 0,
                parent: F.BULLETED_LIST,
                children: [{ text: '' }]
              }
            ]
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
        inputText(editor, '- foo');
        editor.deleteBackward('line');

        expect(editor.children).toStrictEqual([
          {
            type: F.BULLETED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                level: 0,
                parent: F.BULLETED_LIST,
                children: [{ text: '' }]
              }
            ]
          }
        ]);
        expect(Range.isCollapsed(editor.selection!)).toBe(true);
      });
    });

    describe('normalizeNode', () => {
      test('add missing level and parent', () => {
        editor.children = [
          {
            type: F.BULLETED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                children: [{ text: 'foo' }]
              },
              {
                type: F.LIST_ITEM,
                level: 1,
                children: [{ text: 'bar' }]
              }
            ]
          }
        ];

        Editor.normalize(editor, { force: true });
        expect(editor.children).toStrictEqual([
          {
            type: F.BULLETED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 0,
                children: [{ text: 'foo' }]
              },
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 1,
                children: [{ text: 'bar' }]
              }
            ]
          }
        ]);
      });

      test('validate list items', () => {
        editor.children = [
          {
            type: F.BULLETED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 0,
                children: [{ type: F.PARAGRAPH, children: [{ text: 'foo' }] }]
              }
            ]
          }
        ];

        Editor.normalize(editor, { force: true });
        expect(editor.children).toStrictEqual([
          {
            type: F.BULLETED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 0,
                children: [{ text: 'foo' }]
              }
            ]
          }
        ]);
      });
    });
  });

  describe('numbered list', () => {
    describe('insertText', () => {
      test('single item', () => {
        inputText(editor, '1. hello');

        const nodes = [
          {
            type: F.NUMBERED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.NUMBERED_LIST,
                number: 1,
                level: 0,
                children: [{ text: 'hello' }]
              }
            ]
          }
        ];

        expect(editor.children).toStrictEqual(nodes);
        expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
      });

      test('multiple items', () => {
        inputText(editor, '1. foo\nbar');

        const nodes = [
          {
            type: F.NUMBERED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.NUMBERED_LIST,
                number: 1,
                level: 0,
                children: [{ text: 'foo' }]
              },
              {
                type: F.LIST_ITEM,
                parent: F.NUMBERED_LIST,
                number: 2,
                level: 0,
                children: [{ text: 'bar' }]
              }
            ]
          }
        ];

        expect(editor.children).toStrictEqual(nodes);
        expect(Range.isCollapsed(editor.selection!)).toBe(true);
      });
    });

    describe('insertBreak', () => {
      test('should exit if last item is empty', () => {
        inputText(editor, '1. foo\nbar\n\n');

        const nodes = [
          {
            type: F.NUMBERED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.NUMBERED_LIST,
                number: 1,
                level: 0,
                children: [{ text: 'foo' }]
              },
              {
                type: F.LIST_ITEM,
                parent: F.NUMBERED_LIST,
                number: 2,
                level: 0,
                children: [{ text: 'bar' }]
              }
            ]
          },
          { type: F.PARAGRAPH, children: [{ text: '' }] }
        ];

        expect(editor.children).toStrictEqual(nodes);
        expect(Range.isCollapsed(editor.selection!)).toBe(true);
      });
    });

    describe('deleteBackward', () => {
      test('delete by character', () => {
        inputText(editor, '1. foo');

        deleteNTimes(editor, 2);
        expect(editor.children).toStrictEqual([
          {
            type: F.NUMBERED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                level: 0,
                number: 1,
                parent: F.NUMBERED_LIST,
                children: [{ text: 'f' }]
              }
            ]
          }
        ]);

        deleteNTimes(editor, 1);
        expect(editor.children).toStrictEqual([
          {
            type: F.NUMBERED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                level: 0,
                number: 1,
                parent: F.NUMBERED_LIST,
                children: [{ text: '' }]
              }
            ]
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
        inputText(editor, '1. foo');
        editor.deleteBackward('line');

        expect(editor.children).toStrictEqual([
          {
            type: F.NUMBERED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                level: 0,
                number: 1,
                parent: F.NUMBERED_LIST,
                children: [{ text: '' }]
              }
            ]
          }
        ]);
        expect(Range.isCollapsed(editor.selection!)).toBe(true);
      });
    });

    describe('normalizeNode', () => {
      test('add missing level, number and parent', () => {
        editor.children = [
          {
            type: F.NUMBERED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                children: [{ text: 'foo' }]
              },
              {
                type: F.LIST_ITEM,
                children: [{ text: 'bar' }]
              },
              {
                type: F.LIST_ITEM,
                level: 1,
                children: [{ text: 'baz' }]
              }
            ]
          }
        ];

        Editor.normalize(editor, { force: true });
        expect(editor.children).toStrictEqual([
          {
            type: F.NUMBERED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                level: 0,
                number: 1,
                parent: F.NUMBERED_LIST,
                children: [{ text: 'foo' }]
              },
              {
                type: F.LIST_ITEM,
                level: 0,
                number: 2,
                parent: F.NUMBERED_LIST,
                children: [{ text: 'bar' }]
              },
              {
                type: F.LIST_ITEM,
                level: 1,
                number: 1,
                parent: F.NUMBERED_LIST,
                children: [{ text: 'baz' }]
              }
            ]
          }
        ]);
      });

      test('validate list items', () => {
        editor.children = [
          {
            type: F.NUMBERED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.NUMBERED_LIST,
                number: 1,
                level: 0,
                children: [{ type: F.PARAGRAPH, children: [{ text: 'foo' }] }]
              }
            ]
          }
        ];

        Editor.normalize(editor, { force: true });
        expect(editor.children).toStrictEqual([
          {
            type: F.NUMBERED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.NUMBERED_LIST,
                number: 1,
                level: 0,
                children: [{ text: 'foo' }]
              }
            ]
          }
        ]);
      });
    });
  });
});

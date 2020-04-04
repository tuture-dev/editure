import { Range, Transforms, Editor } from 'tuture-slate';
import * as F from 'editure-constants';

import { withList, EditorWithList } from '../list';
import { configureEditor, reset, inputText, deleteNTimes } from './utils';

describe('withList', () => {
  const editor = configureEditor({ blocks: [withList] }) as EditorWithList;
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
                children: [{ text: 'hello' }],
              },
            ],
          },
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
                children: [{ text: 'foo' }],
              },
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 0,
                children: [{ text: 'bar' }],
              },
            ],
          },
        ];

        expect(editor.children).toStrictEqual(nodes);
        expect(Range.isCollapsed(editor.selection!)).toBe(true);
      });

      test('insert space but not to trigger anything', () => {
        inputText(editor, '*foo* ');

        const nodes = [
          {
            type: F.PARAGRAPH,
            children: [{ text: '*foo* ' }],
          },
        ];

        expect(editor.children).toStrictEqual(nodes);
        expect(Range.isCollapsed(editor.selection!)).toBe(true);
      });

      test('should not toggle in a list item', () => {
        inputText(editor, '- - ');

        const nodes = [
          {
            type: F.BULLETED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 0,
                children: [{ text: '- ' }],
              },
            ],
          },
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
                children: [{ text: 'foo' }],
              },
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 0,
                children: [{ text: 'bar' }],
              },
            ],
          },
          { type: F.PARAGRAPH, children: [{ text: '' }] },
        ];

        expect(editor.children).toStrictEqual(nodes);
        expect(Range.isCollapsed(editor.selection!)).toBe(true);
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
                children: [{ text: 'f' }],
              },
            ],
          },
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
                children: [{ text: '' }],
              },
            ],
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
                children: [{ text: '' }],
              },
            ],
          },
        ]);
        expect(Range.isCollapsed(editor.selection!)).toBe(true);
      });

      test('delete on item with depth > 1', () => {
        const listItem = {
          type: F.LIST_ITEM,
          level: 1,
          parent: F.BULLETED_LIST,
          children: [{ text: '' }],
        };

        editor.children = [
          {
            type: F.BULLETED_LIST,
            children: [listItem],
          },
        ];

        Transforms.select(editor, { path: [0, 0, 0], offset: 0 });
        editor.deleteBackward('character');

        expect(editor.children).toStrictEqual([
          {
            type: F.BULLETED_LIST,
            children: [{ ...listItem, level: 0 }],
          },
        ]);
      });

      test('should not interfere with regular deleteBackward', () => {
        inputText(editor, 'foo');
        editor.deleteBackward('character');

        const nodes = [
          {
            type: F.PARAGRAPH,
            children: [{ text: 'fo' }],
          },
        ];

        expect(editor.children).toStrictEqual(nodes);
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
                children: [{ text: 'foo' }],
              },
              {
                type: F.LIST_ITEM,
                level: 1,
                children: [{ text: 'bar' }],
              },
            ],
          },
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
                children: [{ text: 'foo' }],
              },
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 1,
                children: [{ text: 'bar' }],
              },
            ],
          },
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
                children: [{ type: F.PARAGRAPH, children: [{ text: 'foo' }] }],
              },
            ],
          },
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
                children: [{ text: 'foo' }],
              },
            ],
          },
        ]);
      });
    });

    describe('toggleBlock', () => {
      test('activate bulleted list', () => {
        inputText(editor, 'foo');
        editor.toggleBlock(F.BULLETED_LIST);

        const nodes = [
          {
            type: F.BULLETED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 0,
                children: [{ text: 'foo' }],
              },
            ],
          },
        ];

        expect(editor.children).toStrictEqual(nodes);
      });

      test('deactivate bulleted list', () => {
        inputText(editor, '- foo');
        editor.toggleBlock(F.BULLETED_LIST);

        const nodes = [
          {
            type: F.PARAGRAPH,
            children: [{ text: 'foo' }],
          },
        ];

        expect(editor.children).toStrictEqual(nodes);
      });

      test('deactivate bulleted list (multiple items)', () => {
        inputText(editor, '- foo\nbar\nbaz');
        Transforms.select(editor, { path: [0, 1, 0], offset: 1 });

        editor.toggleBlock(F.BULLETED_LIST);

        const nodes = [
          {
            type: F.BULLETED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 0,
                children: [{ text: 'foo' }],
              },
            ],
          },
          {
            type: F.PARAGRAPH,
            children: [{ text: 'bar' }],
          },
          {
            type: F.BULLETED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 0,
                children: [{ text: 'baz' }],
              },
            ],
          },
        ];

        expect(editor.children).toStrictEqual(nodes);
      });
    });

    describe('increaseItemDepth', () => {
      test('should work for empty list item', () => {
        inputText(editor, '- ');
        editor.increaseItemDepth();

        const nodes = [
          {
            type: F.BULLETED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 1,
                children: [{ text: '' }],
              },
            ],
          },
        ];

        expect(editor.children).toStrictEqual(nodes);
      });

      test('should work for non-empty list item', () => {
        inputText(editor, '- test');
        editor.increaseItemDepth();

        const nodes = [
          {
            type: F.BULLETED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 1,
                children: [{ text: 'test' }],
              },
            ],
          },
        ];

        expect(editor.children).toStrictEqual(nodes);
      });

      test('should work with multiple items', () => {
        inputText(editor, '- foo\nbar\nbaz');

        Transforms.select(editor, { path: [0, 1, 0], offset: 0 });
        editor.increaseItemDepth();

        Transforms.select(editor, { path: [0, 2, 0], offset: 1 });
        editor.increaseItemDepth();
        editor.increaseItemDepth();

        const nodes = [
          {
            type: F.BULLETED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 0,
                children: [{ text: 'foo' }],
              },
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 1,
                children: [{ text: 'bar' }],
              },
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 2,
                children: [{ text: 'baz' }],
              },
            ],
          },
        ];

        expect(editor.children).toStrictEqual(nodes);
      });
    });

    describe('decreaseItemDepth', () => {
      test('should do nothing with level 0 item', () => {
        inputText(editor, '- test');
        editor.decreaseItemDepth();

        const nodes = [
          {
            type: F.BULLETED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.BULLETED_LIST,
                level: 0,
                children: [{ text: 'test' }],
              },
            ],
          },
        ];

        expect(editor.children).toStrictEqual(nodes);
      });

      test('should correctly decrease depth', () => {
        const listItem = {
          type: F.LIST_ITEM,
          parent: F.BULLETED_LIST,
          level: 2,
          children: [{ text: 'test' }],
        };

        editor.children = [
          {
            type: F.BULLETED_LIST,
            children: [listItem],
          },
        ];

        Transforms.select(editor, { path: [0, 0, 0], offset: 2 });

        editor.decreaseItemDepth();
        expect(editor.children).toStrictEqual([
          {
            type: F.BULLETED_LIST,
            children: [{ ...listItem, level: 1 }],
          },
        ]);

        editor.decreaseItemDepth();
        expect(editor.children).toStrictEqual([
          {
            type: F.BULLETED_LIST,
            children: [{ ...listItem, level: 0 }],
          },
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
                children: [{ text: 'hello' }],
              },
            ],
          },
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
                children: [{ text: 'foo' }],
              },
              {
                type: F.LIST_ITEM,
                parent: F.NUMBERED_LIST,
                number: 2,
                level: 0,
                children: [{ text: 'bar' }],
              },
            ],
          },
        ];

        expect(editor.children).toStrictEqual(nodes);
        expect(Range.isCollapsed(editor.selection!)).toBe(true);
      });

      test('should not toggle in a list item', () => {
        inputText(editor, '1. 1. ');

        const nodes = [
          {
            type: F.NUMBERED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.NUMBERED_LIST,
                level: 0,
                children: [{ text: '1. ' }],
              },
            ],
          },
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
                children: [{ text: 'foo' }],
              },
              {
                type: F.LIST_ITEM,
                parent: F.NUMBERED_LIST,
                number: 2,
                level: 0,
                children: [{ text: 'bar' }],
              },
            ],
          },
          { type: F.PARAGRAPH, children: [{ text: '' }] },
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
                children: [{ text: 'f' }],
              },
            ],
          },
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
                children: [{ text: '' }],
              },
            ],
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
                children: [{ text: '' }],
              },
            ],
          },
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
                children: [{ text: 'foo' }],
              },
              {
                type: F.LIST_ITEM,
                children: [{ text: 'bar' }],
              },
              {
                type: F.LIST_ITEM,
                level: 1,
                children: [{ text: 'baz' }],
              },
            ],
          },
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
                children: [{ text: 'foo' }],
              },
              {
                type: F.LIST_ITEM,
                level: 0,
                number: 2,
                parent: F.NUMBERED_LIST,
                children: [{ text: 'bar' }],
              },
              {
                type: F.LIST_ITEM,
                level: 1,
                number: 1,
                parent: F.NUMBERED_LIST,
                children: [{ text: 'baz' }],
              },
            ],
          },
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
                children: [{ type: F.PARAGRAPH, children: [{ text: 'foo' }] }],
              },
            ],
          },
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
                children: [{ text: 'foo' }],
              },
            ],
          },
        ]);
      });
    });

    describe('increaseItemDepth', () => {
      test('should work for empty list item', () => {
        inputText(editor, '1. ');
        editor.increaseItemDepth();

        const nodes = [
          {
            type: F.NUMBERED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.NUMBERED_LIST,
                number: 1,
                level: 1,
                children: [{ text: '' }],
              },
            ],
          },
        ];

        expect(editor.children).toStrictEqual(nodes);
      });

      test('should work for non-empty list item', () => {
        inputText(editor, '1. test');
        editor.increaseItemDepth();

        const nodes = [
          {
            type: F.NUMBERED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.NUMBERED_LIST,
                number: 1,
                level: 1,
                children: [{ text: 'test' }],
              },
            ],
          },
        ];

        expect(editor.children).toStrictEqual(nodes);
      });

      test('should work with multiple items', () => {
        inputText(editor, '1. foo\nbar\nbaz');

        Transforms.select(editor, { path: [0, 1, 0], offset: 0 });
        editor.increaseItemDepth();

        Transforms.select(editor, { path: [0, 2, 0], offset: 1 });
        editor.increaseItemDepth();
        editor.increaseItemDepth();

        const nodes = [
          {
            type: F.NUMBERED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.NUMBERED_LIST,
                number: 1,
                level: 0,
                children: [{ text: 'foo' }],
              },
              {
                type: F.LIST_ITEM,
                parent: F.NUMBERED_LIST,
                number: 1,
                level: 1,
                children: [{ text: 'bar' }],
              },
              {
                type: F.LIST_ITEM,
                parent: F.NUMBERED_LIST,
                number: 1,
                level: 2,
                children: [{ text: 'baz' }],
              },
            ],
          },
        ];

        expect(editor.children).toStrictEqual(nodes);
      });
    });

    describe('decreaseItemDepth', () => {
      test('should do nothing with level 0 item', () => {
        inputText(editor, '1. test');
        editor.decreaseItemDepth();

        const nodes = [
          {
            type: F.NUMBERED_LIST,
            children: [
              {
                type: F.LIST_ITEM,
                parent: F.NUMBERED_LIST,
                number: 1,
                level: 0,
                children: [{ text: 'test' }],
              },
            ],
          },
        ];

        expect(editor.children).toStrictEqual(nodes);
      });

      test('should correctly decrease depth', () => {
        const listItem = {
          type: F.LIST_ITEM,
          parent: F.NUMBERED_LIST,
          number: 1,
          level: 2,
          children: [{ text: 'test' }],
        };

        editor.children = [
          {
            type: F.NUMBERED_LIST,
            children: [listItem],
          },
        ];

        Transforms.select(editor, { path: [0, 0, 0], offset: 2 });

        editor.decreaseItemDepth();
        expect(editor.children).toStrictEqual([
          {
            type: F.NUMBERED_LIST,
            children: [{ ...listItem, level: 1 }],
          },
        ]);

        editor.decreaseItemDepth();
        expect(editor.children).toStrictEqual([
          {
            type: F.NUMBERED_LIST,
            children: [{ ...listItem, level: 0 }],
          },
        ]);
      });
    });
  });
});

import { createEditor, Transforms, Editor } from 'slate';
import * as F from 'editure-constants';

import withShortcuts from '../shortcuts';

function reset(editor: Editor) {
  editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
  Transforms.select(editor, [0, 0]);
  Transforms.collapse(editor, { edge: 'start' });
}

function inputText(editor: Editor, text: string) {
  text.split('').forEach(c => {
    if (c === '\n') {
      editor.insertBreak();
    } else {
      editor.insertText(c);
    }

    Editor.normalize(editor);
  });
}

function deleteNTimes(editor: Editor, times: number) {
  [...Array(times)].forEach(() => {
    editor.deleteBackward('character');
    Editor.normalize(editor);
  });
}

describe('shortcuts plugin', () => {
  describe('mark shortcuts', () => {
    const editor = withShortcuts(createEditor());
    reset(editor);

    afterEach(() => {
      reset(editor);
    });

    test('regular text', () => {
      inputText(editor, 'foo* bar` _baz');

      const nodes = [{ type: F.PARAGRAPH, children: [{ text: 'foo* bar` _baz' }] }];

      expect(editor.children).toStrictEqual(nodes);

      // Make sure the selection is collapsed.
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);

      // Make sure the current marks is correct.
      expect(editor.marks).toBe(null);
    });

    test('bold (syntax 1)', () => {
      inputText(editor, '**bold** ');

      const nodes = [
        { type: F.PARAGRAPH, children: [{ text: 'bold', bold: true }, { text: ' ' }] }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
      expect(editor.marks).toBe(null);
    });

    test('bold (syntax 2)', () => {
      inputText(editor, '__bold__ ');

      const nodes = [
        { type: F.PARAGRAPH, children: [{ text: 'bold', bold: true }, { text: ' ' }] }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
      expect(editor.marks).toBe(null);
    });

    test('italic (syntax 1)', () => {
      inputText(editor, '*italic* ');

      const nodes = [
        { type: F.PARAGRAPH, children: [{ text: 'italic', italic: true }, { text: ' ' }] }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
      expect(editor.marks).toBe(null);
    });

    test('italic (syntax 2)', () => {
      inputText(editor, '_italic_ ');

      const nodes = [
        { type: F.PARAGRAPH, children: [{ text: 'italic', italic: true }, { text: ' ' }] }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
      expect(editor.marks).toBe(null);
    });

    test('inline code', () => {
      inputText(editor, '`code` ');

      const nodes = [
        { type: F.PARAGRAPH, children: [{ text: 'code', code: true }, { text: ' ' }] }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
      expect(editor.marks).toBe(null);
    });

    test('strikethrough', () => {
      inputText(editor, '~~strike~~ ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'strike', strikethrough: true }, { text: ' ' }]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
      expect(editor.marks).toBe(null);
    });

    test('link', () => {
      inputText(editor, '[Test](https://test.com) ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'Test', link: true, url: 'https://test.com' }, { text: ' ' }]
        }
      ];

      // TODO: Remove `url` attribute right after the link leaf
      //  and change `toMatchObject` to `toStrictEqual`.
      expect(editor.children).toMatchObject(nodes);

      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
      expect(editor.marks).toBe(null);
    });

    test('sequential marks', () => {
      inputText(editor, 'This is **bold** and *italic* and `code` ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [
            { text: 'This is ' },
            { text: 'bold', bold: true },
            { text: ' and ' },
            { text: 'italic', italic: true },
            { text: ' and ' },
            { text: 'code', code: true },
            { text: ' ' }
          ]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
      expect(editor.marks).toBe(null);
    });
  });

  describe('block shortcuts', () => {
    const editor = withShortcuts(createEditor());
    reset(editor);

    afterEach(() => {
      reset(editor);
    });

    test('h1', () => {
      inputText(editor, '# test\n');

      const nodes = [
        {
          type: F.H1,
          children: [{ text: 'test' }]
        },
        {
          type: F.PARAGRAPH,
          children: [{ text: '' }]
        }
      ];

      expect(editor.children[0].id).toBeTruthy();
      expect(editor.children).toMatchObject(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
    });

    test('h2', () => {
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

      expect(editor.children[0].id).toBeTruthy();
      expect(editor.children).toMatchObject(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
    });

    test('h3', () => {
      inputText(editor, '### test\n');

      const nodes = [
        {
          type: F.H3,
          children: [{ text: 'test' }]
        },
        {
          type: F.PARAGRAPH,
          children: [{ text: '' }]
        }
      ];

      expect(editor.children[0].id).toBeTruthy();
      expect(editor.children).toMatchObject(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
    });

    test('h4', () => {
      inputText(editor, '#### test\n');

      const nodes = [
        {
          type: F.H4,
          children: [{ text: 'test' }]
        },
        {
          type: F.PARAGRAPH,
          children: [{ text: '' }]
        }
      ];

      expect(editor.children[0].id).toBeTruthy();
      expect(editor.children).toMatchObject(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
    });

    test('blockquote', () => {
      inputText(editor, '> test');

      const nodes = [
        {
          type: F.BLOCK_QUOTE,
          children: [{ type: F.PARAGRAPH, children: [{ text: 'test' }] }]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
    });

    test('code block', () => {
      inputText(editor, '```\nfoo bar\nbaz');

      const nodes = [
        {
          type: F.CODE_BLOCK,
          lang: '',
          children: [
            { type: F.CODE_LINE, children: [{ text: 'foo bar' }] },
            { type: F.CODE_LINE, children: [{ text: 'baz' }] }
          ]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
    });

    test('note block', () => {
      inputText(editor, ':::\ntest');

      const nodes = [
        {
          type: F.NOTE,
          level: '',
          children: [{ type: F.PARAGRAPH, children: [{ text: 'test' }] }]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
    });

    test('bulleted list', () => {
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
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
    });

    test('numbered list', () => {
      inputText(editor, '1. hello');

      const nodes = [
        {
          type: F.NUMBERED_LIST,
          children: [
            {
              type: F.LIST_ITEM,
              parent: F.NUMBERED_LIST,
              level: 0,
              children: [{ text: 'hello' }]
            }
          ]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
    });

    test('hr (syntax 1)', () => {
      inputText(editor, '---\n');

      const nodes = [
        { type: F.HR, children: [{ text: '' }] },
        { type: F.PARAGRAPH, children: [{ text: '' }] }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
    });

    test('hr (syntax 2)', () => {
      inputText(editor, '***\n');

      const nodes = [
        { type: F.HR, children: [{ text: '' }] },
        { type: F.PARAGRAPH, children: [{ text: '' }] }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
    });

    test('hr (syntax 3)', () => {
      inputText(editor, '___\n');

      const nodes = [
        { type: F.HR, children: [{ text: '' }] },
        { type: F.PARAGRAPH, children: [{ text: '' }] }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
    });
  });

  describe('deleteBackward', () => {
    const editor = withShortcuts(createEditor());
    reset(editor);

    afterEach(() => {
      reset(editor);
    });

    test('delete regular text', () => {
      editor.children = [{ type: F.PARAGRAPH, children: [{ text: 'foo bar' }] }];

      const point = { path: [0, 0], offset: 7 };
      Transforms.select(editor, point);
      deleteNTimes(editor, 4);

      const nodes = [{ type: F.PARAGRAPH, children: [{ text: 'foo' }] }];

      expect(editor.children).toStrictEqual(nodes);
    });

    test('delete bold mark', () => {
      editor.children = [{ type: F.PARAGRAPH, children: [{ text: 'foo', bold: true }] }];

      const point = { path: [0, 0], offset: 3 };
      Transforms.select(editor, point);

      // Text should be deleted but bold mark is still there.
      deleteNTimes(editor, 3);
      expect(editor.children).toStrictEqual([
        { type: F.PARAGRAPH, children: [{ text: '', bold: true }] }
      ]);

      // Both text and bold mark are gone.
      deleteNTimes(editor, 1);
      expect(editor.children).toStrictEqual([
        { type: F.PARAGRAPH, children: [{ text: '' }] }
      ]);
    });

    test('delete code mark', () => {
      editor.children = [{ type: F.PARAGRAPH, children: [{ text: 'foo', code: true }] }];

      const point = { path: [0, 0], offset: 3 };
      Transforms.select(editor, point);

      deleteNTimes(editor, 3);
      expect(editor.children).toStrictEqual([
        { type: F.PARAGRAPH, children: [{ text: '', code: true }] }
      ]);

      deleteNTimes(editor, 1);
      expect(editor.children).toStrictEqual([
        { type: F.PARAGRAPH, children: [{ text: '' }] }
      ]);
    });
  });

  describe('deleteFragment', () => {
    const editor = withShortcuts(createEditor());
    reset(editor);

    afterEach(() => {
      reset(editor);
    });

    test('bulleted list', () => {
      editor.children = [
        {
          type: F.BULLETED_LIST,
          children: [
            {
              type: F.LIST_ITEM,
              parent: F.BULLETED_LIST,
              children: [{ text: 'foo bar' }]
            }
          ]
        }
      ];

      const path = [0, 0, 0];
      const selection = { anchor: { path, offset: 3 }, focus: { path, offset: 7 } };
      Transforms.select(editor, selection);
      Editor.deleteFragment(editor);

      const nodes = [
        {
          type: F.BULLETED_LIST,
          children: [
            { type: F.LIST_ITEM, parent: F.BULLETED_LIST, children: [{ text: 'foo' }] }
          ]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(editor.selection!.anchor).toStrictEqual(editor.selection!.focus);
    });
  });
});

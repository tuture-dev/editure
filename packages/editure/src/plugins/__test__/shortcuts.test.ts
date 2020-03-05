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
  });
}

describe('shortcuts plugin', () => {
  describe('block shortcuts', () => {
    const editor = withShortcuts(createEditor());
    reset(editor);

    afterEach(() => {
      reset(editor);
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
    });

    test('code block', () => {
      inputText(editor, '```\ntest');

      const nodes = [
        {
          type: F.CODE_BLOCK,
          lang: '',
          children: [{ type: F.CODE_LINE, children: [{ text: 'test' }] }]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
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
    });
  });
});

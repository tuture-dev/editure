import { Editor, Transforms, Range } from 'tuture-slate';
import * as F from 'editure-constants';

import { EditorWithLink } from '../link';
import { withLink } from '../link';
import { configureEditor, reset, inputText } from './utils';

describe('withLink', () => {
  const link = { text: 'bar', url: 'https://test.com' };

  // Return a fresh new children instance.
  const getChildren = () => [
    {
      type: F.PARAGRAPH,
      children: [{ text: 'foo' }, { ...link, link: true }, { text: 'baz', bold: true }]
    }
  ];

  const editor = configureEditor({ marks: [withLink] }) as EditorWithLink;
  reset(editor);

  afterEach(() => reset(editor));

  describe('insertText', () => {
    test('regular', () => {
      inputText(editor, '[foo](https://test.com) ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo', link: true, url: 'https://test.com' }, { text: ' ' }]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(Editor.marks(editor)).toStrictEqual({});
    });

    test('end of a sentence', () => {
      inputText(editor, 'foo [bar](https://test.com) ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [
            { text: 'foo ' },
            { text: 'bar', link: true, url: 'https://test.com' },
            { text: ' ' }
          ]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(Editor.marks(editor)).toStrictEqual({});
    });

    test('start of a sentence', () => {
      editor.children = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo' }]
        }
      ];

      const point = { path: [0, 0], offset: 0 };
      Transforms.select(editor, point);
      inputText(editor, '[bar](https://test.com) ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [
            { text: 'bar', link: true, url: 'https://test.com' },
            { text: ' foo' }
          ]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(Editor.marks(editor)).toStrictEqual({});
    });

    test('middle of a sentence', () => {
      editor.children = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo bar' }]
        }
      ];

      const point = { path: [0, 0], offset: 4 };
      Transforms.select(editor, point);
      inputText(editor, '[baz](https://test.com) ');

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [
            { text: 'foo ' },
            { text: 'baz', link: true, url: 'https://test.com' },
            { text: ' bar' }
          ]
        }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
      expect(Editor.marks(editor)).toStrictEqual({});
    });
  });

  describe('insertLink', () => {
    test('insert link directly', () => {
      const link = { text: 'foo', url: 'https://test.com' };
      editor.insertLink(link);

      const nodes = [{ type: F.PARAGRAPH, children: [{ link: true, ...link }] }];

      expect(editor.children).toStrictEqual(nodes);
      expect(Editor.marks(editor)).toStrictEqual({});
    });

    test('no selection', () => {
      const link = { text: 'foo', url: 'https://test.com' };
      Transforms.deselect(editor);
      editor.insertLink(link);

      const nodes = [{ type: F.PARAGRAPH, children: [{ text: '' }] }];

      expect(editor.children).toStrictEqual(nodes);
    });
  });

  describe('getLinkData', () => {
    const emptyLink = { text: '', url: '' };

    test('text with link', () => {
      editor.children = getChildren();

      // Select within link mark.
      Transforms.select(editor, { path: [0, 1], offset: 1 });
      expect(editor.getLinkData()).toStrictEqual(link);

      // Select outside link mark.
      Transforms.select(editor, { path: [0, 0], offset: 0 });
      expect(editor.getLinkData()).toStrictEqual(emptyLink);
    });

    test('text without link', () => {
      editor.children = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo' }, { text: 'baz', bold: true }]
        }
      ];

      Transforms.select(editor, { path: [0, 0], offset: 1 });
      expect(editor.getLinkData()).toStrictEqual(emptyLink);

      Transforms.select(editor, { path: [0, 1], offset: 0 });
      expect(editor.getLinkData()).toStrictEqual(emptyLink);
    });
  });

  describe('updateLink', () => {
    const newLink = { text: 'bar2', url: 'https://test2.com' };
    const newChildren = [
      {
        type: F.PARAGRAPH,
        children: [
          { text: 'foo' },
          { ...newLink, link: true },
          { text: 'baz', bold: true }
        ]
      }
    ];

    test('update link from middle', () => {
      editor.children = getChildren();

      Transforms.select(editor, { path: [0, 1], offset: 1 });
      editor.updateLink(newLink);
      expect(editor.children).toStrictEqual(newChildren);
    });

    test('update link from the end', () => {
      editor.children = getChildren();

      Transforms.select(editor, { path: [0, 1], offset: 3 });
      editor.updateLink(newLink);
      expect(editor.children).toStrictEqual(newChildren);
    });

    test('try to update link on non-link', () => {
      editor.children = getChildren();

      Transforms.select(editor, { path: [0, 0], offset: 1 });
      editor.updateLink(newLink);
      expect(editor.children).toStrictEqual(getChildren());
    });

    test('no selection', () => {
      editor.children = getChildren();

      Transforms.deselect(editor);
      editor.updateLink(newLink);
      expect(editor.children).toStrictEqual(getChildren());
    });
  });

  describe('removeLink', () => {
    const childrenWithRemovedLink = [
      {
        type: F.PARAGRAPH,
        children: [{ text: 'foobar' }, { text: 'baz', bold: true }]
      }
    ];

    test('remove link from middle', () => {
      editor.children = getChildren();

      Transforms.select(editor, { path: [0, 1], offset: 1 });
      editor.removeLink();
      expect(editor.children).toStrictEqual(childrenWithRemovedLink);
    });

    test('remove link from the end', () => {
      editor.children = getChildren();

      Transforms.select(editor, { path: [0, 1], offset: 3 });
      editor.removeLink();
      expect(editor.children).toStrictEqual(childrenWithRemovedLink);
    });

    test('try to remove link on non-link', () => {
      editor.children = getChildren();

      Transforms.select(editor, { path: [0, 0], offset: 1 });
      editor.removeLink();
      expect(editor.children).toStrictEqual(getChildren());
    });

    test('no selection', () => {
      editor.children = getChildren();

      Transforms.deselect(editor);
      editor.removeLink();
      expect(editor.children).toStrictEqual(getChildren());
    });
  });
});

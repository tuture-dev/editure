import { Editor, Transforms, Range } from 'tuture-slate';
import isUrl from 'is-url';
import { LINK } from 'editure-constants';

import { withBaseMark } from './base-mark';
import { EditorWithMark } from '../interfaces';
import { detectShortcut, handleMarkShortcut } from '../shortcuts';

const shortcutRegexes = [/\[([^*]+)\]\(([^*]+)\)/];

type Link = {
  text: string;
  url: string;
};

interface EditorWithLink extends EditorWithMark {
  insertLink(link: Link): void;
  getLinkData(): Link;
  updateLink(link: Link): void;
  removeLink(): void;
}

const insertLink = (editor: EditorWithLink, link: Link) => {
  if (!editor.selection) {
    return;
  }

  const { text, url } = link;

  const { anchor } = editor.selection;
  const focus = { ...anchor, offset: anchor.offset + text.length };
  const range = { anchor, focus };

  Transforms.insertText(editor, text);
  Transforms.select(editor, range);
  editor.toggleMark(LINK);

  Transforms.setNodes(editor, { url }, { match: n => n.link });
  Transforms.collapse(editor, { edge: 'end' });

  editor.toggleMark(LINK);
};

const getLinkData = (editor: EditorWithLink): Link => {
  const [match] = Editor.nodes(editor, { match: n => n.link });
  if (match) {
    const { text, url } = match[0];
    return { text, url };
  }
  return { text: '', url: '' };
};

const updateLink = (editor: EditorWithLink, link: Link) => {
  if (!editor.selection) {
    return;
  }

  const { anchor } = editor.selection;
  const { path } = anchor;

  const start = Editor.start(editor, path);
  const end = Editor.end(editor, path);
  const range = { anchor: start, focus: end };
  Transforms.select(editor, range);
  Transforms.delete(editor);

  insertLink(editor, link);
};

const removeLink = (editor: EditorWithLink) => {
  if (!editor.selection) {
    return;
  }

  const { selection } = editor;
  const [match] = Editor.nodes(editor, { match: n => n.link });

  // Select the entire link and cancel it.
  if (match) {
    const { path } = selection.anchor;
    const linkRange = {
      anchor: { path, offset: 0 },
      focus: { path, offset: match[0].text.length }
    };

    Transforms.select(editor, linkRange);
    editor.toggleMark(LINK);
    Transforms.collapse(editor, {
      edge: 'focus'
    });
  }
};

export const withLink = (editor: Editor) => {
  const e = withBaseMark(editor) as EditorWithLink;
  const { insertText, isInline } = e;

  e.isInline = element => {
    return element.link ? true : isInline(element);
  };

  e.insertText = text => {
    if (text && isUrl(text)) {
      return insertLink(e, { text, url: text });
    }

    const { selection } = e;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const matchArr = detectShortcut(e, shortcutRegexes);

      if (matchArr) {
        handleMarkShortcut(e, LINK, matchArr);
        Transforms.setNodes(e, { url: matchArr[2] }, { match: n => n.link });
      }

      return insertText(' ');
    }

    insertText(text);
  };

  e.insertLink = (link: Link) => {
    insertLink(e, link);
  };

  e.getLinkData = () => {
    return getLinkData(e);
  };

  e.updateLink = (link: Link) => {
    updateLink(e, link);
  };

  e.removeLink = () => {
    removeLink(e);
  };

  return e;
};

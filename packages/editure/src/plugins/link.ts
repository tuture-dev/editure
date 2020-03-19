import { Editor, Transforms, Range } from 'tuture-slate';
import isUrl from 'is-url';
import { LINK } from 'editure-constants';

import { EditorWithMark } from './base-mark';
import { detectShortcut, handleMarkShortcut } from '../shortcuts';

const shortcutRegexes = [/\[([^*]+)\]\(([^*]+)\)/];

type Link = {
  text: string;
  url: string;
};

export interface EditorWithLink extends EditorWithMark {
  insertLink(link: Link): void;
  getLinkData(): Link;
  selectLink(): void;
  updateLink(link: Link): void;
  removeLink(): void;
}

export const withLink = (editor: EditorWithMark) => {
  const e = editor as EditorWithLink;
  const { insertText } = e;

  e.insertText = text => {
    if (text && isUrl(text)) {
      return e.insertLink({ text, url: text });
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
    if (!e.selection) {
      return;
    }

    const { text, url } = link;

    const { anchor } = e.selection;
    const focus = { ...anchor, offset: anchor.offset + text.length };
    const range = { anchor, focus };

    Transforms.insertText(e, text);
    Transforms.select(e, range);
    e.toggleMark(LINK);

    Transforms.collapse(e, { edge: 'end' });
    e.toggleMark(LINK);

    Transforms.setNodes(e, { url }, { match: n => n.link });
  };

  e.getLinkData = () => {
    const [match] = Editor.nodes(e, { match: n => n.link });
    if (match) {
      const { text, url } = match[0];
      return { text, url };
    }
    return { text: '', url: '' };
  };

  e.selectLink = () => {
    if (!e.selection || !e.isMarkActive(LINK)) {
      return;
    }

    const { anchor } = e.selection;
    const { path } = anchor;

    const start = Editor.start(e, path);
    const end = Editor.end(e, path);
    const range = { anchor: start, focus: end };

    Transforms.select(e, range);
  };

  e.updateLink = (link: Link) => {
    if (!e.selection || !e.isMarkActive(LINK)) {
      return;
    }

    e.selectLink();
    Transforms.delete(e);

    e.insertLink(link);
  };

  e.removeLink = () => {
    if (!e.selection || !e.isMarkActive(LINK)) {
      return;
    }

    e.selectLink();
    e.toggleMark(LINK);
    Editor.removeMark(e, 'url');

    Transforms.collapse(e, { edge: 'focus' });
  };

  return e;
};

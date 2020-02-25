import { Transforms, Editor } from 'slate';
import { LINK } from 'editure-constants';

import { toggleMark } from './mark';

export const insertLink = (editor: Editor, text: string, url: string) => {
  if (!editor.selection) {
    return;
  }

  const { anchor } = editor.selection;
  const focus = { ...anchor, offset: anchor.offset + text.length };
  const range = { anchor, focus };

  Transforms.insertText(editor, text);
  Transforms.select(editor, range);
  toggleMark(editor, LINK);

  Transforms.setNodes(editor, { url }, { match: n => n.link });
  Transforms.collapse(editor, { edge: 'end' });

  toggleMark(editor, LINK);
};

export const getLinkData = (editor: Editor) => {
  const [match] = Editor.nodes(editor, { match: n => n.link });
  if (match) {
    const { text, url } = match[0];
    return { text, url };
  }
  return { text: '', url: '' };
};

export const updateLink = (editor: Editor, text: string, url: string) => {
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

  Transforms.insertText(editor, text);

  const focus = editor.selection.focus;
  const { offset: newOffset, path: newPath } = focus;
  const newRange = {
    anchor: { path: newPath, offset: newOffset - text.length },
    focus
  };
  Transforms.select(editor, newRange);
  toggleMark(editor, LINK);

  Transforms.setNodes(editor, { url }, { match: n => n.link });
  Transforms.collapse(editor, { edge: 'end' });

  toggleMark(editor, LINK);
};

export const removeLink = (editor: Editor) => {
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
    toggleMark(editor, LINK);
    Transforms.collapse(editor, {
      edge: 'focus'
    });
  }
};

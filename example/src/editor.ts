import {
  createEditor,
  defaultPlugins,
  withHistory,
  Editor,
  EditorWithBlock,
  EditorWithMark,
  EditorWithVoid,
  EditorWithContainer,
} from 'editure';
import { withPaste, withReact, ReactEditor } from 'editure-react';

import { IS_FIREFOX } from './utils/environment';
import { withImages } from './utils/image';

const plugins: Function[] = [withReact, withImages, ...defaultPlugins, withPaste, withHistory];

export type IEditor = Editor &
  EditorWithVoid &
  EditorWithBlock &
  EditorWithMark &
  EditorWithContainer &
  ReactEditor;

export const initializeEditor = () =>
  plugins.reduce(
    (augmentedEditor, plugin) => plugin(augmentedEditor),
    createEditor() as IEditor,
  ) as IEditor;

export const syncDOMSelection = (editor: IEditor) => {
  const { selection } = editor;
  const domSelection = window.getSelection();

  if (!domSelection) {
    console.log('domSelection is null');
    return;
  }

  const newDomRange = selection && ReactEditor.toDOMRange(editor, selection);

  const el = ReactEditor.toDOMNode(editor, editor);
  domSelection.removeAllRanges();

  if (newDomRange) {
    domSelection.addRange(newDomRange!);
  }

  setTimeout(() => {
    // COMPAT: In Firefox, it's not enough to create a range, you also need
    // to focus the contenteditable element too. (2016/11/16)
    if (newDomRange && IS_FIREFOX) {
      el.focus();
    }
  });
};

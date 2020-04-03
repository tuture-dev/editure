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

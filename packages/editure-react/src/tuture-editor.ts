import {
  createEditor,
  defaultPlugins,
  withHistory,
  Editor,
  EditorWithLink,
  EditorWithList,
  EditorWithBlock,
  EditorWithMark,
  EditorWithVoid,
  EditorWithContainer,
} from 'editure';
import {
  ReactEditor,
  withPaste,
  withReact,
  withExplainLayout,
  withDiffBlockVoid,
  withCommitHeaderLayout,
} from './plugins';

const plugins: Function[] = [
  withReact,
  ...defaultPlugins,
  withExplainLayout,
  withCommitHeaderLayout,
  withDiffBlockVoid,
  withPaste,
  withHistory,
];

export type IEditor = Editor &
  EditorWithList &
  EditorWithLink &
  EditorWithVoid &
  EditorWithBlock &
  EditorWithMark &
  EditorWithContainer &
  ReactEditor;

export const initializeTutureEditor = () =>
  plugins.reduce((augmentedEditor, plugin) => plugin(augmentedEditor), createEditor() as IEditor);

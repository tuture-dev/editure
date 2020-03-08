import { Editor, Transforms } from 'tuture-slate';
import { getBeforeText } from '../utils';

export const deleteLine = (editor: Editor) => {
  const { selection, deleteBackward } = editor;
  if (!selection) {
    return;
  }

  const { anchor } = selection;
  const { path } = anchor;

  const { beforeText } = getBeforeText(editor);

  if (beforeText) {
    const deletePath = path.slice(0, path.length - 1);
    const start = Editor.start(editor, deletePath);

    Transforms.select(editor, { anchor: start, focus: anchor });
    Transforms.delete(editor);
  } else {
    deleteBackward('character');
  }
};

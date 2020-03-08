import { Editor, Range, Transforms, Location } from 'tuture-slate';

type Selection = Range | null;

let lastSelection: Selection = null;

export const updateLastSelection = (selection: Selection) => {
  if (selection) {
    lastSelection = selection;
  }
};

export const selectLastPoint = (editor: Editor) => {
  if (lastSelection) {
    Transforms.select(editor, lastSelection);
  }
};

export const getSelectedString = (editor: Editor) => {
  return editor.selection ? Editor.string(editor, editor.selection) : null;
};

type SelectOptions = {
  how?: 'all' | 'upper-left' | 'lower-right';
  collapse?: 'anchor' | 'focus' | 'start' | 'end';
};

export const selectWithinBlock = (
  editor: Editor,
  format: string,
  options?: SelectOptions
) => {
  const { selection } = editor;
  if (!selection) {
    return;
  }

  const { anchor } = selection;

  const block = Editor.above(editor, {
    match: n => n.type === format
  });

  if (!block) {
    return;
  }

  const [, path] = block;
  const start = Editor.start(editor, path);
  const end = Editor.end(editor, path);

  let range: Location | null = null;
  const { how = 'all', collapse = undefined } = options || {};

  switch (how) {
    case 'all': {
      range = { anchor: start, focus: end };
      break;
    }
    case 'upper-left': {
      range = { anchor: start, focus: anchor };
      break;
    }
    case 'lower-right': {
      range = { anchor, focus: end };
      break;
    }
    default: {
    }
  }

  if (range) {
    Transforms.select(editor, range);
    if (collapse) {
      Transforms.collapse(editor, { edge: collapse });
    }
  }
};

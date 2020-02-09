import { Editor, Transforms } from "slate";

let lastSelection = null;

export const updateLastSelection = selection => {
  if (selection) {
    lastSelection = selection;
  }
};

export const selectLastPoint = editor => {
  Transforms.select(editor, lastSelection);
};

export const getSelectedString = editor => {
  return Editor.string(editor, editor.selection);
};

export const selectWithinBlock = (editor, format, { how = "all", collapse }) => {
  const { selection } = editor;
  const { anchor } = selection;

  const [, path] = Editor.above(editor, {
    match: n => n.type === format
  });
  const start = Editor.start(editor, path);
  const end = Editor.end(editor, path);

  let range = null;

  switch (how) {
    case "all": {
      range = { anchor: start, focus: end };
      break;
    }
    case "upper-left": {
      range = { anchor: start, focus: anchor };
      break;
    }
    case "lower-right": {
      range = { anchor, focus: end };
      break;
    }
    default: {
    }
  }

  Transforms.select(editor, range);

  if (collapse) {
    Transforms.collapse(editor, { edge: collapse });
  }
};

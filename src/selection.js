import { Transforms } from "slate";

let lastSelection = null;

export const updateLastSelection = selection => {
  if (selection) {
    lastSelection = selection;
  }
};

export const selectLastPoint = editor => {
  Transforms.select(editor, lastSelection);
};

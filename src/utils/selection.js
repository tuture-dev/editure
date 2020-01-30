import { Editor } from "slate";
import { updateLinkText } from "./link";

let lastSelection = null;

export const getLastSelection = () => {
  return lastSelection;
};

export const updateLastSelection = selection => {
  if (selection) {
    lastSelection = selection;
  }
  console.log("lastSelection", lastSelection);
};

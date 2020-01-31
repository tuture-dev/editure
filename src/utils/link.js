import { Transforms } from "slate";
import { toggleMark } from "../marks";
import { LINK } from "../constants";

const initialState = {
  isEditing: false,
  text: "",
  url: ""
};

const linkActionTypes = {
  START_EDIT: "start_edit",
  FINISH_EDIT: "finish_edit",
  UPDATE_TEXT: "update_text",
  UPDATE_URL: "update_url",
  CANCEL_EDIT: "cancel_edit"
};

export const startEditLink = () => {
  return { type: linkActionTypes.START_EDIT };
};

export const finishEditLink = () => {
  return { type: linkActionTypes.FINISH_EDIT };
};

export const cancelEditLink = () => {
  return { type: linkActionTypes.CANCEL_EDIT };
};

export const updateLinkText = text => {
  return { type: linkActionTypes.UPDATE_TEXT, text };
};

export const updateLinkUrl = url => {
  return { type: linkActionTypes.UPDATE_URL, url };
};

export const linkReducer = (state, action) => {
  // console.log("state", state);
  // console.log("action", action);
  switch (action.type) {
    case linkActionTypes.START_EDIT:
      return { ...state, isEditing: true };
    case linkActionTypes.FINISH_EDIT:
      return { ...initialState };
    case linkActionTypes.UPDATE_TEXT:
      return { ...state, text: action.text };
    case linkActionTypes.UPDATE_URL:
      return { ...state, url: action.url };
    case linkActionTypes.CANCEL_EDIT:
      return { ...state, isEditing: false, url: "", text: "" };
    default:
      return state;
  }
};

export const insertNewLink = (editor, text, url) => {
  const { anchor } = editor.selection;
  const focus = { ...anchor, offset: anchor.offset + text.length };
  const range = { anchor, focus };

  Transforms.insertText(editor, text);
  Transforms.select(editor, range);
  toggleMark(editor, LINK);

  Transforms.setNodes(editor, { url }, { match: n => n.link });
  Transforms.collapse(editor, { edge: "end" });

  toggleMark(editor, LINK);
};

export const updateCurrentLink = (editor, text, url) => {
  const { anchor } = editor.selection;
  const { path } = anchor;
  const focus = { path, offset: text.length };
  const range = { anchor: { path, offset: 0 }, focus };

  Transforms.select(editor, range);
  Transforms.insertText(editor, text);
  Transforms.setNodes(editor, { url }, { match: n => n.link });
  Transforms.collapse(editor, { edge: "end" });

  toggleMark(editor, LINK);
};

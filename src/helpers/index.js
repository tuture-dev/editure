import { isLinkActive, wrapLink, unwrapLink, withLinks } from "./link";
import { isCodeBlockActive, toggleCodeBlockElement } from "./codeBlock";
import { isBoldMarkActive, toggleBoldMark } from "./bold";
import { isCodeMarkActive, toggleCodeMark } from "./code";
import { isItalicMarkActive, toggleItalicMark } from "./italic";
import { isUnderlineMarkActive, toggleUnderlineMark } from "./underline";
import {
  isStrikethroughMarkActive,
  toggleStrikethroughMark
} from "./strikethrough";
import { withImages, isImageActive, insertImage, removeImage } from "./image";
import { isBlockquoteActive, toggleBlockquoteElement } from "./blockquote";
import {
  isBulletedListActive,
  toggleBulletedListElement
} from "./bulletedList";
import {
  isNumberedListActive,
  toggleNumberedListElement
} from "./numberedList";
import { isHeadingActive, toggleHeading } from "./heading";
import { insertHr, withHr } from "./hr";

const CustomEditor = {
  isLinkActive,
  wrapLink,
  unwrapLink,
  isCodeBlockActive,
  toggleCodeBlockElement,
  isBoldMarkActive,
  toggleBoldMark,
  isCodeMarkActive,
  toggleCodeMark,
  isItalicMarkActive,
  toggleItalicMark,
  isUnderlineMarkActive,
  toggleUnderlineMark,
  isStrikethroughMarkActive,
  toggleStrikethroughMark,
  isImageActive,
  insertImage,
  removeImage,
  isBlockquoteActive,
  toggleBlockquoteElement,
  isBulletedListActive,
  toggleBulletedListElement,
  isNumberedListActive,
  toggleNumberedListElement,
  isHeadingActive,
  toggleHeading,
  insertHr
};

export default CustomEditor;

export { withLinks, withImages, withHr };

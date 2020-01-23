import {
  isLinkActive,
  wrapLink,
  unwrapLink,
  withLinks,
  toggleLinkElement
} from "./link";
import { isCodeBlockActive, toggleCodeBlockElement } from "./codeBlock";
import { isBoldMarkActive, toggleBoldMark } from "./bold";
import { isCodeMarkActive, toggleCodeMark } from "./code";
import { isItalicMarkActive, toggleItalicMark } from "./italic";
import { isUnderlineMarkActive, toggleUnderlineMark } from "./underline";
import {
  isStrikethroughMarkActive,
  toggleStrikethroughMark
} from "./strikethrough";
import {
  withImages,
  isImageActive,
  insertImage,
  removeImage,
  toggleImageElement
} from "./image";
import { isBlockquoteActive, toggleBlockquoteElement } from "./blockquote";
import {
  withBulletedLists,
  isBulletedListActive,
  toggleBulletedListElement
} from "./bulletedList";
import {
  withNumberedLists,
  isNumberedListActive,
  toggleNumberedListElement
} from "./numberedList";
import { withHeadings, isHeadingActive, toggleHeading } from "./heading";
import { isHrActive, insertHr, withHr } from "./hr";
import { withShortcuts } from "./shortcut";

const CustomEditor = {
  isLinkActive,
  wrapLink,
  unwrapLink,
  toggleLinkElement,
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
  toggleImageElement,
  isBlockquoteActive,
  toggleBlockquoteElement,
  isBulletedListActive,
  toggleBulletedListElement,
  isNumberedListActive,
  toggleNumberedListElement,
  isHeadingActive,
  toggleHeading,
  insertHr,
  isHrActive
};

export default CustomEditor;

export {
  withBulletedLists,
  withNumberedLists,
  withHeadings,
  withLinks,
  withImages,
  withHr,
  withShortcuts
};

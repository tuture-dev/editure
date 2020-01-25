import { isLinkActive, wrapLink, unwrapLink, withLinks, toggleLinkElement } from "./link";
import { withImages, isImageActive, insertImage } from "./image";
import withHr from "./hr";
import withShortcuts from "./shortcut";
import withSoftBreak from "./softBreak";

const CustomEditor = {
  isLinkActive,
  wrapLink,
  unwrapLink,
  toggleLinkElement,
  isImageActive,
  insertImage
};

export default CustomEditor;

export const customPlugins = [
  withLinks,
  withImages,
  withHr,
  withShortcuts,
  withSoftBreak
];

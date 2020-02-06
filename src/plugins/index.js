import { withLinks } from "./link";
import { withImages } from "./image";
import withHr from "./hr";
import withShortcuts from "./shortcuts";
import { withList } from "./list";
import { withCodeBlock } from "./codeBlock";
import { withBlockquote } from "./blockquote";
import { withPaste } from "./paste";

export default [
  withPaste,
  withLinks,
  withImages,
  withHr,
  withShortcuts,
  withList,
  withCodeBlock,
  withBlockquote
];

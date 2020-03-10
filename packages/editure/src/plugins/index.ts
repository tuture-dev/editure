import withBold from './bold';
import withItalic from './italic';
import withInlineCode from './inline-code';
import withStrikethrough from './strikethrough';
import withLink from './link';

import withParagraph from './paragraph';
import withList from './list';
import withHeading from './heading';
import withCodeBlock from './code-block';
import withBlockquote from './block-quote';
import withNote from './note';
import withHr from './hr';

import withPaste from './paste';

export {
  // Mark plugins.
  withBold,
  withItalic,
  withInlineCode,
  withStrikethrough,
  withLink,
  // Block plugins.
  withParagraph,
  withList,
  withHeading,
  withCodeBlock,
  withBlockquote,
  withNote,
  withHr,
  // Misc.
  withPaste
};

export const defaultPlugins = [
  // Mark plugins.
  withBold,
  withItalic,
  withInlineCode,
  withStrikethrough,
  withLink,

  // Block plugins.
  withParagraph,
  withList,
  withHeading,
  withCodeBlock,
  withBlockquote,
  withNote,
  withHr,

  // Misc.
  withPaste
];

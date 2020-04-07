import { withHistory } from 'tuture-slate-history';

import { withBold } from './bold';
import { withItalic } from './italic';
import { withInlineCode } from './inline-code';
import { withStrikethrough } from './strikethrough';
import { EditorWithLink, withLink } from './link';

import { EditorWithMark, withBaseMark } from './base-mark';
import { EditorWithBlock, withBaseBlock } from './base-block';
import { EditorWithContainer, withBaseContainer } from './base-container';
import { EditorWithVoid, withVoid } from './void';

import { withParagraph } from './paragraph';
import { EditorWithList, withList } from './list';
import { withHeading } from './heading';
import { withCodeBlock } from './code-block';
import { withBlockquote } from './block-quote';
import { withNote } from './note';
import { withHr } from './hr';

export {
  withHistory,
  withBaseMark,
  withBaseBlock,
  withBaseContainer,
  withBold,
  withItalic,
  withInlineCode,
  withStrikethrough,
  withLink,
  withParagraph,
  withList,
  withHeading,
  withCodeBlock,
  withBlockquote,
  withNote,
  withHr,
  withVoid,
  EditorWithLink,
  EditorWithList,
  EditorWithMark,
  EditorWithBlock,
  EditorWithContainer,
  EditorWithVoid,
};

export const defaultPlugins = [
  withParagraph,
  withHr,
  withVoid,

  // Mark plugins.
  withBaseMark,
  withBold,
  withItalic,
  withInlineCode,
  withStrikethrough,
  withLink,

  // Block plugins.
  withBaseBlock,
  withList,
  withHeading,

  // Container plugins.
  withBaseContainer,
  withBlockquote,
  withNote,
  withCodeBlock,
];

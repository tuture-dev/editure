import withLinks from './link';
import withHr from './hr';
import withShortcuts from './shortcuts';
import withList from './list';
import withCodeBlock from './codeBlock';
import withBlockquote from './blockquote';
import withPaste from './paste';

export {
  withPaste,
  withLinks,
  withHr,
  withShortcuts,
  withList,
  withCodeBlock,
  withBlockquote
};

export const defaultPlugins = [
  withPaste,
  withLinks,
  withHr,
  withShortcuts,
  withList,
  withCodeBlock,
  withBlockquote
];

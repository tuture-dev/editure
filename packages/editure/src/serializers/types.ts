import { Element, Text } from 'slate';

export type MarkDecorator = (node: Text) => Text;
export type BlockConverter = (node: Element) => string;

import { Element, Text } from 'tuture-slate';

export type MarkDecorator = (node: Text) => Text;
export type BlockConverter = (node: Element) => string;

export type MarkDecoratorGroup = { [format: string]: MarkDecorator };
export type BlockConverterGroup = { [format: string]: BlockConverter };

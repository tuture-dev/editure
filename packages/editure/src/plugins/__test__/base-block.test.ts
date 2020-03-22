import { createEditor, Editor, Transforms } from 'tuture-slate';
import * as F from 'editure-constants';

import { withBaseBlock } from '../base-block';
import { reset } from './utils';

const BLOCK_TYPE = 'test-block';

describe('withBaseBlock', () => {
  const blockNode = {
    type: BLOCK_TYPE,
    attr: 'test',
    children: [{ text: 'bar' }],
  };

  const editor = withBaseBlock(createEditor());
  reset(editor);

  afterEach(() => reset(editor));

  describe('isBlockActive', () => {
    test('regular', () => {
      editor.children = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo' }],
        },
        blockNode,
      ];

      Transforms.select(editor, { path: [1, 0], offset: 1 });
      expect(editor.isBlockActive(BLOCK_TYPE)).toBe(true);

      Transforms.select(editor, { path: [0, 0], offset: 2 });
      expect(editor.isBlockActive(BLOCK_TYPE)).toBe(false);
    });

    test('no selection', () => {
      editor.children = [blockNode];

      editor.selection = null;
      expect(editor.isBlockActive(BLOCK_TYPE)).toBe(false);
    });
  });

  describe('toggleBlock', () => {
    const blockProps = { attr: 'test' };

    test('activate block', () => {
      editor.children = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo' }],
        },
      ];

      Transforms.select(editor, { path: [0, 0], offset: 1 });
      editor.toggleBlock(BLOCK_TYPE, blockProps);

      const nodes = [
        {
          type: BLOCK_TYPE,
          children: [{ text: 'foo' }],
          ...blockProps,
        },
      ];

      expect(editor.children).toStrictEqual(nodes);
    });

    test('deactivate block', () => {
      editor.children = [
        {
          type: BLOCK_TYPE,
          children: [{ text: 'foo' }],
          ...blockProps,
        },
      ];

      Transforms.select(editor, { path: [0, 0], offset: 1 });
      editor.toggleBlock(BLOCK_TYPE, blockProps);

      const nodes = [
        {
          type: F.PARAGRAPH,
          children: [{ text: 'foo' }],
        },
      ];

      expect(editor.children).toStrictEqual(nodes);
    });
  });

  describe('updateBlock', () => {
    test('should update fields with correct block type', () => {
      editor.children = [blockNode];

      Transforms.select(editor, { path: [0, 0], offset: 0 });
      editor.updateBlock(BLOCK_TYPE, { attr: 'test2' });

      expect(editor.children).toStrictEqual([{ ...blockNode, attr: 'test2' }]);
    });

    test('should do nothing if block type is not matched', () => {
      editor.children = [blockNode];

      Transforms.select(editor, { path: [0, 0], offset: 0 });
      editor.updateBlock('other-block', { attr: 'test2' });

      expect(editor.children).toStrictEqual([blockNode]);
    });
  });

  describe('detectBlockFormat', () => {
    test('should detect given format correctly', () => {
      editor.children = [blockNode];

      Transforms.select(editor, { path: [0, 0], offset: 0 });
      const format = editor.detectBlockFormat(['other-1', BLOCK_TYPE, 'other-2']);

      expect(format).toBe(BLOCK_TYPE);
    });

    test('should return null if no matched format found', () => {
      editor.children = [blockNode];

      Transforms.select(editor, { path: [0, 0], offset: 0 });
      const format = editor.detectBlockFormat(['other-1', 'other-2']);

      expect(format).toBe(null);
    });
  });
});

import { createEditor, Range } from 'tuture-slate';
import * as F from 'editure-constants';

import withHr from '../hr';
import { reset, inputText } from './utils';

describe('withHr', () => {
  const editor = withHr(createEditor());
  reset(editor);

  afterEach(() => reset(editor));

  describe('insertBreak', () => {
    test('regular (syntax 1)', () => {
      inputText(editor, '---\n');

      const nodes = [
        { type: F.HR, children: [{ text: '' }] },
        { type: F.PARAGRAPH, children: [{ text: '' }] }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('regular (syntax 2)', () => {
      inputText(editor, '___\n');

      const nodes = [
        { type: F.HR, children: [{ text: '' }] },
        { type: F.PARAGRAPH, children: [{ text: '' }] }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });

    test('regular (syntax 3)', () => {
      inputText(editor, '***\n');

      const nodes = [
        { type: F.HR, children: [{ text: '' }] },
        { type: F.PARAGRAPH, children: [{ text: '' }] }
      ];

      expect(editor.children).toStrictEqual(nodes);
      expect(Range.isCollapsed(editor.selection!)).toBe(true);
    });
  });
});

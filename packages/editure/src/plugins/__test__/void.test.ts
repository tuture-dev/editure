import { createEditor } from 'tuture-slate';
import * as F from 'editure-constants';

import { withVoid } from '../void';
import { reset, inputText } from './utils';

describe('withVoid', () => {
  const VOID_TYPE = 'something-void';
  const props = { attr: 'test' };

  const editor = withVoid(createEditor());
  reset(editor);

  afterEach(() => reset(editor));

  describe('insertVoid', () => {
    test('insert in empty line', () => {
      editor.insertVoid(VOID_TYPE, props);

      const nodes = [
        { type: VOID_TYPE, ...props, children: [{ text: '' }] },
        { type: F.PARAGRAPH, children: [{ text: '' }] },
      ];

      const point = { path: [1, 0], offset: 0 };

      expect(editor.children).toStrictEqual(nodes);
      expect(editor.selection).toStrictEqual({ anchor: point, focus: point });
    });
  });

  test('insert in non-empty line', () => {
    inputText(editor, 'foo');
    editor.insertVoid(VOID_TYPE, props);

    const nodes = [
      { type: F.PARAGRAPH, children: [{ text: 'foo' }] },
      { type: VOID_TYPE, ...props, children: [{ text: '' }] },
      { type: F.PARAGRAPH, children: [{ text: '' }] },
    ];

    const point = { path: [2, 0], offset: 0 };

    expect(editor.children).toStrictEqual(nodes);
    expect(editor.selection).toStrictEqual({ anchor: point, focus: point });
  });
});

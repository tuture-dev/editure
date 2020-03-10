import { Transforms, Editor } from 'tuture-slate';

export function reset(editor: Editor) {
  editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
  Transforms.select(editor, [0, 0]);
  Transforms.collapse(editor, { edge: 'start' });
}

export function inputText(editor: Editor, text: string) {
  text.split('').forEach(c => {
    if (c === '\n') {
      editor.insertBreak();
    } else {
      editor.insertText(c);
    }

    Editor.normalize(editor);
  });
}

export function deleteNTimes(editor: Editor, times: number) {
  [...Array(times)].forEach(() => {
    editor.deleteBackward('character');
    Editor.normalize(editor);
  });
}

import { createEditor, Transforms, Editor } from 'tuture-slate';

import { EditorWithBlock, withBaseBlock } from '../base-block';
import { EditorWithContainer, withBaseContainer } from '../base-container';
import { EditorWithMark, withBaseMark } from '../base-mark';
import { withParagraph } from '../paragraph';

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

type Plugin<S, T> = (editor: S) => T;
type MarkPlugin = Plugin<EditorWithMark, EditorWithMark>;
type BlockPlugin = Plugin<EditorWithBlock, EditorWithBlock>;
type ContainerPlugin = Plugin<EditorWithContainer, EditorWithContainer>;

type EditorConfiguration = {
  marks?: MarkPlugin[];
  blocks?: BlockPlugin[];
  containers?: ContainerPlugin[];
};

export function configureEditor(config?: EditorConfiguration) {
  const plugins: Function[] = [withParagraph];

  if (config) {
    const { marks, blocks, containers } = config;

    if (marks && marks.length > 0) {
      plugins.push(withBaseMark, ...marks);
    }

    if (blocks && blocks.length > 0) {
      plugins.push(withBaseBlock, ...blocks);
    }

    if (containers && containers.length > 0) {
      if (!blocks) {
        // Ensure that withBaseBlock plugin is added.
        plugins.push(withBaseBlock);
      }

      plugins.push(withBaseContainer, ...containers);
    }
  }

  return plugins.reduce((editor, plugin) => plugin(editor), createEditor());
}

export function createEditorWithMark(editor?: Editor) {
  return withBaseMark(editor || createEditor());
}

export function createEditorWithBlock(editor?: Editor) {
  return withBaseBlock(editor || createEditor());
}

export function createEditorWithContainer(editor?: EditorWithBlock) {
  return withBaseContainer(editor || createEditorWithBlock());
}

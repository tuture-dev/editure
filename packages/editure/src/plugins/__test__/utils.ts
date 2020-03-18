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

type IEditor = Editor | EditorWithMark | EditorWithBlock | EditorWithContainer;

// interface Plugin<S, T> {
//   (editor: S): T
// }

type Plugin<S, T> = (editor: S) => T;
type NormalPlugin = Plugin<Editor, Editor>;
type MarkPlugin = Plugin<EditorWithMark, EditorWithMark>;
type BlockPlugin = Plugin<EditorWithBlock, EditorWithBlock>;
type ContainerPlugin = Plugin<EditorWithContainer, EditorWithContainer>;

type AllowedPlugin =
  | NormalPlugin
  | MarkPlugin
  | BlockPlugin
  | ContainerPlugin
  | typeof withBaseMark
  | typeof withBaseBlock
  | typeof withBaseContainer;

// type MarkPlugin = (editor: EditorWithMark) => EditorWithMark;

// type BlockPlugin = (editor: EditorWithBlock) => EditorWithBlock;

// type ContainerPlugin = (editor: EditorWithContainer) => EditorWithContainer;

// type Plugin = NormalPlugin | MarkPlugin | BlockPlugin | ContainerPlugin;
// type Plugin = <T extends Editor>(editor: T) => T;

type EditorConfiguration = {
  marks?: MarkPlugin[];
  blocks?: BlockPlugin[];
  containers?: ContainerPlugin[];
};

export function configureEditor(config?: EditorConfiguration) {
  const plugins: Array<AllowedPlugin> = [withParagraph];

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

  return plugins.reduce((editor, plugin) => {
    // TODO: fix the typecheck of plugins
    return (plugin as any)(editor);
  }, createEditor());
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

import { Editor, Transforms } from "slate";
import { getBeforeText } from "./utils";

export const deleteLine = editor => {
  // 具体就是遍历此代码块/引用的  children 数组
  // 找到最近的一个 \n 字符，然后删除此 \n 之后的字符到光标此时选中的字符
  const { selection, deleteBackward } = editor;
  const { anchor } = selection;
  const { path } = anchor;

  const { beforeText } = getBeforeText(editor);

  if (beforeText) {
    const deletePath = path.slice(0, path.length - 1);
    const start = Editor.start(editor, deletePath);

    Transforms.select(editor, { anchor: start, focus: anchor });
    Transforms.delete(editor);
  } else {
    deleteBackward();
  }
};

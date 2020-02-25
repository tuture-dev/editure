import { Editor, Node, Location } from 'slate';

export const getBeforeText = (editor: Editor) => {
  if (!editor.selection) {
    return {};
  }

  const { anchor } = editor.selection;
  const match = Editor.above(editor, {
    match: n => Editor.isBlock(editor, n)
  });

  const path = match ? match[1] : [];
  const start = Editor.start(editor, path);
  const range = { anchor, focus: start };
  const beforeText = Editor.string(editor, range);

  return { beforeText, range };
};

export const getLineText = (editor: Editor) => {
  const match = Editor.above(editor, {
    match: n => Editor.isBlock(editor, n)
  });

  const path = match ? match[1] : [];
  const start = Editor.start(editor, path);
  const end = Editor.end(editor, path);
  const range = { anchor: start, focus: end };
  const wholeLineText = Editor.string(editor, range);

  return { wholeLineText, range };
};

export const getChildrenText = (children: Node[], path: Location): string => {
  let childrenItem = children;
  let i = 0;
  for (; i < path.length - 1; i++) {
    childrenItem = childrenItem[path[i]].children;
  }

  return childrenItem[path[i]].text;
};

export const compareNode = (nodeOnePath: Location, nodeTwoPath: Location) => {
  if (nodeOnePath.length !== nodeTwoPath.length) {
    return false;
  }

  for (let i = 0; i < nodeOnePath.length; i++) {
    if (nodeOnePath[i] !== nodeTwoPath[i]) {
      return false;
    }
  }

  return true;
};

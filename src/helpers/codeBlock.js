import { Transforms, Editor } from "slate";

export const isCodeBlockActive = editor => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === "code-block"
  });

  return !!match;
};

export const toggleCodeBlockElement = editor => {
  const isActive = isCodeBlockActive(editor);

  if (isActive) {
    Transforms.setNodes(
      editor,
      {
        type: null
      },
      {
        match: n => Editor.isBlock(editor, n)
      }
    );
  } else {
    Transforms.wrapNodes(
      editor,
      {
        type: "code-block"
      },
      {
        match: n => Editor.isBlock(editor, n)
      }
    );
  }
};

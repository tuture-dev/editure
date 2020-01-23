import { Transforms, Editor, Element } from "slate";

export const isCodeBlockActive = editor => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === "code-block"
  });

  return !!match;
};

export const toggleCodeBlockElement = editor => {
  const isActive = isCodeBlockActive(editor);

  if (isActive) {
    Transforms.unwrapNodes(editor, {
      match: n => {
        if (
          Editor.isBlock(editor, n) &&
          Element.matches(n, { type: "code-block" })
        ) {
          return true;
        }

        return false;
      }
    });
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

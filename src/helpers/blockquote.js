import { Transforms, Editor, Element } from "slate";

export const isBlockquoteActive = editor => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === "block-quote"
  });

  return !!match;
};

export const toggleBlockquoteElement = editor => {
  const isActive = isBlockquoteActive(editor);

  if (isActive) {
    Transforms.unwrapNodes(editor, {
      match: n => {
        if (
          Editor.isBlock(editor, n) &&
          Element.matches(n, { type: "block-quote" })
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
        type: "block-quote"
      },
      {
        match: n => Editor.isBlock(editor, n)
      }
    );
  }
};

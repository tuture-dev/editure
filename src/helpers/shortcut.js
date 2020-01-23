import { Range, Editor, Transforms, Point } from "slate";

import { toggleCodeMark } from "./code";
import { toggleBoldMark } from "./bold";
import { toggleItalicMark } from "./italic";
import { toggleStrikethroughMark } from "./strikethrough";
import { toggleUnderlineMark } from "./underline";

const UNARY_SHORTCUTS = {
  "*": "list-item",
  "-": "list-item",
  "+": "list-item",
  ">": "block-quote",
  "#": "heading-one",
  "##": "heading-two",
  "###": "heading-three",
  "####": "heading-four",
  "#####": "heading-five",
  "######": "heading-six",
  "```": "code-block",
  "---": "hr"
};

const BINARY_SHORTCUTS = [
  "code",
  "bold",
  "italic",
  "strikethrough",
  "underline"
];

const BINARY_SHORTCUTS_REGEX = [
  "`([^`]+)`",
  "\\*\\*([^\\*]+)\\*\\*",
  "\\*([^\\*]+)\\*",
  "~~([^~]+)~~",
  "<u>([^(<u>)|(</u>)]+)</u>"
];

const toggleMark = (editor, format) => {
  switch (format) {
    case "code": {
      toggleCodeMark(editor);
      break;
    }

    case "bold": {
      toggleBoldMark(editor);
      break;
    }

    case "italic": {
      toggleItalicMark(editor);
      break;
    }

    case "strikethrough": {
      toggleStrikethroughMark(editor);
      break;
    }

    case "underline": {
      toggleUnderlineMark(editor);
      break;
    }

    default: {
    }
  }
};

export const withShortcuts = editor => {
  const { deleteBackward, insertText } = editor;

  editor.insertText = text => {
    const { selection, children } = editor;

    if (text === " " && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const match = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n)
      });

      const path = match ? match[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range);

      const type = UNARY_SHORTCUTS[beforeText];

      if (type) {
        Transforms.select(editor, range);
        Transforms.delete(editor);
        Transforms.setNodes(
          editor,
          { type },
          { match: n => Editor.isBlock(editor, n) }
        );

        if (type === "list-item") {
          const list = { type: "bulleted-list", children: [] };
          Transforms.wrapNodes(editor, list, {
            match: n => n.type === "list-item"
          });
        }

        return;
      }

      let matchArr;
      let regex;
      let format;

      BINARY_SHORTCUTS_REGEX.map((regexStr, index) => {
        if (format) {
          return;
        }

        regex = new RegExp(regexStr, "g");

        if (regex.test(beforeText)) {
          format = BINARY_SHORTCUTS[index];
        }
      });

      if (format) {
        matchArr = beforeText.match(regex);
      }

      if (matchArr) {
        const targetTextWithMdTag = matchArr[matchArr.length - 1];
        const chilrenText =
          children[anchor.path[0]].children[anchor.path[1]].text;

        // 删除逻辑
        const deleteRangeStartOffset =
          chilrenText.length - targetTextWithMdTag.length;
        const deleteRangeEndOffset = chilrenText.length;

        const deleteRangeStart = { ...anchor, offset: deleteRangeStartOffset };
        const deleteRangeEnd = { ...anchor, offset: deleteRangeEndOffset };

        const deleteRange = { anchor: deleteRangeStart, focus: deleteRangeEnd };
        Transforms.select(editor, deleteRange);
        Transforms.delete(editor);

        // 插入新的内容
        const targetTextArr = regex.exec(targetTextWithMdTag);
        const targetInsertText = targetTextArr[1];
        insertText(targetInsertText);

        // 开始对新内容进行标注
        const needMarkRangeStartOffset = deleteRangeStartOffset;
        const needMarkRangeEndOffset =
          needMarkRangeStartOffset + targetInsertText.length;
        const needMarkRangeStart = {
          ...anchor,
          offset: needMarkRangeStartOffset
        };
        const needMarkRangeEnd = { ...anchor, offset: needMarkRangeEndOffset };

        const needMarkRange = {
          anchor: needMarkRangeStart,
          focus: needMarkRangeEnd
        };

        Transforms.select(editor, needMarkRange);
        toggleMark(editor, format);

        Transforms.collapse(editor, {
          edge: "end"
        });

        insertText(text);
        const { focus } = editor.selection;
        Transforms.select(editor, {
          anchor: { path: focus.path, offset: focus.offset - 1 },
          focus
        });
        toggleMark(editor, format);

        Transforms.collapse(editor, {
          edge: "end"
        });

        return;
      }
    }
    insertText(text);
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n)
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          block.type !== "paragraph" &&
          Point.equals(selection.anchor, start)
        ) {
          Transforms.setNodes(editor, { type: "paragraph" });

          if (block.type === "list-item") {
            Transforms.unwrapNodes(editor, {
              match: n => n.type === "bulleted-list"
            });
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
};

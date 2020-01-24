import { Range, Editor, Transforms, Point } from "slate";

import { toggleCodeMark } from "./code";
import { toggleBoldMark } from "./bold";
import { toggleItalicMark } from "./italic";
import { toggleStrikethroughMark } from "./strikethrough";
import { toggleUnderlineMark } from "./underline";

const UNARY_SHORTCUTS = [
  "code",
  "bold",
  "italic",
  "strikethrough",
  "underline"
];
const BINARY_SHORTCUTS = [
  "bulleted-list",
  "bulleted-list",
  "bulleted-list",
  "numbered-list",
  "block-quote",
  "heading-one",
  "heading-two",
  "heading-three",
  "heading-four",
  "heading-five",
  "heading-six",
  "code-block",
  "hr"
];

const SHORTCUTS = [...UNARY_SHORTCUTS, ...BINARY_SHORTCUTS];

const SHORTCUTS_REGEX = [
  "`([^`]+)`",
  "\\*\\*([^\\*]+)\\*\\*",
  "\\*([^\\*]+)\\*",
  "~~([^~]+)~~",
  "<u>([^(<u>)|(</u>)]+)</u>",
  "^\\*$",
  "^-$",
  "^\\+$",
  "^[0-9]\\.$",
  "^>$",
  "^#$",
  "^##$",
  "^###$",
  "^####$",
  "^#####$",
  "^######$",
  "^```([a-zA-Z]*)$",
  "^---$"
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

      let matchArr;
      let regex;
      let format;

      SHORTCUTS_REGEX.map((regexStr, index) => {
        if (format) {
          return;
        }

        console.log("regexStr", regexStr);
        regex = new RegExp(regexStr, "g");

        if (regex.test(beforeText)) {
          format = SHORTCUTS[index];
        }
      });

      if (format) {
        matchArr = beforeText.match(regex);
      }

      if (BINARY_SHORTCUTS.includes(format)) {
        let nodeProp = { type: format };

        Transforms.select(editor, range);
        Transforms.delete(editor);

        if (format === "code-block") {
          const targetTextWithMdTag = matchArr[matchArr.length - 1];
          const targetTextArr = regex.exec(targetTextWithMdTag);
          const targetLang = targetTextArr[1];

          nodeProp = { ...nodeProp, lang: targetLang };
        }

        if (format === "bulleted-list" || format === "numbered-list") {
          nodeProp = { ...nodeProp, type: "list-item" };
        }

        Transforms.setNodes(
          editor,
          { ...nodeProp },
          { match: n => Editor.isBlock(editor, n) }
        );

        if (format === "bulleted-list" || format === "numbered-list") {
          const list = { type: format, children: [] };
          Transforms.wrapNodes(editor, list, {
            match: n => n.type === "list-item"
          });
        }

        return;
      }

      if (UNARY_SHORTCUTS.includes(format)) {
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

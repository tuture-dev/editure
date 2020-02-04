import {
  BLOCK_QUOTE,
  H1,
  H2,
  H3,
  H4,
  H5,
  HR,
  NOTE,
  IMAGE,
  NUMBERED_LIST,
  BULLETED_LIST,
  PARAGRAPH,
  CODE_BLOCK,
  CODE_LINE,
  LIST_ITEM
} from "../../constants";
import { serializeToHtml as serialize } from "../html";

describe("html serialization", () => {
  describe("pure mark", () => {
    test("bare text", () => {
      const node = { text: "test" };
      const output = "test";
      expect(serialize(node)).toBe(output);
    });

    test("bold", () => {
      const node = { bold: true, text: "test" };
      const output = "<strong>test</strong>";
      expect(serialize(node)).toBe(output);
    });

    test("italic", () => {
      const node = { italic: true, text: "test" };
      const output = "<em>test</em>";
      expect(serialize(node)).toBe(output);
    });

    test("code", () => {
      const node = { code: true, text: "test" };
      const output = "<code>test</code>";
      expect(serialize(node)).toBe(output);
    });

    test("strikethrough", () => {
      const node = { strikethrough: true, text: "test" };
      const output = '<span style="text-decoration: line-through">test</span>';
      expect(serialize(node)).toBe(output);
    });

    test("underline", () => {
      const node = { underline: true, text: "test" };
      const output = "<u>test</u>";
      expect(serialize(node)).toBe(output);
    });

    test("link", () => {
      const node = { link: true, text: "test", url: "https://test.com" };
      const output = `<a href="${node.url}">test</a>`;
      expect(serialize(node)).toBe(output);
    });

    test("sequential marks in a paragraph", () => {
      const node = {
        type: PARAGRAPH,
        children: [
          { text: "This is " },
          { bold: true, text: "bold" },
          { text: " and " },
          { italic: true, text: "italic" },
          { text: " and " },
          { code: true, text: "code" },
          { text: "." }
        ]
      };
      const output =
        "<p>This is <strong>bold</strong> and <em>italic</em> and <code>code</code>.</p>";
      expect(serialize(node)).toBe(output);
    });
  });

  describe("mixed marks", () => {
    test("bold + italic", () => {
      const node = { bold: true, italic: true, text: "test" };
      const output = "<em><strong>test</strong></em>";
      expect(serialize(node)).toBe(output);
    });

    test("bold + code", () => {
      const node = { bold: true, code: true, text: "test" };
      const output = "<strong><code>test</code></strong>";
      expect(serialize(node)).toBe(output);
    });

    test("bold + underline", () => {
      const node = { bold: true, underline: true, text: "test" };
      const output = "<u><strong>test</strong></u>";
      expect(serialize(node)).toBe(output);
    });

    test("bold + strikethrough", () => {
      const node = { bold: true, strikethrough: true, text: "test" };
      const output =
        '<span style="text-decoration: line-through"><strong>test</strong></span>';
      expect(serialize(node)).toBe(output);
    });

    test("bold + link", () => {
      const node = { bold: true, link: true, url: "https://test.com", text: "test" };
      const output = `<a href="${node.url}"><strong>test</strong></a>`;
      expect(serialize(node)).toBe(output);
    });

    test("bold + italic + code + underline + strikethrough + link", () => {
      const node = {
        bold: true,
        italic: true,
        code: true,
        underline: true,
        link: true,
        strikethrough: true,
        url: "https://test.com",
        text: "test"
      };
      const output = `<a href="${node.url}"><u><span style=\"text-decoration: line-through\"><em><strong><code>test</code></strong></em></span></u></a>`;
      expect(serialize(node)).toBe(output);
    });

    test("sequential mixed marks", () => {
      const node = {
        type: PARAGRAPH,
        children: [
          { text: "This is " },
          { bold: true, italic: true, text: "mixed" },
          { text: " and " },
          { underline: true, strikethrough: true, text: "mixed" },
          { text: " and " },
          { code: true, link: true, url: "https://test.com", text: "code" },
          { text: "." }
        ]
      };
      const output =
        '<p>This is <em><strong>mixed</strong></em> and <u><span style="text-decoration: line-through">mixed</span></u> and <a href="https://test.com"><code>code</code></a>.</p>';
      expect(serialize(node)).toBe(output);
    });
  });

  describe("pure block", () => {
    test("paragraph", () => {
      const node = { type: PARAGRAPH, children: [{ text: "test" }] };
      const output = "<p>test</p>";
      expect(serialize(node)).toBe(output);
    });

    test("h1", () => {
      const node = { type: H1, children: [{ text: "test" }] };
      const output = "<h1>test</h1>";
      expect(serialize(node)).toBe(output);
    });

    test("h2", () => {
      const node = { type: H2, children: [{ text: "test" }] };
      const output = "<h2>test</h2>";
      expect(serialize(node)).toBe(output);
    });

    test("h3", () => {
      const node = { type: H3, children: [{ text: "test" }] };
      const output = "<h3>test</h3>";
      expect(serialize(node)).toBe(output);
    });

    test("h4", () => {
      const node = { type: H4, children: [{ text: "test" }] };
      const output = "<h4>test</h4>";
      expect(serialize(node)).toBe(output);
    });

    test("h5", () => {
      const node = { type: H5, children: [{ text: "test" }] };
      const output = "<h5>test</h5>";
      expect(serialize(node)).toBe(output);
    });

    test("hr", () => {
      const node = { type: HR, children: [{ text: "" }] };
      const output = "<hr />";
      expect(serialize(node)).toBe(output);
    });

    test("image", () => {
      const node = {
        type: IMAGE,
        url: "https://test.com/image.png",
        children: [{ text: "" }]
      };
      const output = `<img src="${node.url}" alt="" />`;
      expect(serialize(node)).toBe(output);
    });

    test("blockquote (single line)", () => {
      const node = {
        type: BLOCK_QUOTE,
        children: [{ type: PARAGRAPH, children: [{ text: "test" }] }]
      };
      const output = "<blockquote><p>test</p></blockquote>";
      expect(serialize(node)).toBe(output);
    });

    test("blockquote (multiple lines)", () => {
      const node = {
        type: BLOCK_QUOTE,
        children: [
          { type: PARAGRAPH, children: [{ text: "foo" }] },
          { type: PARAGRAPH, children: [{ text: "bar" }] }
        ]
      };
      const output = "<blockquote><p>foo</p><p>bar</p></blockquote>";
      expect(serialize(node)).toBe(output);
    });

    test("note (single line)", () => {
      const node = {
        type: NOTE,
        level: "info",
        children: [{ type: PARAGRAPH, children: [{ text: "test" }] }]
      };

      // Should degrade to blockquote.
      const output = "<blockquote><p>test</p></blockquote>";
      expect(serialize(node)).toBe(output);
    });

    test("note (multiple lines)", () => {
      const node = {
        type: NOTE,
        level: "warning",
        children: [
          { type: PARAGRAPH, children: [{ text: "foo" }] },
          { type: PARAGRAPH, children: [{ text: "bar" }] }
        ]
      };

      // Should degrade to blockquote.
      const output = "<blockquote><p>foo</p><p>bar</p></blockquote>";
      expect(serialize(node)).toBe(output);
    });

    test("code-block (single line)", () => {
      const node = {
        type: CODE_BLOCK,
        lang: "",
        children: [{ type: CODE_LINE, children: [{ text: "test" }] }]
      };
      const output = "<pre><code>test</code></pre>";
      expect(serialize(node)).toBe(output);
    });

    test("code-block (multiple lines)", () => {
      const node = {
        type: CODE_BLOCK,
        lang: "",
        children: [
          { type: CODE_LINE, children: [{ text: "foo" }] },
          { type: CODE_LINE, children: [{ text: "bar" }] }
        ]
      };
      const output = "<pre><code>foo</code><code>bar</code></pre>";
      expect(serialize(node)).toBe(output);
    });

    test("bulleted-list", () => {
      const node = {
        type: BULLETED_LIST,
        children: [
          { type: LIST_ITEM, children: [{ text: "foo" }] },
          { type: LIST_ITEM, children: [{ text: "bar" }] }
        ]
      };
      const output = "<ul><li>foo</li><li>bar</li></ul>";
      expect(serialize(node)).toBe(output);
    });

    test("numbered-list", () => {
      const node = {
        type: NUMBERED_LIST,
        children: [
          { type: LIST_ITEM, children: [{ text: "foo" }] },
          { type: LIST_ITEM, children: [{ text: "bar" }] }
        ]
      };
      const output = "<ol><li>foo</li><li>bar</li></ol>";
      expect(serialize(node)).toBe(output);
    });

    test("sequential blocks", () => {
      const node = {
        children: [
          { type: H1, children: [{ text: "title" }] },
          { type: PARAGRAPH, children: [{ text: "paragraph1" }] },
          {
            type: BLOCK_QUOTE,
            children: [{ type: PARAGRAPH, children: [{ text: "blockquote" }] }]
          },
          {
            type: CODE_BLOCK,
            lang: "javascript",
            children: [
              { type: CODE_LINE, children: [{ text: "const a = 1;" }] },
              { type: CODE_LINE, children: [{ text: "console.log('hello');" }] }
            ]
          }
        ]
      };
      const output =
        "<h1>title</h1><p>paragraph1</p><blockquote><p>blockquote</p></blockquote><pre><code>const a = 1;</code><code>console.log('hello');</code></pre>";

      expect(serialize(node)).toBe(output);
    });
  });

  describe("nested blocks", () => {
    test("blockquote as a container", () => {
      const node = {
        type: BLOCK_QUOTE,
        children: [
          { type: PARAGRAPH, children: [{ text: "This is some code:" }] },
          {
            type: CODE_BLOCK,
            lang: "typescript",
            children: [
              { type: CODE_LINE, children: [{ text: "const a = 1;" }] },
              { type: CODE_LINE, children: [{ text: "console.log('hello');" }] }
            ]
          },
          { type: PARAGRAPH, children: [{ text: "Bye." }] }
        ]
      };
      const output =
        "<blockquote><p>This is some code:</p><pre><code>const a = 1;</code><code>console.log('hello');</code></pre><p>Bye.</p></blockquote>";

      expect(serialize(node)).toBe(output);
    });

    test("note as a container", () => {
      const node = {
        type: NOTE,
        level: "danger",
        children: [
          { type: PARAGRAPH, children: [{ bold: true, text: "Danger!" }] },
          {
            type: BLOCK_QUOTE,
            children: [{ type: PARAGRAPH, children: [{ text: "A really wise quote." }] }]
          },
          { type: PARAGRAPH, children: [{ text: "Bye." }] }
        ]
      };
      const output =
        "<blockquote><p><strong>Danger!</strong></p><blockquote><p>A really wise quote.</p></blockquote><p>Bye.</p></blockquote>";

      expect(serialize(node)).toBe(output);
    });
  });
});

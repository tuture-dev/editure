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
import {
  serializeToHtml as serialize,
  deserializeFromHtml as deserialize
} from "../html";

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

describe("html deserialization", () => {
  describe("pure mark", () => {
    test("bare text", () => {
      const html = "test";
      const fragment = [{ text: "test" }];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("bold", () => {
      const html = "<strong>test</strong>";
      const fragment = [{ bold: true, text: "test" }];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("italic", () => {
      const html = "<em>test</em>";
      const fragment = [{ italic: true, text: "test" }];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("code", () => {
      const html = "<code>test</code>";
      const fragment = [{ code: true, text: "test" }];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("underline", () => {
      const html = "<u>test</u>";
      const fragment = [{ underline: true, text: "test" }];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("link", () => {
      const html = `<a href="https://test.com">test</a>`;
      const fragment = [{ link: true, text: "test", url: "https://test.com" }];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("sequential marks in a paragraph", () => {
      const html =
        "<p>This is <strong>bold</strong> and <em>italic</em> and <code>code</code>.</p>";
      const fragment = [
        {
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
        }
      ];
      expect(deserialize(html)).toStrictEqual(fragment);
    });
  });

  describe("mixed marks", () => {
    test("bold + italic", () => {
      const html = "<em><strong>test</strong></em>";
      const fragment = [{ bold: true, italic: true, text: "test" }];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("bold + code", () => {
      const html = "<strong><code>test</code></strong>";
      const fragment = [{ bold: true, code: true, text: "test" }];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("bold + underline", () => {
      const html = "<u><strong>test</strong></u>";
      const fragment = [{ bold: true, underline: true, text: "test" }];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("bold + link", () => {
      const html = '<a href="https://test.com"><strong>test</strong></a>';
      const fragment = [
        { bold: true, link: true, url: "https://test.com", text: "test" }
      ];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("bold + italic + code + underline + strikethrough + link", () => {
      const html =
        '<a href="https://test.com"><u><em><strong><code>test</code></strong></em></u></a>';
      const fragment = [
        {
          bold: true,
          italic: true,
          code: true,
          underline: true,
          link: true,
          url: "https://test.com",
          text: "test"
        }
      ];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("sequential mixed marks", () => {
      const html =
        '<p>This is <em><strong>mixed</strong></em> and <u>underlined</u> and <a href="https://test.com"><code>code</code></a>.</p>';
      const fragment = [
        {
          type: PARAGRAPH,
          children: [
            { text: "This is " },
            { bold: true, italic: true, text: "mixed" },
            { text: " and " },
            { underline: true, text: "underlined" },
            { text: " and " },
            { code: true, link: true, url: "https://test.com", text: "code" },
            { text: "." }
          ]
        }
      ];

      expect(deserialize(html)).toStrictEqual(fragment);
    });
  });

  describe("pure block", () => {
    test("paragraph", () => {
      const html = "<p>test</p>";
      const fragment = [{ type: PARAGRAPH, children: [{ text: "test" }] }];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("div", () => {
      const html = "<div>test</div>";
      const fragment = [{ type: PARAGRAPH, children: [{ text: "test" }] }];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("br", () => {
      const html = "<br />";
      const fragment = [{ type: PARAGRAPH, children: [{ text: "" }] }];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("h1", () => {
      const html = "<h1>test</h1>";
      const fragment = [{ type: H1, children: [{ text: "test" }] }];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("h2", () => {
      const html = "<h2>test</h2>";
      const fragment = [{ type: H2, children: [{ text: "test" }] }];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("h3", () => {
      const html = "<h3>test</h3>";
      const fragment = [{ type: H3, children: [{ text: "test" }] }];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("h4", () => {
      const html = "<h4>test</h4>";
      const fragment = [{ type: H4, children: [{ text: "test" }] }];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("h5", () => {
      const html = "<h5>test</h5>";
      const fragment = [{ type: H5, children: [{ text: "test" }] }];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("hr", () => {
      const html = "<hr />";
      const fragment = [{ type: HR, children: [{ text: "" }] }];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("image", () => {
      const html = '<img src="https://test.com/image.png" alt="" />';
      const fragment = [
        {
          type: IMAGE,
          url: "https://test.com/image.png",
          children: [{ text: "" }]
        }
      ];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("blockquote (single line)", () => {
      const html = "<blockquote><p>test</p></blockquote>";
      const fragment = [
        {
          type: BLOCK_QUOTE,
          children: [{ type: PARAGRAPH, children: [{ text: "test" }] }]
        }
      ];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("blockquote (multiple lines)", () => {
      const html = "<blockquote><p>foo</p><p>bar</p></blockquote>";
      const fragment = [
        {
          type: BLOCK_QUOTE,
          children: [
            { type: PARAGRAPH, children: [{ text: "foo" }] },
            { type: PARAGRAPH, children: [{ text: "bar" }] }
          ]
        }
      ];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("code-block (single line)", () => {
      const html = "<pre><code>test</code></pre>";
      const fragment = [
        {
          type: CODE_BLOCK,
          children: [{ type: CODE_LINE, children: [{ text: "test" }] }]
        }
      ];
      expect(deserialize(html)).toMatchObject(fragment);
    });

    test("code-block (multiple lines)", () => {
      const html = "<pre><code>foo</code><code>bar</code></pre>";
      const fragment = [
        {
          type: CODE_BLOCK,
          children: [
            { type: CODE_LINE, children: [{ text: "foo" }] },
            { type: CODE_LINE, children: [{ text: "bar" }] }
          ]
        }
      ];
      expect(deserialize(html)).toMatchObject(fragment);
    });

    test("bulleted-list", () => {
      const html = "<ul><li>foo</li><li>bar</li></ul>";
      const fragment = [
        {
          type: BULLETED_LIST,
          children: [
            { type: LIST_ITEM, children: [{ text: "foo" }] },
            { type: LIST_ITEM, children: [{ text: "bar" }] }
          ]
        }
      ];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("numbered-list", () => {
      const html = "<ol><li>foo</li><li>bar</li></ol>";
      const fragment = [
        {
          type: NUMBERED_LIST,
          children: [
            { type: LIST_ITEM, children: [{ text: "foo" }] },
            { type: LIST_ITEM, children: [{ text: "bar" }] }
          ]
        }
      ];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("sequential blocks", () => {
      const html =
        "<h1>title</h1><p>paragraph1</p><br /><blockquote><p>blockquote</p></blockquote><pre><code>const a = 1;</code><code>console.log('hello');</code></pre>";
      const fragment = [
        { type: H1, children: [{ text: "title" }] },
        { type: PARAGRAPH, children: [{ text: "paragraph1" }] },
        { type: PARAGRAPH, children: [{ text: "" }] },
        {
          type: BLOCK_QUOTE,
          children: [{ type: PARAGRAPH, children: [{ text: "blockquote" }] }]
        },
        {
          type: CODE_BLOCK,
          children: [
            { type: CODE_LINE, children: [{ text: "const a = 1;" }] },
            { type: CODE_LINE, children: [{ text: "console.log('hello');" }] }
          ]
        }
      ];

      expect(deserialize(html)).toStrictEqual(fragment);
    });
  });

  describe("flattening", () => {
    test("flatten p tags", () => {
      const html = '<p><img src="https://test.com/image.png" alt="" /></p>';
      const fragment = [
        {
          type: IMAGE,
          url: "https://test.com/image.png",
          children: [{ text: "" }]
        }
      ];
      expect(deserialize(html)).toStrictEqual(fragment);
    });

    test("flatten div tags", () => {
      const html = "<div><div>test</div></div>";
      const fragment = [
        {
          type: PARAGRAPH,
          children: [{ text: "test" }]
        }
      ];
      expect(deserialize(html)).toStrictEqual(fragment);
    });
  });

  describe("nested blocks", () => {
    test("blockquote as a container", () => {
      const html =
        "<blockquote><p>This is some code:</p><pre><code>const a = 1;</code><code>console.log('hello');</code></pre><p>Bye.</p></blockquote>";
      const fragment = [
        {
          type: BLOCK_QUOTE,
          children: [
            { type: PARAGRAPH, children: [{ text: "This is some code:" }] },
            {
              type: CODE_BLOCK,
              children: [
                { type: CODE_LINE, children: [{ text: "const a = 1;" }] },
                { type: CODE_LINE, children: [{ text: "console.log('hello');" }] }
              ]
            },
            { type: PARAGRAPH, children: [{ text: "Bye." }] }
          ]
        }
      ];

      expect(deserialize(html)).toStrictEqual(fragment);
    });
  });
});

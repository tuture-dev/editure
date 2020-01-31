const { override, addBabelPlugin } = require("customize-cra");

module.exports = {
  webpack: override(
    addBabelPlugin([
      "prismjs",
      {
        languages: [
          "bash",
          "basic",
          "c",
          "cpp",
          "csharp",
          "css",
          "dart",
          "diff",
          "dockerfile",
          "erlang",
          "git",
          "go",
          "graphql",
          "groovy",
          "html",
          "http",
          "java",
          "javascript",
          "json",
          "jsx",
          "kotlin",
          "less",
          "makefile",
          "markdown",
          "matlab",
          "nginx",
          "objectivec",
          "pascal",
          "perl",
          "php",
          "powershell",
          "protobuf",
          "python",
          "r",
          "ruby",
          "rust",
          "scala",
          "shell",
          "sql",
          "plsql",
          "swift",
          "typescript",
          "vbnet",
          "velocity",
          "xml",
          "yaml",
          "latex",
          "tcl",
          "verilog",
          "lua"
        ],
        plugins: ["line-numbers", "autoloader"]
      }
    ])
  )
};

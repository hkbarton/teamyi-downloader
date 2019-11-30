module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "12.8.1",
        },
        loose: true,
      },
    ],
    "@babel/preset-react",
  ],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./app"],
        main: ["./app/main"],
        renderer: ["./app/renderer"]
      },
    ],
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-class-properties", { loose: true }],
    "@babel/plugin-proposal-do-expressions",
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-proposal-optional-chaining",
    [
      "import",
      {
        libraryName: "antd",
        libraryDirectory: "lib",
        style: false,
      },
    ],
  ],
}

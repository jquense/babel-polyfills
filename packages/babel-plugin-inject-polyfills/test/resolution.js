import * as babel from "@babel/core";
import path from "path";
import thisPlugin from "../lib";

function withProviders(providers) {
  return babel.transformSync("", {
    configFile: false,
    babelrc: false,
    filename: "filename.js",
    plugins: [[thisPlugin, { method: "usage-global", providers }]],
    ast: true,
    code: false,
  }).ast;
}

describe("addon resolution", function() {
  const base = path.join(__dirname, "fixtures", "resolution");
  let cwd;

  beforeEach(function() {
    cwd = process.cwd();
    process.chdir(base);
  });

  afterEach(function() {
    process.chdir(cwd);
  });

  it("should find module:provider", function() {
    process.chdir("module-paths");

    withProviders(["module:provider"]);
  });

  it("should find standard providers", function() {
    process.chdir("standard-paths");

    withProviders(["foo"]);
  });

  it("should find standard providers with an existing prefix", function() {
    process.chdir("standard-paths");

    withProviders(["babel-polyfill-provider-foo"]);
  });

  it("should find @foo scoped providers", function() {
    process.chdir("foo-org-paths");

    withProviders(["@foo/mod"]);
  });

  it("should find @foo scoped providers with an inner babel-polyfill-provider", function() {
    process.chdir("foo-org-paths");

    withProviders(["@foo/thing.babel-polyfill-provider-convert"]);
  });

  it("should find @foo scoped providers with a babel-polyfill-provider suffix", function() {
    process.chdir("foo-org-paths");

    withProviders(["@foo/thing-babel-polyfill-provider"]);
  });

  it("should find @foo scoped providers with an existing prefix", function() {
    process.chdir("foo-org-paths");

    withProviders(["@foo/babel-polyfill-provider-mod"]);
  });

  it("should find @foo/babel-polyfill-provider when specified", function() {
    process.chdir("foo-org-paths");

    withProviders(["@foo/babel-polyfill-provider"]);
  });

  it("should find @foo/babel-polyfill-provider/index when specified", function() {
    process.chdir("foo-org-paths");

    withProviders(["@foo/babel-polyfill-provider/index"]);
  });

  it("should find @foo/babel-polyfill-provider when just scope given", function() {
    process.chdir("foo-org-paths");

    withProviders(["@foo"]);
  });

  it("should find relative path providers", function() {
    process.chdir("relative-paths");

    withProviders(["./dir/provider.js"]);
  });

  it("should find module file providers", function() {
    process.chdir("nested-module-paths");

    withProviders(["mod/provider"]);
  });

  it("should find @foo scoped module file presets", function() {
    process.chdir("scoped-nested-module-paths");

    withProviders(["@foo/mod/provider"]);
  });

  it("should throw about module: usage for presets", function() {
    process.chdir("throw-module-paths");

    expect(() => {
      withProviders(["foo"]);
    }).toThrow(
      /Cannot find module 'babel-polyfill-provider-foo'.*\n- If you want to resolve "foo", use "module:foo"/,
    );
  });

  it("should throw about missing presets", function() {
    process.chdir("throw-missing-paths");

    expect(() => {
      withProviders(["foo"]);
    }).toThrow(/Cannot find module 'babel-polyfill-provider-foo'/);
  });
});

const htmlmin = require("html-minifier");
const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const markdownItAttrs = require('markdown-it-attrs')
const pluginTOC = require('eleventy-plugin-toc')
const Image = require("@11ty/eleventy-img");
async function imageShortcode(src, alt, sizes = "100vw") {
  let metadata = await Image(src, {
    widths: [300, 600],
    formats: ["avif", "jpeg"],
    urlPath: "/images/",
    outputDir: "./dist/images/"
  });
  let imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };
  // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
  return Image.generateHTML(metadata, imageAttributes, {
    whitespaceMode: "inline"
  });
}
module.exports = function(eleventyConfig) {
  //markdown, add IDs to all headings
  let options = {
    html: true,
    breaks: true,
    linkify: true
  };
  eleventyConfig.setLibrary(
    'md',
    markdownIt(options).use(markdownItAnchor).use(markdownItAttrs)
  )
  //have browsersync pick up SASS
  eleventyConfig.setBrowserSyncConfig({
    files: './dist/styles/*.css'
  });
  //do not touch images
  eleventyConfig.addPassthroughCopy({ "src/favicons": "/" });
  eleventyConfig.addPassthroughCopy({ "src/images": "/images" });
  //TOC
  eleventyConfig.addPlugin(pluginTOC, {
    tags: ['h2'],
    wrapper: 'div',
    wrapperClass: 'article-toc',
    ul: true
  })
  //shortcodes
  eleventyConfig.addShortcode("mail", function(address, displaytext = address, classes = "") {
    if (displaytext.includes("@")) {
      displaytext = displaytext.replace(/@/g, " [AT] ").replace(/\./g, " [DOT] ");
    }
    split = address.split("@");
    return `<a class='${classes}' href='javascript:void(0)' onclick='str1="${split[0]}";str2="${split[1]}";this.href="mailto:" + str1 + "@" + str2;'  rel='nofollow'>${displaytext}</a>`;
  });
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    // Eleventy 1.0+: use this.inputPath and this.outputPath instead
    if (outputPath && outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }
    return content;
  });
  //custom output dirs
  return {
    dir: {
      input: 'src',
      output: 'dist'
    },
    markdownTemplateEngine: "njk"
  };
};
/**
 * Project config for your site.
 * All variables declared in `meta` will be accessible in your Nunjucks
 * templates. Variables changed in `config` affect the build process.
 *
 */
module.exports = {
    // The `meta` object is sent to every template.
    meta: {
        title: "Matt Hall",
        description: "This is the homepage of Matt Hall, computer science student at the Ohio State University in Columbus, Ohio. I post about computer graphics and software engineering, among other things.",
        author: "Matt Hall",
    },
    // All authors must be defined here.
    authors: {
        "first-author": {
            name: "First Author",
            short_bio: "short bio catchphrase",
            bio: "a whole HTML paragraph."
        },
        "second-author": {
            name: "Second Author",
            short_bio: "a short bio.",
            bio: "a whole HTML paragraph."
        }
    },
    config: {

    },
}
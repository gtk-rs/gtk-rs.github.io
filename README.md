# The gtk-rs.org site

The site is hosted on [GitHub Pages](https://pages.github.com/) powered by
[Jekyll](http://jekyllrb.com/).

When authoring any changes you can try them out locally by running (requires ruby):

```shell
> bundle exec jekyll serve -wD
```

The `/docs/` location is served by the [docs](https://github.com/gtk-rs/docs) repo. Its contents
should be considered disposable and eventually will be updated via CI.

The documentation in [`docs-src`](docs-src) is not intended to be viewed at the `/docs-src/`
location. Instead the generated static files (`_site/docs-src/*`) are merged into the `docs` repo,
keeping a nice urls structure.

---
layout: default
---
# Gtk-rs documentation

## Requirements

First, prepare your system by taking a look at the [GTK installation page](https://www.gtk.org/docs/installations/).

## Crate API docs

 - [**atk**](../docs/stable/atk/)
 - [**cairo**](../docs/stable/cairo/)
 - [**gdk**](../docs/stable/gdk/)
 - [**gdk-pixbuf**](../docs/stable/gdk_pixbuf/)
 - [**gdk-x11**](../docs/stable/gdkx11/)
 - [**gio**](../docs/stable/gio/)
 - [**glib**](../docs/stable/glib/)
 - [**glib-macros**](../docs/stable/glib_macros/)
 - [**gtk**](../docs/stable/gtk/)
 - [**pango**](../docs/stable/pango/)
 - [**pangocairo**](../docs/stable/pangocairo/)
 - [**sourceview**](../docs/stable/sourceview/)

## [The GTK+ Project documentation](https://www.gtk.org/docs/)

## Versions

By default the `gtk` crate provides only GTK+ 3.14 APIs. You can access more
modern APIs by selecting one of the following features: `v3_16`, `v3_18`, `v3_20`, `v3_22`, `v3_24`, `v3_26`, `v3_28`, `v3_30`.

`Cargo.toml` example:

~~~toml
[dependencies.gtk]
version = "{{ gtk[0].max_version }}"
features = ["v3_16"]
~~~

**Take care when choosing the version to target: some of your users might
not have easy access to the latest ones.** The higher the version, the fewer
users will have it installed.

## Tutorials and examples

 * [Tutorials](/docs/tutorial).
 * [Examples repository](https://github.com/gtk-rs/examples).
 * [Projects using `gtk-rs`](/#projects-using-gtk-rs).

---
layout: default
---
# Gtk-rs documentation

### [Requirements](requirements.html)

### Crate API docs

 - [**cairo**](cairo/)
 - [**gdk**](gdk/)
 - [**gio**](gio/)
 - [**glib**](glib/)
 - [**gtk**](gtk/)
 - [**pango**](pango/)

### Versions

By default the `gtk` crate provides only GTK+ 3.4 APIs. You can access more
modern APIs by selecting one of the following features: `v3_6`, `v3_8`,
`v3_10`, `v3_12`, `v3_14`, `v3_16`.

`Cargo.toml` example:

~~~toml
[dependencies.gtk]
version = "0.1.0"
features = ["v3_16"]
~~~

**Take care when choosing the version to target: some of your users might
not have easy access to the latest ones.** The higher the version, the fewer
users will have it installed.

### Examples

See the [examples repository](https://github.com/gtk-rs/examples).

### [The GTK+ Project documentation](http://www.gtk.org/documentation.php)

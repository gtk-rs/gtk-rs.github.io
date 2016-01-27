---
layout: default
---
# Gtk-rs documentation

### [Requirements](requirements.html)

### Crate API docs

 - [**cairo**](cairo/)
 - [**gdk**](gdk/)
 - [**glib**](glib/)
 - [**gtk**](gtk/)
 - [**pango**](pango/)

### Versions

The build script will query the installed library versions from `pkg-config`
and instruct `rustc` via `cfg` arguments to compile the appropriate set of APIs.

All the APIs available in the installed library will just work but if you
attempt to use newer ones, the build will fail. Presently, Rust doesn't allow
to generate custom error messages so there doesn't appear to be a way to make
such errors more friendly.

### Examples

See the [examples repository](https://github.com/gtk-rs/examples).

### [The GTK+ Project documentation](http://www.gtk.org/documentation.php)

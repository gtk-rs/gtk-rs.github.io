---
layout: default
---
# Gtk-rs documentation

## Requirements

First, prepare your system by taking a look at the [GTK installation page](https://www.gtk.org/docs/installations/).

### Setup on Windows

On Windows, some Rust-specific steps are necessary:

1. If you haven't already, [install rustup](https://rustup.rs/)
2. [Install MSYS2](https://www.msys2.org/)
3. Open a cmd prompt (not MSYS2 terminal) and run these commands:

       set PATH=C:\msys64\mingw64\bin;%PATH%;C:\msys64\usr\bin
       set PKG_CONFIG_PATH=C:\msys64\mingw64\lib\pkgconfig
       set RUSTUP_TOOLCHAIN=stable-x86_64-pc-windows-gnu

       rustup toolchain install stable-x86_64-pc-windows-gnu
       pacman -S pkg-config mingw-w64-x86_64-gcc mingw-w64-x86_64-gtk3

Now you should able to `cargo run` your Rust project.
Note that you need to setup the environment variables as above each time you start a new terminal.

## Crate API docs

 - [**atk**](../docs/atk/)
 - [**cairo**](../docs/cairo/)
 - [**gdk**](../docs/gdk/)
 - [**gdk-pixbuf**](../docs/gdk_pixbuf/)
 - [**gdk-x11**](../docs/gdkx11/)
 - [**gio**](../docs/gio/)
 - [**glib**](../docs/glib/)
 - [**glib-macros**](../docs/glib_macros/)
 - [**gtk**](../docs/gtk/)
 - [**pango**](../docs/pango/)
 - [**pangocairo**](../docs/pangocairo/)
 - [**sourceview**](../docs/sourceview/)

## [The GTK Project documentation](https://www.gtk.org/docs/)

## Versions

By default the `gtk` crate provides only GTK 3.14 APIs. You can access more
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

 * [Tutorials](/docs-src/tutorial).
 * [Examples directory in the `gtk-rs` repository](https://github.com/gtk-rs/gtk-rs).
 * [Projects using `gtk-rs`](/#projects-using-gtk-rs).

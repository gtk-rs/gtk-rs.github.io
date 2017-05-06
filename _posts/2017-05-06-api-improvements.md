---
layout: post
author: GuillaumeGomez
title: New crates.io versions available and API improvements
categories: [front, crates]
date: 2017-05-06 18:00:00 +0000
---

TLDR: A lot of minor adds/fixes once again. Few API improvements but the most important ones are:

 * Add even more properties (both "normal" and children ones).
 * Add of `Into<T>` for every nullable types.

### Changes

For the interested ones, here is the list of the (major) changes:

[Gtk](https://github.com/gtk-rs/gtk):

 * [Add child properties for Notebook](https://github.com/gtk-rs/gtk/pull/496)
 * [Add child properties for Box](https://github.com/gtk-rs/gtk/pull/481)
 * [Add basic drag and drop support](https://github.com/gtk-rs/gtk/pull/472)

[Gdk](https://github.com/gtk-rs/gdk):

 * [Fix RGBA](https://github.com/gtk-rs/gdk/pull/140)
 * [Generate Gdk classes](https://github.com/gtk-rs/gdk/pull/144)
 * [Add GdkAtom](https://github.com/gtk-rs/gdk/pull/145)
 * [Add GdkAtom part 2](https://github.com/gtk-rs/gdk/pull/148)

[Sys](https://github.com/gtk-rs/sys):

 * [Use FFI types for constants, string ends with '/0', bitflags update and make all struct fields public, etc](https://github.com/gtk-rs/sys/pull/45)

[GLib](https://github.com/gtk-rs/glib):

 * [Fix array of string for full transfer](https://github.com/gtk-rs/glib/pull/153)
 * [Convert string constants from FFI](https://github.com/gtk-rs/glib/pull/154)
 * [Directly access the GType in the GValue instead of doing raw pointer casting](https://github.com/gtk-rs/glib/pull/156)
 * [Add support for getting a &str from a GValue without copying](https://github.com/gtk-rs/glib/pull/162)

[Gio](https://github.com/gtk-rs/gio):

 * [Generate interface functions](https://github.com/gtk-rs/gio/pull/20)

[Cairo](https://github.com/gtk-rs/cairo):

 * [Add scaled font](https://github.com/gtk-rs/cairo/pull/118)
 * [Add proper glib bindings for font types](https://github.com/gtk-rs/cairo/pull/120)
 * [Make glib dependency optional](https://github.com/gtk-rs/cairo/pull/127)

[Pango](https://github.com/gtk-rs/pango):
 * [Generate more enums and objects](https://github.com/gtk-rs/pango/pull/65)

Thanks to all of ours contributors for their (awesome!) work for this release:

 * [@EPashkin](https://github.com/EPashkin)
 * [@Susurrus](https://github.com/Susurrus)
 * [@antoyo](https://github.com/antoyo)
 * [@sdroege](https://github.com/sdroege)
 * [@johncf](https://github.com/johncf)
 * [@rtsuk](https://github.com/rtsuk)
 * [@GuillaumeGomez](https://github.com/GuillaumeGomez)

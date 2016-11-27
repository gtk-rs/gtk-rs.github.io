---
layout: post
author: GuillaumeGomez
title: More versions!
categories: [crates, update]
date: 2016-11-27 20:00:00 +0000
---

TLDR: A lot of minor adds/fixes. New GNOME libraries versions are now available.

### New versions of GNOME libraries are now handled

Thanks to [@EPashkin]'s work, here are the versions upgrade we were able to perform:

 * GTK: 3.16 -> 3.22
 * GDK: 3.16 -> 3.22
 * GDKPixbuf: 2.32 -> 2.36
 * Pango: 1.34 -> 1.42
 * GIO: 2.44 -> 2.50
 * GLib: 2.40 -> 2.50

### Changes

For the interested ones, here is the list of the (major) changes:

[Gtk](https://github.com/gtk-rs/gtk):

 * [Add FileChooserButton](https://github.com/gtk-rs/gtk/pull/374).
 * [Provide gtk::MessageDialog manual setter for secondary markup and text](https://github.com/gtk-rs/gtk/pull/375).

[Gdk](https://github.com/gtk-rs/gdk):

 * [Rename struct Attributes to WindowAttr](https://github.com/gtk-rs/gdk/pull/127).
 * [Add getter for 'button' property of GdkEventButton](https://github.com/gtk-rs/gdk/pull/128).
 * [Make enum unconvertable to i32 without to_glib and from_glib](https://github.com/gtk-rs/gdk/pull/130).

[Glib](https://github.com/gtk-rs/glib):

 * [Add signal_stop_emission and signal_stop_emission_by_name](https://github.com/gtk-rs/glib/pull/128).
 * [Add signal_handler_block and signal_handler_unblock](https://github.com/gtk-rs/glib/pull/134).
 * [Add KeyFile](https://github.com/gtk-rs/glib/pull/137).
 * [Move from Gtk signal Inhibit](https://github.com/gtk-rs/glib/pull/139).
 * [Add utility functions get_application_name, get_program_name, get_environ, ...](https://github.com/gtk-rs/glib/pull/140)

[Gio](https://github.com/gtk-rs/gio):

 * [Change return type for connect_writable_change_event to Inhibit](https://github.com/gtk-rs/gio/pull/10).

[Gir](https://github.com/gtk-rs/gir):

 * [Add nullable override for signals -parameters and returns-](https://github.com/gtk-rs/gir/pull/292).
 * [Add nullable override for constructors](https://github.com/gtk-rs/gir/pull/290).

[Cairo](https://github.com/gtk-rs/cairo):

 * [Add optional xlib function](https://github.com/gtk-rs/cairo/pull/81).
 * [Add RadialGradient](https://github.com/gtk-rs/cairo/pull/83).

Thanks again to both [@EPashkin] and [@gkoz] for their amazing work on this update!

[@EPashkin]: https://github.com/EPashkin
[@gkoz]: https://github.com/gkoz

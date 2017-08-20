---
layout: post
author: Guillaume Gomez
title: The huge and long awaited release is finally here!
categories: [front, crates]
date: 2017-08-20 01:00:00 +0000
---

It has been a long time since the last release (4 months already!). We wanted to be sure everything was ready before releasing this one. A lot of new adds, bug fixes and other surprises are there, have fun!

### Changes

For the interested ones, here is the list of the (major) changes:

[cairo](https://github.com/gtk-rs/cairo):

 * [Add Format::stride_for_width() as a wrapper for cairo_format_stride_for_width()](https://github.com/gtk-rs/cairo/pull/147)
 * [ImageSurface: return a Result<ImageSurface, Status> from the creation functions](https://github.com/gtk-rs/cairo/pull/146)
 * [Remove unused import](https://github.com/gtk-rs/cairo/pull/144)
 * [Added PDF as a target Surface](https://github.com/gtk-rs/cairo/pull/143)
 * [Update for non-generic pointer array impls](https://github.com/gtk-rs/cairo/pull/142)
 * [Error trait for errors](https://github.com/gtk-rs/cairo/pull/140)
 * [Add missing trait implementation](https://github.com/gtk-rs/cairo/pull/139)
 * [Add Region](https://github.com/gtk-rs/cairo/pull/138)
 * [Fix macOS specific functions](https://github.com/gtk-rs/cairo/pull/136)
 * [fix xcb features](https://github.com/gtk-rs/cairo/pull/131)

[glib](https://github.com/gtk-rs/glib):

 * [Implement Display/Debug for Type, and Type::name()](https://github.com/gtk-rs/glib/pull/210)
 * [Regen](https://github.com/gtk-rs/glib/pull/209)
 * [Some helper API to dynamically work with GLib enums/flags](https://github.com/gtk-rs/glib/pull/207)
 * [Add Cast::dynamic_cast()](https://github.com/gtk-rs/glib/pull/206)
 * [Add WeakRef support to glib::Object](https://github.com/gtk-rs/glib/pull/204)
 * [Make glib::Error Send/Sync](https://github.com/gtk-rs/glib/pull/203)
 * [Implement public ObjectExt::get_property_type()](https://github.com/gtk-rs/glib/pull/202)
 * [Regenerate with latest gir](https://github.com/gtk-rs/glib/pull/201)
 * [Fix transfer full conversion of pointer arrays](https://github.com/gtk-rs/glib/pull/200)
 * [Implement StaticType and GValue traits for boxed/shared types too](https://github.com/gtk-rs/glib/pull/199)
 * [Remove generic pointer array impls of ToGlibPtr and FromGlibContainer](https://github.com/gtk-rs/glib/pull/198)
 * [Fix gitter badge](https://github.com/gtk-rs/glib/pull/197)
 * [Implement Value traits inside glib_wrapper!() instead of doing it gen…](https://github.com/gtk-rs/glib/pull/196)
 * [Initial GMainLoop/GMainContext bindings](https://github.com/gtk-rs/glib/pull/194)
 * [Remove now obsolete comment from ObjectExt::set_property()](https://github.com/gtk-rs/glib/pull/193)
 * [Implement ObjectExt::emit() for emitting arbitrary signals](https://github.com/gtk-rs/glib/pull/192)
 * [Implement ObjectExt::connect() for connecting to arbitrary signals](https://github.com/gtk-rs/glib/pull/191)
 * [Various GObject property changes](https://github.com/gtk-rs/glib/pull/190)
 * [Implement public ObjectExt::set_property() and ::get_property()](https://github.com/gtk-rs/glib/pull/189)
 * [Update gir submodule](https://github.com/gtk-rs/glib/pull/185)
 * [Regenerate with latest gir](https://github.com/gtk-rs/glib/pull/184)
 * [Generate functions that uses gsize/gusize](https://github.com/gtk-rs/glib/pull/183)
 * [Update to bitflags 0.9](https://github.com/gtk-rs/glib/pull/181)
 * [Add signal::signal_handler_disconnect()](https://github.com/gtk-rs/glib/pull/180)
 * [Make BoolError constructor public](https://github.com/gtk-rs/glib/pull/179)
 * [Add missing use for closure](https://github.com/gtk-rs/glib/pull/178)
 * [Use functions, ending with _utf8 under Windows](https://github.com/gtk-rs/glib/pull/177)
 * [Add support for gobject closures](https://github.com/gtk-rs/glib/pull/173)
 * [Implement FromGlibPtrNone and FromGlibPtrFull for Value](https://github.com/gtk-rs/glib/pull/172)
 * [Add Windows implementations for g_setenv, g_getenv, g_unsetenv and g_get_current_dir](https://github.com/gtk-rs/glib/pull/171)
 * [Generate global functions](https://github.com/gtk-rs/glib/pull/170)
 * [Add glib::BoolError for use as return value of possibly failing functions returning booleans](https://github.com/gtk-rs/glib/pull/169)
 * [Use g_object_ref_sink() instead of g_object_ref() everywhere](https://github.com/gtk-rs/glib/pull/167)

[gdk](https://github.com/gtk-rs/gdk):

 * [Regenerate with latest gir](https://github.com/gtk-rs/gdk/pull/185)
 * [Fix transfer full conversion of Atom arrays](https://github.com/gtk-rs/gdk/pull/180)
 * [Update for non-generic pointer array impls](https://github.com/gtk-rs/gdk/pull/179)
 * [Regenerate with latest gir](https://github.com/gtk-rs/gdk/pull/177)
 * [Update](https://github.com/gtk-rs/gdk/pull/176)
 * [Add missing getters for EventScroll](https://github.com/gtk-rs/gdk/pull/174)
 * [gdk_window_fullscreen_on_monitor available since 3.18](https://github.com/gtk-rs/gdk/pull/172)
 * [Regenerate with latest GIR and enable Display::store_clipboard()](https://github.com/gtk-rs/gdk/pull/171)
 * [Add remaining GdkAtom constants](https://github.com/gtk-rs/gdk/pull/170)
 * [Update to bitflags 0.9](https://github.com/gtk-rs/gdk/pull/169)
 * [Update lgpl dependency version](https://github.com/gtk-rs/gdk/pull/168)
 * [Update lgpl version](https://github.com/gtk-rs/gdk/pull/167)
 * [Deignore](https://github.com/gtk-rs/gdk/pull/166)
 * [Reexport global function and remove duplicates](https://github.com/gtk-rs/gdk/pull/165)
 * [Generate global functions](https://github.com/gtk-rs/gdk/pull/164)

[gtk](https://github.com/gtk-rs/gtk):

 * [Regen](https://github.com/gtk-rs/gtk/pull/556)
 * [Fix clippy warnings](https://github.com/gtk-rs/gtk/pull/552)
 * [Regenerate with latest gir, rename ApplicationExt to GtkApplicationEx…](https://github.com/gtk-rs/gtk/pull/551)
 * [Regen](https://github.com/gtk-rs/gtk/pull/549)
 * [Fix getting stable version for Appveyor](https://github.com/gtk-rs/gtk/pull/548)
 * [Calculate lengths parameters](https://github.com/gtk-rs/gtk/pull/546)
 * [Regenerate with latest gir](https://github.com/gtk-rs/gtk/pull/545)
 * [Update for non-generic pointer array impls](https://github.com/gtk-rs/gtk/pull/544)
 * [Regenerate with latest gir](https://github.com/gtk-rs/gtk/pull/543)
 * [Use more pango objects](https://github.com/gtk-rs/gtk/pull/541)
 * [New types](https://github.com/gtk-rs/gtk/pull/538)
 * [Generate IconTheme](https://github.com/gtk-rs/gtk/pull/537)
 * [ShortcutsWindow available since 3.20](https://github.com/gtk-rs/gtk/pull/535)
 * [Regenerate with latest GIR](https://github.com/gtk-rs/gtk/pull/533)
 * [Generate IconSet](https://github.com/gtk-rs/gtk/pull/530)
 * [Replace functions for RadioButton and RadioMenuItem](https://github.com/gtk-rs/gtk/pull/529)
 * [Update to bitflags 0.9](https://github.com/gtk-rs/gtk/pull/528)
 * [Change gtk::Application::new parameter to use Into<Option<&str>>](https://github.com/gtk-rs/gtk/pull/525)
 * [Use glib::BoolError for gtk::init() and gtk::Application::new()](https://github.com/gtk-rs/gtk/pull/523)
 * [Update release_process.md](https://github.com/gtk-rs/gtk/pull/521)
 * [Add PrintContext](https://github.com/gtk-rs/gtk/pull/519)
 * [Add GtkIMMulticontext and GtkIMContext](https://github.com/gtk-rs/gtk/pull/518)
 * [Regen](https://github.com/gtk-rs/gtk/pull/516)
 * [Deignore](https://github.com/gtk-rs/gtk/pull/513)
 * [Reexport global function and remove duplicates](https://github.com/gtk-rs/gtk/pull/512)
 * [Update release_process.md](https://github.com/gtk-rs/gtk/pull/504)
 * [Generate global functions](https://github.com/gtk-rs/gtk/pull/510)
 * [Regenerate autogenerated bindings with latest GIR](https://github.com/gtk-rs/gtk/pull/509)
 * [Fix object properties](https://github.com/gtk-rs/gtk/pull/507)

Thanks to all of our contributors for their (awesome!) work for this release:

 * [@federicomenaquintero](https://github.com/federicomenaquintero)
 * [@EPashkin](https://github.com/EPashkin)
 * [@sdroege](https://github.com/sdroege)
 * [@antoyo](https://github.com/antoyo)
 * [@savage13](https://github.com/savage13)
 * [@charlesvdv](https://github.com/charlesvdv)
 * [@GuillaumeGomez](https://github.com/GuillaumeGomez)

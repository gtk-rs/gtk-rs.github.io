---
layout: post
author: gkoz
title: Safety first (gtk 0.0.6)
categories: [front, crates]
date: 2015-11-28 01:30:00 +0200
---

The latest crates update is about tightening up the safety guarantees.

### Initialization and threads

 * `gdk` and `gtk` [will panic][pr189] if you try to use them prior to calling
`gtk::init` or from any thread but the main[^main] one. We intend to add a set
of APIs with static checks but there's no specific plan at the moment.
 * `glib::idle_add` and `glib::timeout_add` now [require the closure to be
`Send`][pr82] because it might get executed on a different thread.
 * `gtk` [has got relaxed versions of these][pr197], that don't require `Send`
but will panic if called from non-main[^main] thread.
 * Panicking in a callback [will terminate the process][pr189] because unwinding
across FFI is not allowed.

### Unfinished APIs

 * `Builder::get_object` and other similar methods, that are currently unable
to check the object type, [have been marked unsafe][pr191]. They will be fixed
soon, when the [semi-automated branch][reform] lands.
 * Current `glib::Value` bindings [are flat out unsafe][issue73], have been
marked accordingly and need someone to pick them up.

### What's up with the documentation?

We've realized that we can't take the documentation from an LGPL licensed
library and just slip it into an MIT-licensed one. Consequently we had to move
almost all doc comments into a [separate repo][doc-comments]. We will keep
maintaining [online documentation](https://gtk-rs.org/docs-src/) and
**@GuillaumeGomez** is working on a tool, that will allow to put the doc
comments back locally.

[^main]: We currently define the main thread as one, on which `gtk::init` was
    called. This does not reflect the OSX requirements well and will be adjusted
    in the future.

[issue73]: https://github.com/gtk-rs/glib/issues/73
[pr82]: https://github.com/gtk-rs/glib/pull/82
[pr189]: https://github.com/gtk-rs/gtk/pull/189
[pr191]: https://github.com/gtk-rs/gtk/pull/191
[pr197]: https://github.com/gtk-rs/gtk/pull/197
[reform]: https://github.com/gkoz/gtk-rs-gtk/tree/object_reform_gir
[doc-comments]: https://github.com/gtk-rs/rustdoc-comments

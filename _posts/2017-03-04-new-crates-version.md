---
layout: post
author: GuillaumeGomez
title: New crates.io versions available
categories: [front, crates]
date: 2017-03-04 18:00:00 +0000
---

TLDR: A lot of minor adds/fixes once again. Few API improvements but the most important ones are:

 * Add of properties (both "normal" and children ones)
 * Add of `Into<str>`

Now, instead of having to write:

```rust
let about_dialog = AboutDialog::new();

about_dialog.set_website(Some("https://gtk-rs.org/blog/"));
about_dialog.set_website(None);
```

You can write:

```rust
let about_dialog = AboutDialog::new();

about_dialog.set_website("https://gtk-rs.org/blog/"); // `Some` isn't need anymore
about_dialog.set_website(None);
```

### Changes

For the interested ones, here is the list of the (major) changes:

[Gtk](https://github.com/gtk-rs/gtk):

 * [Add child properties for ToolItemGroup](https://github.com/gtk-rs/gtk/pull/394)
 * [Add child properties to Grid](https://github.com/gtk-rs/gtk/pull/395)
 * [Generate child properties](https://github.com/gtk-rs/gtk/pull/416)
 * [Add child properties for Toolbar](https://github.com/gtk-rs/gtk/pull/399)
 * [Trampoline transformation](https://github.com/gtk-rs/gtk/pull/400)
 * [Add set_translation_domain and get_translation_domain for gtk::Builder](https://github.com/gtk-rs/gtk/pull/414)
 * [Add manual Assistant.set_forward_page_func](https://github.com/gtk-rs/gtk/pull/419)
 * [Ignore duplicated parent methods](https://github.com/gtk-rs/gtk/pull/425)
 * [Add gtk::PopoverConstraint and related Popover methods](https://github.com/gtk-rs/gtk/pull/427)
 * [Add all properties](https://github.com/gtk-rs/gtk/pull/428)
 * [Add model button](https://github.com/gtk-rs/gtk/pull/433)
 * [Add Into option str](https://github.com/gtk-rs/gtk/pull/447)
 * [Add RadioButton and RadioMenuItem](https://github.com/gtk-rs/gtk/pull/452)

[Cairo](https://github.com/gtk-rs/cairo):

 * [Add xcb functions](https://github.com/gtk-rs/cairo/pull/102)
 * [Implement missing methods for patterns and surfaces](https://github.com/gtk-rs/cairo/pull/103)
 * [Reexport forgotten sys enums used in Pattern public functions](https://github.com/gtk-rs/cairo/pull/106)
 * [Add missing enum](https://github.com/gtk-rs/cairo/pull/107)

[Gio](https://github.com/gtk-rs/gio):

 * [Generate properties](https://github.com/gtk-rs/gio/pull/13)
 * [Add `Into` str](https://github.com/gtk-rs/gio/pull/14)
 * [Improve API](https://github.com/gtk-rs/gio/pull/15)

[Pango](https://github.com/gtk-rs/pango):

 * [Add an autogeneration using gir](https://github.com/gtk-rs/pango/pull/54)
 * [Add new types](https://github.com/gtk-rs/pango/pull/55)

[Gir](https://github.com/gtk-rs/gir):

 * [Update toml, regex and xml-rs version](https://github.com/gtk-rs/gir/pull/320)
 * [Parse fields in classes and generate correct class structs](https://github.com/gtk-rs/gir/pull/297)
 * [Add group comments in generated sys](https://github.com/gtk-rs/gir/pull/298)
 * [Generate child properties](https://github.com/gtk-rs/gir/pull/299)
 * [Use error_chain crate to process errors](https://github.com/gtk-rs/gir/pull/300)
 * [Add long and short types](https://github.com/gtk-rs/gir/pull/302)
 * [Remove records empty line](https://github.com/gtk-rs/gir/pull/303)
 * [Don't generate a method if a parent already has it](https://github.com/gtk-rs/gir/pull/305)
 * [Apply configured return.nullable to out parameters](https://github.com/gtk-rs/gir/pull/307)
 * [Add properties](https://github.com/gtk-rs/gir/pull/308)
 * [Fix GValue generation in gobject-sys](https://github.com/gtk-rs/gir/pull/310)
 * [Add pointer size check](https://github.com/gtk-rs/gir/pull/311)
 * [Check for config file existence before loading it](https://github.com/gtk-rs/gir/pull/312)
 * [Don't implement Display trait for non-standard to_string](https://github.com/gtk-rs/gir/pull/313)
 * [Add Into<&str> for optional parameters](https://github.com/gtk-rs/gir/pull/314)
 * [Moved bounds logic out parameter](https://github.com/gtk-rs/gir/pull/316)
 * [Add bounds](https://github.com/gtk-rs/gir/pull/317)
 * [Fix generation out parameter with simply types](https://github.com/gtk-rs/gir/pull/318)
 * [Remove unused uses in generated enums.rs](https://github.com/gtk-rs/gir/pull/319)

[Sys](https://github.com/gtk-rs/sys):

 * [Apply "Parse fields in classes and generate correct class structs" in gir](https://github.com/gtk-rs/sys/pull/35)
 * [Fix GValue size on i686-pc-windows-gnu](https://github.com/gtk-rs/sys/pull/38)


Thanks to all of ours contributors for their (awesome!) work for this release:

 * [@EPashkin](https://github.com/EPashkin)
 * [@federicomenaquintero](https://github.com/federicomenaquintero)
 * [@RazrFalcon](https://github.com/RazrFalcon)
 * [@fludardes](https://github.com/fludardes)
 * [@Susurrus](https://github.com/Susurrus)
 * [@eugene2k](https://github.com/eugene2k)

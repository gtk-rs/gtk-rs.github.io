---
layout: post
author: Guillaume Gomez
title: Across the line!
categories: [front, crates]
date: 2019-02-21 15:00:00 +0000
---

Hi everyone!

It's time for a new release! Main adds/changes this time are:

 * We added the generation of the `Atk` crate.
 * We now generate functions taking callback as parameters.
 * We improved the channels handling in `GLib`.
 * The whole new `GString` type!
 * The minimum Rust version supported is now the `1.31`.
 * The minimum version of all libraries has been changed to GNOME `3.14`.
 * The maximum version of all libraries has been upgraded to GNOME `3.30`.
 * Added subclassing support in GLib.
 * Even more bindings generated.

Let's see those in details.

#### Atk

The Atk crate is about accessibility. We thought it was a miss not having it considering how important accessibility is. Now it's fixed! You can find more information directly on the [`Atk` repository](https://github.com/gtk-rs/atk) or in the [accessibility example](https://github.com/gtk-rs/examples/blob/main/src/bin/accessibility.rs).

#### Callbacks?

We already implemented by hand a lot of these functions but the big new thing in here is that they're now automatically generated.

To present this, let's use the `foreach` method of `TreeModel`:

The C version looks like this:

```C
void gtk_tree_model_foreach(
    GtkTreeModel *model,
    GtkTreeModelForeachFunc func,
    gpointer user_data
);
```

Nothing fancy here: it takes the object we're running this function upon, a callback and some user data. Now here's the Rust version:

```rust
fn foreach<P: FnMut(&TreeModel, &TreePath, &TreeIter) -> bool>(
    &self,
    func: P,
);
```

No more user data since closures can capture their environment, just the object and the callback (aka closure). Makes things a bit simpler and nicer to use.

#### GLib channels

Instead of rewriting something fully in here, I'll just show you what it looks like and recommend you to go read the excellent Sebastian's blog post about it: https://coaxion.net/blog/2019/02/mpsc-channel-api-for-painless-usage-of-threads-with-gtk-in-rust/

```rust
enum Message {
    UpdateLabel(String),
}

[...]
let label = gtk::Label::new("not finished");
[...]
// Create a new sender/receiver pair with default priority
let (sender, receiver) = glib::MainContext::channel(glib::PRIORITY_DEFAULT);

// Spawn the thread and move the sender in there
thread::spawn(move || {
    thread::sleep(time::Duration::from_secs(10));

    // Sending fails if the receiver is closed
    let _ = sender.send(Message::UpdateLabel(String::from("finished")));
});

// Attach the receiver to the default main context (None)
// and on every message update the label accordingly.
let label_clone = label.clone();
receiver.attach(None, move |msg| {
    match msg {
        Message::UpdateLabel(text) => label_clone.set_text(text.as_str()),
    }

    // Returning false here would close the receiver
    // and have senders fail
    glib::Continue(true)
});
```

#### `GString` type?

This type has been created in order to prevent some useless copies to improve performances. It's used in case a function returns a `String` while fully transferring it. In such cases, we now just wrap it instead of cloning it.

This is part of our performance focus. More to come in the next release!

#### Minimum Rust version supported

We moved it to `1.31.0` mainly because imports handling is much easier starting this version. We still need to update macros though (an issue about it is already [open](https://github.com/gtk-rs/glib/issues/420)).

#### subclassing support in GLib

This is a strongly asked feature and we now have it in GLib. A lot of work remains to be done, but it's mostly polishing. At its current state, it can be used already. Take a look at the [listbox_model](https://github.com/gtk-rs/examples/blob/main/src/bin/listbox_model.rs) if you want to see how it works.

#### Even more bindings generated

Just like usual, with the improvements of our gir crate, we are able to generate more and more parts of all the GNOME libraries we wrote bindings for.

#### Conclusion

That's it for this release! Don't forget to take a look at our brand new [F.A.Q. section](https://gtk-rs.org/docs-src/faq).

And again: thanks **a lot** to all of our contributors! This project lives thanks to their awesome work!

### Changes

For the interested ones, here is the list of the merged pull requests:

[sys](https://github.com/gtk-rs/sys):

 * [Install libmount-dev](https://github.com/gtk-rs/sys/pull/131)
 * [Update versions in Travis/AppVeyor configuration](https://github.com/gtk-rs/sys/pull/130)
 * [Update to GNOME 3.14 versions](https://github.com/gtk-rs/sys/pull/129)
 * [Include missing headers for ABI checks.](https://github.com/gtk-rs/sys/pull/90)
 * [Fix generating array of pointers](https://github.com/gtk-rs/sys/pull/113)
 * [Fix GtkIconSize usage](https://github.com/gtk-rs/sys/pull/111)

[glib](https://github.com/gtk-rs/glib):

 * [For setting properties and the return value of signal handlers relax …](https://github.com/gtk-rs/glib/pull/457)
 * [Re-implement MainContext channel around a manual channel](https://github.com/gtk-rs/glib/pull/456)
 * [Add test for checking if MainContext Senders return errors when the R…](https://github.com/gtk-rs/glib/pull/455)
 * [Install libmount-dev](https://github.com/gtk-rs/glib/pull/451)
 * [subclassing: move parent invocation fnct in Ext trait](https://github.com/gtk-rs/glib/pull/450)
 * [Fix up some Source API to work with SourceId instead of raw u32](https://github.com/gtk-rs/glib/pull/449)
 * [Add variants for GSource/MainContext functions without Send bound](https://github.com/gtk-rs/glib/pull/447)
 * [Update Travis to Ubuntu Xenial](https://github.com/gtk-rs/glib/pull/446)
 * [Minor subclass API usability improvements](https://github.com/gtk-rs/glib/pull/445)
 * [Various signal subclass improvements](https://github.com/gtk-rs/glib/pull/444)
 * [Remove leftover testing usage of features for glib/gobject-sys](https://github.com/gtk-rs/glib/pull/443)
 * [Update to GNOME 3.14 versions](https://github.com/gtk-rs/glib/pull/442)
 * [Add ObjectType trait to prelude](https://github.com/gtk-rs/glib/pull/441)
 * [Add support for defining new interfaces and other minor things](https://github.com/gtk-rs/glib/pull/438)
 * [Only box data passed to Bytes::from_owned() once](https://github.com/gtk-rs/glib/pull/434)
 * [Update for signals using the concrete closure type instead of double-…](https://github.com/gtk-rs/glib/pull/433)
 * [Add new Object::connect_unsafe(), Object::connect_notify_unsafe() and…](https://github.com/gtk-rs/glib/pull/431)
 * [Derive clone for BoolError](https://github.com/gtk-rs/glib/pull/432)
 * [Implement equivalents to mpsc::channel() and ::sync_channel() for the MainContext](https://github.com/gtk-rs/glib/pull/430)
 * [generate from_glib_borrow implementation for const pointers](https://github.com/gtk-rs/glib/pull/428)
 * [Replace deprecated tempdir crate](https://github.com/gtk-rs/glib/pull/427)
 * [Implement DerefMut for class structs too](https://github.com/gtk-rs/glib/pull/426)
 * [Clean up glib_wrapper! macro and IsA&lt;_&gt;, Wrapper traits and their impls](https://github.com/gtk-rs/glib/pull/421)
 * [GString: Avoid copy for From&lt;GString&gt; for String impl](https://github.com/gtk-rs/glib/pull/423)
 * [BoolError: allow owning the message](https://github.com/gtk-rs/glib/pull/419)
 * [Implement ToGlib for InitializingType](https://github.com/gtk-rs/glib/pull/418)
 * [Ci tests](https://github.com/gtk-rs/glib/pull/417)
 * [Add API for implementing GObject interfaces generically](https://github.com/gtk-rs/glib/pull/415)
 * [Make ObjectType::new() optional too](https://github.com/gtk-rs/glib/pull/416)
 * [Fixes compilation on aarch64](https://github.com/gtk-rs/glib/pull/413)
 * [Don't duplicate property name in subclass::Property type](https://github.com/gtk-rs/glib/pull/412)
 * [gstring: Specify a lifetime for the From&lt;str&gt; impl](https://github.com/gtk-rs/glib/pull/411)
 * [Introduce GString](https://github.com/gtk-rs/glib/pull/389)
 * [Implement Value traits manually](https://github.com/gtk-rs/glib/pull/410)
 * [return correct type for Variant::get_type()](https://github.com/gtk-rs/glib/pull/409)
 * [Add signal::connect_raw() working on raw c_char pointers for the sign…](https://github.com/gtk-rs/glib/pull/406)
 * [Add subclassing test for registering signals, action signals, emittin…](https://github.com/gtk-rs/glib/pull/404)
 * [Add function to get the implementation from an instance](https://github.com/gtk-rs/glib/pull/403)
 * [Replace unwrap calls with "more explicit" expect](https://github.com/gtk-rs/glib/pull/402)
 * [Require fewer trait bounds for WeakRef and the ObjectExt trait](https://github.com/gtk-rs/glib/pull/401)
 * [Rename glib_boxed_get_type! to glib_boxed_type! for consistency](https://github.com/gtk-rs/glib/pull/400)
 * [Remove the glib_object_get_type! macro](https://github.com/gtk-rs/glib/pull/399)
 * [Don't require specific traits or namespaces in scope for the glib_wra…](https://github.com/gtk-rs/glib/pull/398)
 * [Add support for safely registering boxed types for Rust types](https://github.com/gtk-rs/glib/pull/397)
 * [Add API for getting the instance from the object implementation](https://github.com/gtk-rs/glib/pull/396)
 * [Add a second constructor to ObjectSubclass that provides the class st…](https://github.com/gtk-rs/glib/pull/393)
 * [Run tests on travis with the subclassing feature](https://github.com/gtk-rs/glib/pull/394)
 * [Migrate subclassing infrastructure to glib-rs](https://github.com/gtk-rs/glib/pull/392)
 * [Fix regen_check](https://github.com/gtk-rs/glib/pull/391)
 * [Force 1.28 check](https://github.com/gtk-rs/glib/pull/387)
 * [Add bindings for GOptionArg and GOptionFlags](https://github.com/gtk-rs/glib/pull/385)
 * [Use ptr::add(i) instead of ptr::offset(i as isize)](https://github.com/gtk-rs/glib/pull/384)
 * [Remove python unlinking in travis config](https://github.com/gtk-rs/glib/pull/383)
 * [Remove wrong connect_xxx_notify](https://github.com/gtk-rs/glib/pull/382)

[cairo](https://github.com/gtk-rs/cairo):

 * [Implement Display and Debug traits](https://github.com/gtk-rs/cairo/pull/244)
 * [Add missing 1.12 items](https://github.com/gtk-rs/cairo/pull/241)
 * [Install libmount-dev for CI](https://github.com/gtk-rs/cairo/pull/245)
 * [Fix syntax error bis repetita](https://github.com/gtk-rs/cairo/pull/243)
 * [Fix syntax error](https://github.com/gtk-rs/cairo/pull/242)
 * [Add missing types and version features](https://github.com/gtk-rs/cairo/pull/240)
 * [Update Travis/AppVeyor configuration to test/build more different fea…](https://github.com/gtk-rs/cairo/pull/237)
 * [Finalize PDF, SVG, PS work from #234](https://github.com/gtk-rs/cairo/pull/236)
 * [Refactor interface in PDF](https://github.com/gtk-rs/cairo/pull/234)
 * [Update rust version](https://github.com/gtk-rs/cairo/pull/235)
 * [Make Surface methods &self from &mut self, remove Send impls](https://github.com/gtk-rs/cairo/pull/233)
 * [Add surface scale functions](https://github.com/gtk-rs/cairo/pull/231)
 * [Add get/set_device_offset methods](https://github.com/gtk-rs/cairo/pull/230)
 * [Improve tests file handling](https://github.com/gtk-rs/cairo/pull/225)
 * [Improvements](https://github.com/gtk-rs/cairo/pull/223)
 * [Expose include dirs to other build scripts](https://github.com/gtk-rs/cairo/pull/222)
 * [Implement Context::path_extents()](https://github.com/gtk-rs/cairo/pull/221)
 * [impl Default for Matrix with an identity matrix](https://github.com/gtk-rs/cairo/pull/180)
 * [Add get_mime_data(), set_mime_data() and supports_mime_type()  to cario surface](https://github.com/gtk-rs/cairo/pull/220)
 * [Add cairo_font_type_t](https://github.com/gtk-rs/cairo/pull/219)
 * [Enum rework](https://github.com/gtk-rs/cairo/pull/217)
 * [add get/set_document_unit() to svg surface ](https://github.com/gtk-rs/cairo/pull/215)
 * [Add check for 1.28](https://github.com/gtk-rs/cairo/pull/213)
 * [Better support for PDF, SVG and PostScript.](https://github.com/gtk-rs/cairo/pull/165)
 * [Remove python unlinking in travis config](https://github.com/gtk-rs/cairo/pull/211)

[sourceview](https://github.com/gtk-rs/sourceview):

 * [Add check for 1.28](https://github.com/gtk-rs/sourceview/pull/74)
 * [Remove connect_xxx_notify for ConstructOnly properties](https://github.com/gtk-rs/sourceview/pull/72)
 * [Improve cargo file a bit](https://github.com/gtk-rs/sourceview/pull/71)
 * [Fragile](https://github.com/gtk-rs/sourceview/pull/67)

[atk](https://github.com/gtk-rs/atk):

 * [Check for any sneaked in LGPL docs](https://github.com/gtk-rs/atk/pull/19)
 * [Bring Travis and AppVeyor configurations in sync with the GLib one](https://github.com/gtk-rs/atk/pull/18)
 * [Update to GNOME 3.14 versions](https://github.com/gtk-rs/atk/pull/17)
 * [Update rustc version](https://github.com/gtk-rs/atk/pull/16)
 * [improve travis checkup a bit](https://github.com/gtk-rs/atk/pull/8)
 * [Fix for 1.28](https://github.com/gtk-rs/atk/pull/7)
 * [Split into crate branch](https://github.com/gtk-rs/atk/pull/5)
 * [Add missing feature](https://github.com/gtk-rs/atk/pull/4)
 * [remove unneeded dependencies](https://github.com/gtk-rs/atk/pull/3)
 * [Update appveyor badge url](https://github.com/gtk-rs/atk/pull/2)
 * [Generate a lot of things](https://github.com/gtk-rs/atk/pull/1)

[gio](https://github.com/gtk-rs/gio):

 * [Install libmount-dev](https://github.com/gtk-rs/gio/pull/194)
 * [Check if any LGPL docs sneaked in](https://github.com/gtk-rs/gio/pull/193)
 * [Bring Travis and AppVeyor configurations in sync with the GLib one](https://github.com/gtk-rs/gio/pull/192)
 * [Update to GNOME 3.14 versions](https://github.com/gtk-rs/gio/pull/191)
 * [Define manual traits](https://github.com/gtk-rs/gio/pull/184)
 * [Enable InetAddress{Mask}::equal() and to_string()](https://github.com/gtk-rs/gio/pull/188)
 * [Don't box callbacks and other generic parameters twice in async funct…](https://github.com/gtk-rs/gio/pull/186)
 * [Gstring support](https://github.com/gtk-rs/gio/pull/177)
 * [Fix socket.rs build with --features dox](https://github.com/gtk-rs/gio/pull/178)
 * [Mark functions to create a socket from raw fd/socket as unsafe](https://github.com/gtk-rs/gio/pull/175)
 * [Add impls for new std::io::{Read,Write} structs](https://github.com/gtk-rs/gio/pull/172)
 * [Add check for 1.28](https://github.com/gtk-rs/gio/pull/170)
 * [Add std::io::{Read,Write} wrappers](https://github.com/gtk-rs/gio/pull/162)
 * [Regen](https://github.com/gtk-rs/gio/pull/168)
 * [Update crate version](https://github.com/gtk-rs/gio/pull/167)
 * [Command-line option support for gio::Application](https://github.com/gtk-rs/gio/pull/164)
 * [New release](https://github.com/gtk-rs/gio/pull/166)

[pango](https://github.com/gtk-rs/pango):

 * [Install libmount-dev](https://github.com/gtk-rs/pango/pull/138)
 * [Bring Travis and AppVeyor configurations in sync with the GLib one](https://github.com/gtk-rs/pango/pull/137)
 * [Update to GNOME 3.14 versions](https://github.com/gtk-rs/pango/pull/135)
 * [Gstring support](https://github.com/gtk-rs/pango/pull/130)
 * [Add check for 1.28](https://github.com/gtk-rs/pango/pull/128)
 * [Remove python unlinking in travis config](https://github.com/gtk-rs/pango/pull/127)

[gdk-pixbuf](https://github.com/gtk-rs/gdk-pixbuf):

 * [Install libmount-dev](https://github.com/gtk-rs/gdk-pixbuf/pull/111)
 * [Run regen check when building for 3.14](https://github.com/gtk-rs/gdk-pixbuf/pull/110)
 * [Bring Travis and AppVeyor configurations in sync with the GLib one](https://github.com/gtk-rs/gdk-pixbuf/pull/109)
 * [Update to GNOME 3.14 versions](https://github.com/gtk-rs/gdk-pixbuf/pull/107)
 * [Fix CI](https://github.com/gtk-rs/gdk-pixbuf/pull/103)
 * [Don't box closures in async functions twice](https://github.com/gtk-rs/gdk-pixbuf/pull/101)
 * [GdkPixbuf::new return Option](https://github.com/gtk-rs/gdk-pixbuf/pull/97)
 * [Change PixBuf::from_vec() to PixBuf::from_mut_slice() and allow any A…](https://github.com/gtk-rs/gdk-pixbuf/pull/98)
 * [GString support](https://github.com/gtk-rs/gdk-pixbuf/pull/95)
 * [Add check for 1.28](https://github.com/gtk-rs/gdk-pixbuf/pull/93)
 * [Remove python unlinking in travis config](https://github.com/gtk-rs/gdk-pixbuf/pull/92)
 * [Remove wrong connect_xxx_notify](https://github.com/gtk-rs/gdk-pixbuf/pull/91)

[gdk](https://github.com/gtk-rs/gdk):

 * [Install libmount-dev](https://github.com/gtk-rs/gdk/pull/278)
 * [Check if any LGPL docs sneaked in](https://github.com/gtk-rs/gdk/pull/277)
 * [Bring Travis and AppVeyor configurations in sync with the GLib one](https://github.com/gtk-rs/gdk/pull/276)
 * [Remove useless gio feature dependencies from Cargo.toml](https://github.com/gtk-rs/gdk/pull/275)
 * [Update to GNOME 3.14 versions](https://github.com/gtk-rs/gdk/pull/274)
 * [Update rust version](https://github.com/gtk-rs/gdk/pull/273)
 * [Define manual traits](https://github.com/gtk-rs/gdk/pull/265)
 * [Don't box closures twice](https://github.com/gtk-rs/gdk/pull/266)
 * [Replace atom borrow](https://github.com/gtk-rs/gdk/pull/263)
 * [Add missing FromGlibBorrow implementation](https://github.com/gtk-rs/gdk/pull/261)
 * [Support const array of gdk::Atom](https://github.com/gtk-rs/gdk/pull/259)
 * [GString support](https://github.com/gtk-rs/gdk/pull/257)
 * [Fix missing cairo conversion](https://github.com/gtk-rs/gdk/pull/255)
 * [Add check for 1.28](https://github.com/gtk-rs/gdk/pull/253)
 * [FrameTimings: use an `Option` when returning refresh_interval](https://github.com/gtk-rs/gdk/pull/252)
 * [FrameTimings: use an `Option` when returning presentation time](https://github.com/gtk-rs/gdk/pull/251)
 * [Remove python unlinking in travis config](https://github.com/gtk-rs/gdk/pull/249)
 * [Remove connect_xxx_notify for ConstructOnly properties](https://github.com/gtk-rs/gdk/pull/248)
 * [Implement Event::downcast_ref() and Event::downcast_mut()](https://github.com/gtk-rs/gdk/pull/247)
 * [FrameClock: fix segmentation fault after getting `FrameTimings`](https://github.com/gtk-rs/gdk/pull/246)

[gtk](https://github.com/gtk-rs/gtk):

 * [Install libmount-dev](https://github.com/gtk-rs/gtk/pull/782)
 * [Run regen check when building for 3.14](https://github.com/gtk-rs/gtk/pull/781)
 * [Bring Travis and AppVeyor configurations in sync with the GLib one](https://github.com/gtk-rs/gtk/pull/779)
 * [Acquire the default MainContext when initializing GTK](https://github.com/gtk-rs/gtk/pull/780)
 * [Update to GNOME 3.14 versions](https://github.com/gtk-rs/gtk/pull/778)
 * [Tree model sort](https://github.com/gtk-rs/gtk/pull/777)
 * [Define manual traits](https://github.com/gtk-rs/gtk/pull/766)
 * [Support non-GNU versions of make](https://github.com/gtk-rs/gtk/pull/771)
 * [Remove ListBoxExtManual and autogenerate all remaining functions from it](https://github.com/gtk-rs/gtk/pull/770)
 * [Don't box signal callbacks twice](https://github.com/gtk-rs/gtk/pull/767)
 * [Fix CI](https://github.com/gtk-rs/gtk/pull/769)
 * [use &self for SelectionData::set(), fix #747](https://github.com/gtk-rs/gtk/pull/748)
 * [Rename SelectionData get_data_with_length method to get_data](https://github.com/gtk-rs/gtk/pull/762)
 * [Add pango-sys](https://github.com/gtk-rs/gtk/pull/758)
 * [GString support](https://github.com/gtk-rs/gtk/pull/745)
 * [Ignore some more problematic functions](https://github.com/gtk-rs/gtk/pull/752)
 * [Update BoolError constructions](https://github.com/gtk-rs/gtk/pull/751)
 * [Generate ComboBox::set_active by hand](https://github.com/gtk-rs/gtk/pull/750)
 * [Add check for 1.28](https://github.com/gtk-rs/gtk/pull/741)
 * [Rename socket trait](https://github.com/gtk-rs/gtk/pull/739)
 * [Add Atk](https://github.com/gtk-rs/gtk/pull/740)
 * [Into](https://github.com/gtk-rs/gtk/pull/734)
 * [Update doc example](https://github.com/gtk-rs/gtk/pull/731)
 * [Fix response type](https://github.com/gtk-rs/gtk/pull/728)
 * [Update ResponseType](https://github.com/gtk-rs/gtk/pull/726)
 * [Fix GtkIconSize usage](https://github.com/gtk-rs/gtk/pull/723)
 * [Allow the create-context signal for GLArea to return null](https://github.com/gtk-rs/gtk/pull/720)
 * [Remove python unlinking in travis config](https://github.com/gtk-rs/gtk/pull/718)
 * [Rename MenuItemExt trait to GtkMenuItemExt](https://github.com/gtk-rs/gtk/pull/714)
 * [Rename MenuExt trait to GtkMenuExt to avoid conflict with gio](https://github.com/gtk-rs/gtk/pull/712)
 * [Make WidgetExt::get_style_context() non nullable](https://github.com/gtk-rs/gtk/pull/711)
 * [Remove connect_xxx_notify for ConstructOnly properties](https://github.com/gtk-rs/gtk/pull/710)
 * [Remove property `events` getter and setter as we already have normal …](https://github.com/gtk-rs/gtk/pull/708)
 * [Widget::get_events() / add_events() / set_events() should take a gdk:…](https://github.com/gtk-rs/gtk/pull/705)

[pangocairo](https://github.com/gtk-rs/pangocairo):

 * [Install libmount-dev](https://github.com/gtk-rs/pangocairo/pull/40)
 * [Bring Travis and AppVeyor configurations in sync with the GLib one](https://github.com/gtk-rs/pangocairo/pull/39)
 * [Update to GNOME 3.14 versions](https://github.com/gtk-rs/pangocairo/pull/38)
 * [Update rust version](https://github.com/gtk-rs/pangocairo/pull/37)
 * [Fix usage of Cairo.FontType](https://github.com/gtk-rs/pangocairo/pull/32)
 * [Add check for 1.28](https://github.com/gtk-rs/pangocairo/pull/29)
 * [Remove python unlinking in travis config](https://github.com/gtk-rs/pangocairo/pull/28)

[gtk-test](https://github.com/gtk-rs/gtk-test):

 * [Updates](https://github.com/gtk-rs/gtk-test/pull/20)
 * [Add check for 1.28](https://github.com/gtk-rs/gtk-test/pull/18)

All this was possible thanks to the [gtk-rs/gir](https://github.com/gtk-rs/gir) project as well:

 * [Fixed deriving Copy trait for struct with function with varargs](https://github.com/gtk-rs/gir/pull/719)
 * [Update dependencies](https://github.com/gtk-rs/gir/pull/718)
 * [Remove into bound for user callbacks](https://github.com/gtk-rs/gir/pull/715)
 * [Want some more user-callbacks?](https://github.com/gtk-rs/gir/pull/714)
 * [Create fewer boxes for closures](https://github.com/gtk-rs/gir/pull/710)
 * [Correctly generate signal connector function arguments](https://github.com/gtk-rs/gir/pull/711)
 * [Few improvements on user callback generation](https://github.com/gtk-rs/gir/pull/706)
 * [Add manual traits](https://github.com/gtk-rs/gir/pull/707)
 * [Use nullable attribute on constructor return value](https://github.com/gtk-rs/gir/pull/708)
 * [Add imports for async out parameters](https://github.com/gtk-rs/gir/pull/700)
 * [Remove references from TypeId usage](https://github.com/gtk-rs/gir/pull/703)
 * [handle aliases better](https://github.com/gtk-rs/gir/pull/702)
 * [Fix unstable super_callback's list for g_vfs_register_uri_scheme](https://github.com/gtk-rs/gir/pull/701)
 * [Check for known subtypes when deciding if a type is a final type](https://github.com/gtk-rs/gir/pull/698)
 * [Fix invalid gboolean generation](https://github.com/gtk-rs/gir/pull/699)
 * [Start of user callbacks generation](https://github.com/gtk-rs/gir/pull/667)
 * [Add missing ObjectType import for notify-only properties](https://github.com/gtk-rs/gir/pull/695)
 * [Implement configuration/detection for final types and use that inform…](https://github.com/gtk-rs/gir/pull/694)
 * [Remove useless files](https://github.com/gtk-rs/gir/pull/660)
 * [Correctly cast pointers in property getters/setters if no trait is to…](https://github.com/gtk-rs/gir/pull/692)
 * [Fix unused bounds in futures](https://github.com/gtk-rs/gir/pull/691)
 * [Update code generation for glib_wrapper! macro and IsA&lt;_&gt;, etc cleanup](https://github.com/gtk-rs/gir/pull/689)
 * [Codegen: use new glib macro for BoolError](https://github.com/gtk-rs/gir/pull/687)
 * [Mark autogenerated files as such](https://github.com/gtk-rs/gir/pull/679)
 * [Fix some clippy warnings](https://github.com/gtk-rs/gir/pull/680)
 * [Expose include paths to other build scripts](https://github.com/gtk-rs/gir/pull/678)
 * [Remove special generation for enums with a single member](https://github.com/gtk-rs/gir/pull/676)
 * [They weren't meant to be bit fields](https://github.com/gtk-rs/gir/pull/675)
 * [Generate code using CStringHolder instead of String](https://github.com/gtk-rs/gir/pull/666)
 * [Add missing "glib" use statement for property setters](https://github.com/gtk-rs/gir/pull/674)
 * [Various minor fixes](https://github.com/gtk-rs/gir/pull/673)
 * [WIP: Don't generate any but the main IsA&lt;_&gt; bound for extension traits](https://github.com/gtk-rs/gir/pull/672)
 * [Remove now unneeded use statements for the glib_wrapper! macro](https://github.com/gtk-rs/gir/pull/671)
 * [Implement basics for subclassing](https://github.com/gtk-rs/gir/pull/669)
 * [Default generate_display_trait](https://github.com/gtk-rs/gir/pull/668)
 * [Fix display and strengthen CI](https://github.com/gtk-rs/gir/pull/663)
 * [Generate Display impl for enums](https://github.com/gtk-rs/gir/pull/643)
 * [Add pub for modules to use them from the gir library](https://github.com/gtk-rs/gir/pull/665)
 * [Fix missing glib](https://github.com/gtk-rs/gir/pull/662)
 * [Cast enum/bitfield values to gint/guint for sys tests](https://github.com/gtk-rs/gir/pull/658)
 * [Don't trim constants themselves when testing for their value](https://github.com/gtk-rs/gir/pull/659)
 * [Use inner c:type for arrays with fixed size in sys mode](https://github.com/gtk-rs/gir/pull/653)
 * [Fix adding `use IsA` for properties](https://github.com/gtk-rs/gir/pull/651)
 * [sys: generate cfg_condition for records](https://github.com/gtk-rs/gir/pull/649)
 * [Generate cfg_condition on sys mode](https://github.com/gtk-rs/gir/pull/646)
 * [Into wrapping](https://github.com/gtk-rs/gir/pull/647)
 * [Add underscore to enum and bitflags member starting with digits](https://github.com/gtk-rs/gir/pull/642)
 * [Don't generare notify for ConstructOnly properties](https://github.com/gtk-rs/gir/pull/641)
 * [Partial properties generation](https://github.com/gtk-rs/gir/pull/640)

Thanks to all of our contributors for their (awesome!) work for this release:

 * [@EPashkin](https://github.com/EPashkin)
 * [@sdroege](https://github.com/sdroege)
 * [@tmiasko](https://github.com/tmiasko)
 * [@GuillaumeGomez](https://github.com/GuillaumeGomez)
 * [@fengalin](https://github.com/fengalin)
 * [@philn](https://github.com/philn)
 * [@bkchr](https://github.com/bkchr)
 * [@jsparber](https://github.com/jsparber)
 * [@vojtechkral](https://github.com/vojtechkral)
 * [@osa1](https://github.com/osa1)
 * [@kornelski](https://github.com/kornelski)
 * [@federicomenaquintero](https://github.com/federicomenaquintero)
 * [@meh](https://github.com/meh)
 * [@fkrull](https://github.com/fkrull)
 * [@SamWhited](https://github.com/SamWhited)
 * [@ColonelThirtyTwo](https://github.com/ColonelThirtyTwo)
 * [@antoyo](https://github.com/antoyo)
 * [@ceyusa](https://github.com/ceyusa)

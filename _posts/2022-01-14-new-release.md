---
layout: post
author: Guillaume Gomez
title: New year, new release!
categories: [front, crates]
date: 2022-01-16 17:00:00 +0000
---


Hi everyone! Happy new year!

With this new year comes a new [gtk-rs][gtk-rs] release! As usual, a lot of improvements have been made. Let's check them out!

One important change: the minimum supported rust version is now **1.56**.

### Minimum and latest supported versions of the underlying C libraries

The minimum supported versions of the underlying C libraries have not changed compared to last release but support for newer versions was added:

 * GLib/GObject/GIO: minimum 2.48, latest 2.72
 * Pango/PangoCairo: minimum 1.38, latest 1.52
 * gdk-pixbuf: minimum 2.32, latest 2.42
 * cairo: minimum 1.14, latest 1.16
 * graphene: minimum 1.10
 * ATK: minimum 2.18, latest 2.38
 * GTK3: minimum 3.18, latest, 3.24.9
 * GTK4: minimum 4.0, latest 4.6

### Changes to derive macro names

All [derive](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/index.html#derives) and [attribute](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/index.html#attributes) macros are named more consistently now. Instead of e.g. `glib::GBoxed`, the new name is just `glib::Boxed` and misses the additional `G`, which would be redundant namespacing.

### GLib Variant API improvements and derive macro

The [`glib::Variant`](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/variant/struct.Variant.html) API was improved a lot in this release. `Variant` is a type that allows to store structured data built from basic types in a way that can be serialized into binary data efficiently.

A lot of API that was missing in previous releases was added, including API for efficient conversion from/to slices of basic types, strings and other container types. The existing conversion APIs were optimized and cleaned up.

To make it easier to handle custom structs (and soon [enums](https://github.com/gtk-rs/gtk-rs-core/pull/434)), a [derive macro](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/derive.Variant.html) was added that allows to directly convert between a custom Rust type and a `Variant` and back.

```rust
use glib::prelude::*;

#[derive(Debug, PartialEq, Eq, glib::Variant)]
struct Foo {
    some_string: String,
    some_int: i32,
}

let v = Foo { some_string: String::from("bar"), some_int: 1 };
let var = v.to_variant();
assert_eq!(var.get::<Foo>(), Some(v));
```

By using the derive macro, structured data can be handled automatically instead of manually accessing each of the individual parts of the data. This can be helpful for sending structured data over DBus via the `gio` DBus API, or for dealing with [`gio::Settings`](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/gio/struct.Settings.html) or for more complex states/values used in [`gio::Action`](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/gio/struct.Action.html).

### Stack allocated types and reducing heap allocations

Various types that are usually stack-allocated in C were previously heap-allocated in the Rust bindings. With this release, these values are also stack-allocated when used from Rust unless explicitly heap-allocated, e.g. by explicitly placing them into a `Box`.

Examples for this are all the [`graphene`](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/graphene/index.html) types (vectors, matrices, etc), which should make calculations considerably more efficient, types like [`gdk::Rectangle`](https://gtk-rs.org/gtk4-rs/stable/0.15/docs/gdk4/struct.Rectangle.html) and [`gdk::RGBA`](https://gtk-rs.org/gtk4-rs/stable/0.15/docs/gdk4/struct.RGBA.html), and [`gtk::TreeIter`](https://gtk-rs.org/gtk4-rs/stable/0.15/docs/gtk4/struct.TreeIter.html).

Overall this brings performance of applications using the Rust bindings even closer to the same code in C.

### Main context API improvements

When spawning non-`Send` [futures](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/struct.MainContext.html#method.spawn_local) or [closures](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/struct.MainContext.html#method.invoke_local), or attaching the main context [channel](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/struct.Receiver.html#method.attach) to the [`glib::MainContext`](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/struct.MainContext.html), it is not necessary anymore to have the main context acquired before. This was a common cause of confusion and this constraint was relaxed now. Instead it is only required that that thread default main context is not owned by a different thread yet, and if ownership is moved to a different thread at some point then it will panic at runtime.

Additionally the API for pushing a main context as the [thread default](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/struct.MainContext.html#method.with_thread_default) was refactored to reduce the risk of misusage. Instead of returning a guard value, it can only be used via a closure now to ensure proper nesting of thread default main contexts.

```rust
let ctx = glib::MainContext::new();
ctx.with_thread_default(|| {
    // do something with `ctx` being the thread default main context.
}).expect("Main context already owned by another thread");
```

### GLib string builder

`glib::String` was renamed to [`glib::GStringBuilder`](https://gtk-rs.org/gtk-rs-core/git/docs/glib/struct.GStringBuilder.html) to avoid confusion with `glib::GString` and to make it clearer that this is meant for building `NUL`-terminated C strings.

In addition the API was simplified considerably:
 * All APIs that allowed to create invalid UTF-8 were removed, leaving only safe APIs to build UTF-8 strings.
 * `GStringBuilder` directly dereferences into `&str`, so all `&str` API can be used on it.
 * `GStringBuilder` implements the `std::fmt::Write` trait, which allows making use of various `std` Rust API. For example `write!(&mut builder, "some format string {}", some_value)` can be used directly to write formatted strings into the string builder.

### Multiple improvements on `glib::ObjectExt`

 - `ObjectExt::property` now return the type T directly instead of a `glib::Value` and panics in case the property is not readable or the wrong type is provided. 
 - `ObjectExt::set_property` now panics in case the property is not writeable or doesn't exists
 - `ObjectExt::emit_by_name` expects you to pass in the type T for the returned value by the signal. If the signal doesn't return anything, you can use `some_obj.emit_by_name::<()>("some_signal", &[]);`  and also panics if the signal doesn't exists.

**Before**:

```rust
object.property("some_property").unwrap().get::<T>().unwrap();
object.set_property("some_property", &some_value).unwrap();
// signal that returns nothing
object.emit_by_name("some_signal").unwrap();
// signal that returns T
let some_value = object.emit_by_name("some_signal").unwrap().unwrap().get::<T>().unwrap();
```

**After**:

```rust
object.property::<T>("some_property");
object.set_property("some_property", &some_value);
object.emit_by_name::<()>("some_signal");
let some_value = object.emit_by_name::<T>("some_signal");
```

A `ObjectExt::try_*` variant exists if you want the old behaviour. As most of the application code unwraps the returned results, this should be one of the slight but nice improvements of the overall API.

### Bindings wrapper types memory representation optimization

All heap-allocated bindings types do now have a memory representation that is equivalent to the underlying raw C pointer. In addition to reducing memory usage compared to before, this also allows for other optimizations and e.g allows to borrow values from C storage in a few places instead of creating copies or increasing their reference count (e.g. in [`glib::PtrSlice`](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/collections/struct.PtrSlice.html)).

### GLib collection types

While not used widely yet, a new [`glib::collections`](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/collections/index.html) module was added that provides more efficient access to [slices](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/collections/struct.Slice.html), [pointer slices](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/collections/struct.PtrSlice.html) and [linked lists](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/collections/struct.PtrSlice.html) allocated from C. This is similar to the older [`glib::GString`](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/struct.GString.html) type, which represents an UTF-8 encoded, `NUL`-terminated C string allocated with the GLib allocator.

Previously (and still for most API), these were converted from/to native Rust types at the FFI boundary, which often caused unnecessary re-allocations and memory copies. In the next release we're trying to move even more API to these new collection types for further performance improvements, and for only doing conversions between Rust and C types when actually necessary.

### Cancelling futures spawned on the GLib main context

[Spawning](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/struct.MainContext.html#method.spawn) futures on the main context now returns the source id. This allows to get access to the underlying [`glib::Source`](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/struct.MainContext.html#method.find_source_by_id) and to [cancel](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/struct.Source.html#method.destroy) the future before completion.

Cancelling the future by this, or by other API that drops it (e.g. by selecting on two futures and only processing the first that resolves), will cancel all asynchronous operations performed by them at the next opportunity.

### Dynamic signal connections

A new [`glib::closure`](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/macro.closure.html) and [`glib::closure_local`](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/macro.closure_local.html) was added that allows to create a [`glib::Closure`](https://gtk-rs.org/gtk-rs-core/stable/0.16/docs/glib/closure/struct.Closure.html) from a Rust closure while automatically unpacking argument [`glib::Value`](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/value/struct.Value.html)s to their native Rust types and packing the return value.

While this doesn't sound too exciting, it makes connecting to signals that have no static bindings more convenient.

**Before**:

```rust
obj.connect(
    "notify", false,
    |args| {
        let _obj = args[0].get::<glib::Object>().unwrap();
        let pspec = args[1].get::<glib::ParamSpec>().unwrap();
        println!("property notify: {}", pspec.name());
    });
```

**After**:

```rust
obj.connect_closure(
    "notify", false,
    glib::closure_local!(|_obj: glib::Object, pspec: glib::ParamSpec| {
        println!("property notify: {}", pspec.name());
    }));
```

The macros support the same syntax as the [`glib::clone`](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/macro.clone.html) macro for creating strong/weak references, plus a [watch](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/macro.closure.html#object-watching) feature that automatically disconnects the closure once the watched object disappears.

### Object subclassing improvements

`glib::ParamSpecOverride` has now two helper constructors to create an override of a class property or an interface property. For example, overriding the `hadjustment` property of the `gtk::Scrollable` interface can be done with `ParamSpecOverride::for_interface::<gtk::Scrollable>("hadjustment")`.

### Passing Cairo image surfaces to other threads and getting owned access to its data

`Cairo` image surfaces [can now be converted](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/cairo/struct.ImageSurface.html#method.take_data) to an owned value that behaves like an `&mut [u8]` and that can be safely sent to different threads. This allows both sending `Cairo` image surfaces to other threads safely as well as their underlying data, e.g. to fill an image surface from a compressed image via the [image](https://crates.io/crates/image) crate or saving the contents of an image surface to compressed data from a different thread.

```rust
let surface =  cairo::ImageSurface::create(cairo::Format:ARgb32, 320, 240).except("Failed to allocate memory");
// Use Cairo API on the `surface`.
// [...]
let data = surface.take_data().expect("Not the unique owner of the surface");
// Send `data` to another thread or otherwise treat it as a `&mut [u8]`.
// [...]
let surface = data.into_inner();
// Use the `surface` with Cairo APIs again.
```

This solves one of the common problems when using `Cairo` in multi-threaded applications.

### GIO bindings improvements

The gio bindings saw many additions and improvements. Among other things it is now possible to implement the [`gio::Initable`](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/gio/struct.Initable.html) interface, the [`gio::IOExtention`](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/gio/struct.IOExtension.html) API is now available, and the [`gio::Task`](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/gio/struct.Task.html) bindings have been reworked to address soundness issues. More improvements to the `gio::Task` bindings are necessary for them to become nice to use from Rust.

### Gdkwayland

In this release, we generated the bindings for `gdkwayland`. You can now use the brand new [gdkwayland](https://crates.io/crates/gdkwayland) crate!

### GTK3 child properties

The GTK3 bindings had API added for generically [setting](https://gtk-rs.org/gtk3-rs/stable/0.15/docs/gtk/prelude/trait.ContainerExtManual.html#tymethod.child_set_property) and [getting](https://gtk-rs.org/gtk3-rs/stable/0.15/docs/gtk/prelude/trait.ContainerExtManual.html#tymethod.child_property) child properties.

This allows to access child properties for which no static bindings are available and performs all checks at runtime instead of at compile time. The API works the same as the API for [setting](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/object/trait.ObjectExt.html#tymethod.set_property) and [getting](https://gtk-rs.org/gtk-rs-core/stable/0.15/docs/glib/object/trait.ObjectExt.html#tymethod.property) object properties.

### gtk4-rs and `BuilderScope`

The most important feature that landed on this release is a Rust `BuilderScope` implementation thanks to one of the awesome contributions of [@jf2048][@jf2048]. This will allow applications to set callbacks/functions names in the UI file and define those in your Rust code. This only works with the CompositeTemplate macro. See the [documentations](https://gtk-rs.org/gtk4-rs/stable/latest/docs/gtk4_macros/attr.template_callbacks.html) for how to make use of this new feature.

We also added:

 - Trust upstream return nullability: in other words, [gtk4][gtk4] crates trust the nullable annotations provided in the `GIR` file which replaces a bunch of returned Option and returns only T nowadays. Please open an issue if you find any regressions.
 - GTK 4.6 support, use `v4_6` feature to unlock the new APIs.
 - Functions that return a `glib::Value` have now a corresponding function that gets you inner value `T` directly. Note those will panic if you provide the wrong type.
 - `GtkExpression` helpers to make their usage nicer from Rust:
   ```rust
   let button = gtk::Button::new();
   button.set_label("Label property");

   let label_expression = button.property_expression("label");
   ```
 - A bunch of fixed issues, documentation improvements and new book chapters!

## Other crates

Other than the classic [gtk-rs][gtk-rs] crates, we have also worked on ensuring the ones in https://gitlab.gnome.org/World/Rust and the broader ecosystem received an update:

 - [gstreamer-rs](https://gstreamer.freedesktop.org/news/#2022-01-16T11:00:00Z): release 0.18
 - [libadwaita-rs](https://world.pages.gitlab.gnome.org/Rust/libadwaita-rs/): release 0.1 following up the release of the first stable version 1.0
 - [sourceview5-rs](https://world.pages.gitlab.gnome.org/Rust/sourceview5-rs/): updated to 0.4, with subclassing support
 - [libshumate-rs](https://world.pages.gitlab.gnome.org/Rust/libshumate-rs/): released an alpha for the GTK4 Map widgetery library
 - [sourceview4-rs](https://world.pages.gitlab.gnome.org/Rust/sourceview4-rs/)/[libhandy-rs](https://world.pages.gitlab.gnome.org/Rust/libhandy-rs/)/[libdazzle-rs](https://world.pages.gitlab.gnome.org/Rust/libdazzle-rs/)/[gspell-rs](https://world.pages.gitlab.gnome.org/Rust/gspell-rs/)/[poppler-rs](https://world.pages.gitlab.gnome.org/Rust/poppler-rs/)
 - [libflatpak-rs](https://world.pages.gitlab.gnome.org/Rust/libflatpak-rs/): first release of the libflatpak bindings
 - [Relm4](https://github.com/AaronErhardt/Relm4): release 0.4, with many new features and improvements

### Changes

For the interested ones, here is the list of the merged pull requests:

[gtk-rs-core](https://github.com/gtk-rs/gtk-rs-core):

 * uri: re-export URI parsing utilities: [part 1](https://github.com/gtk-rs/gtk-rs-core/pull/167) and [part 2](https://github.com/gtk-rs/gtk-rs-core/pull/169)
 * [Fix some typo and warnings](https://github.com/gtk-rs/gtk-rs-core/pull/170)
 * glib: Fix invalid types let `from_variant` panic [part 1](https://github.com/gtk-rs/gtk-rs-core/pull/165) and [part 2](https://github.com/gtk-rs/gtk-rs-core/pull/171)
 * [Fix some typo and warnings](https://github.com/gtk-rs/gtk-rs-core/pull/168)
 * Remove unwanted warnings from the clone macro: [part 1](https://github.com/gtk-rs/gtk-rs-core/pull/183) and [part 2](https://github.com/gtk-rs/gtk-rs-core/pull/185)
 * [Make stronger guarantees on `ToValue`](https://github.com/gtk-rs/gtk-rs-core/pull/188)
 * [Add cairo::Result type alias](https://github.com/gtk-rs/gtk-rs-core/pull/184)
 * [Replace unneeded doc comments with comments](https://github.com/gtk-rs/gtk-rs-core/pull/192)
 * glib: Re-export main context acquire guard: [part 1](https://github.com/gtk-rs/gtk-rs-core/pull/194) and [part 2](https://github.com/gtk-rs/gtk-rs-core/pull/195)
 * [cairo: silence self\_named\_constructor](https://github.com/gtk-rs/gtk-rs-core/pull/217)
 * [glib: ignore unref return value](https://github.com/gtk-rs/gtk-rs-core/pull/215)
 * [gio: Added basic `Initable` implementation](https://github.com/gtk-rs/gtk-rs-core/pull/218)
 * [add pango\_attr\_font\_desc\_new](https://github.com/gtk-rs/gtk-rs-core/pull/222)
 * [Merge README files and crate documentation](https://github.com/gtk-rs/gtk-rs-core/pull/219)
 * [`Variant`, `VariantDict`: Add more type lookup methods](https://github.com/gtk-rs/gtk-rs-core/pull/216)
 * [Add possibility to inspect pango attribute types and downcast them](https://github.com/gtk-rs/gtk-rs-core/pull/221)
 * [Add function to consume raw data of `ImageSurface`](https://github.com/gtk-rs/gtk-rs-core/pull/220)
 * [glib/variant: Expose `g_variant_get_normal_form()`](https://github.com/gtk-rs/gtk-rs-core/pull/223)
 * [glib/variant: add fallible child-value getter](https://github.com/gtk-rs/gtk-rs-core/pull/224)
 * [variant: Use `into_owned()`](https://github.com/gtk-rs/gtk-rs-core/pull/228)
 * [variant: Add more APIs to access typed children](https://github.com/gtk-rs/gtk-rs-core/pull/226)
 * [variant: Add a `bytes()` method.](https://github.com/gtk-rs/gtk-rs-core/pull/227)
 * [variant: Add an API to iterate over `as`](https://github.com/gtk-rs/gtk-rs-core/pull/229)
 * glib: add manual bindings for collation utils: [part 1](https://github.com/gtk-rs/gtk-rs-core/pull/235) and [part 2](https://github.com/gtk-rs/gtk-rs-core/pull/237)
 * [variant: Expose `g\_variant\_byteswap()`](https://github.com/gtk-rs/gtk-rs-core/pull/238)
 * [gio: Fix behavior of `SettingsBindFlags::INVERT\_BOOLEAN`](https://github.com/gtk-rs/gtk-rs-core/pull/239)
 * [Remove the `links` annotations](https://github.com/gtk-rs/gtk-rs-core/pull/243)
 * [glib: adapt to signed vs. unsigned libc::c\_char to fix non-x86 builds](https://github.com/gtk-rs/gtk-rs-core/pull/245)
 * [Implement `to_glib_full()` for `VariantType`](https://github.com/gtk-rs/gtk-rs-core/pull/249)
 * [gio: Generating binding for `g-signal` signal of `DBusProxy`](https://github.com/gtk-rs/gtk-rs-core/pull/250)
 * [Ignore `find_with_equal_func` for `ListStore` until a suitable API is provided by the C library](https://github.com/gtk-rs/gtk-rs-core/pull/205)
 * [gio: Don't leak `transfer none` return values in ActionMap/ActionGrou…](https://github.com/gtk-rs/gtk-rs-core/pull/257)
 * [gio: fix gtask example](https://github.com/gtk-rs/gtk-rs-core/pull/260)
 * [bind gtask run in thread](https://github.com/gtk-rs/gtk-rs-core/pull/261)
 * cairo: Fix up reference counting in `Surface::map_to_image()`: [part 1](https://github.com/gtk-rs/gtk-rs-core/pull/266) and [part 2](https://github.com/gtk-rs/gtk-rs-core/pull/268)
 * [Add more default object implementations](https://github.com/gtk-rs/gtk-rs-core/pull/270)
 * [Regenerate with `impl Trait` instead of named types](https://github.com/gtk-rs/gtk-rs-core/pull/95)
 * [Implement `FromGlibPtrBorrow` for `glib::Value` and `glib::SendValue`](https://github.com/gtk-rs/gtk-rs-core/pull/275)
 * [docs: Fix the examples for variants](https://github.com/gtk-rs/gtk-rs-core/pull/279)
 * [glib: Merge variants of `wrapper!` as much as possible](https://github.com/gtk-rs/gtk-rs-core/pull/280)
 * [Use bool instead of `gboolean` in `graphene` for FFI](https://github.com/gtk-rs/gtk-rs-core/pull/282)
 * [Remove unused dependencies](https://github.com/gtk-rs/gtk-rs-core/pull/288)
 * [Add support for inline-allocated Boxed types and various graphene fixups](https://github.com/gtk-rs/gtk-rs-core/pull/284)
 * [glib: Don't take internal value out of the `Value` struct but instead of `into_raw()`](https://github.com/gtk-rs/gtk-rs-core/pull/290)
 * [cairo: remove target\_os = "ios"](https://github.com/gtk-rs/gtk-rs-core/pull/293)
 * [Remove iOS target from `quartz_surface` in Cairo](https://github.com/gtk-rs/gtk-rs-core/pull/292)
 * [Include the LICENSE file in the published crates](https://github.com/gtk-rs/gtk-rs-core/pull/298)
 * [glib: Implement TimeSpan as a wrapper type with some convenience API](https://github.com/gtk-rs/gtk-rs-core/pull/299)
 * [Declare minimum supported Rust version in Cargo.toml](https://github.com/gtk-rs/gtk-rs-core/pull/295)
 * [Main context fixups](https://github.com/gtk-rs/gtk-rs-core/pull/300)
 * [glib: Provide default implementations for `IsSubclassable` methods](https://github.com/gtk-rs/gtk-rs-core/pull/256)
 * [Allow to change visibility in `glib::wrapper` macro](https://github.com/gtk-rs/gtk-rs-core/pull/304)
 * [Add missing pango attrs and cleanup `glyph*`](https://github.com/gtk-rs/gtk-rs-core/pull/308)
 * [Various Pango fixes](https://github.com/gtk-rs/gtk-rs-core/pull/305)
 * [Make parameters to `gio::ListStore::splice()` more generic](https://github.com/gtk-rs/gtk-rs-core/pull/309)
 * [glib: impl `FromGlibContainerAsVec` for `*const $ffi_name` and for `BoxedInline`](https://github.com/gtk-rs/gtk-rs-core/pull/311)
 * [Minor cleanup as preparation for edition 2021](https://github.com/gtk-rs/gtk-rs-core/pull/312)
 * [pango: implement `DerefMut` for `Attribute`](https://github.com/gtk-rs/gtk-rs-core/pull/313)
 * [Upgrade to edition 2021](https://github.com/gtk-rs/gtk-rs-core/pull/314)
 * [glib: add simpler variants of `ParamSpec::new_override`](https://github.com/gtk-rs/gtk-rs-core/pull/315)
 * [Generate nullable paths](https://github.com/gtk-rs/gtk-rs-core/pull/318)
 * [glib: Add documentation to all undocumented `Object` / `ObjectExt` and related functions](https://github.com/gtk-rs/gtk-rs-core/pull/320)
 * [glib: Fix bug in main context channel test that caused it to deadlock](https://github.com/gtk-rs/gtk-rs-core/pull/321)
 * [object: fix documentation typo](https://github.com/gtk-rs/gtk-rs-core/pull/322)
 * [gio: Add various `gio::File` missing functions](https://github.com/gtk-rs/gtk-rs-core/pull/319)
 * [gio: add manual bindings for `GIOExtension`](https://github.com/gtk-rs/gtk-rs-core/pull/316)
 * [Change `None` constants as associated constants](https://github.com/gtk-rs/gtk-rs-core/pull/327)
 * [glib: Assert that the memory allocated by GLib for the private instance data is aligned correctly](https://github.com/gtk-rs/gtk-rs-core/pull/328)
 * [pango: Add missing `Matrix` methods](https://github.com/gtk-rs/gtk-rs-core/pull/330)
 * [glib: add a `Value::get_owned`](https://github.com/gtk-rs/gtk-rs-core/pull/325)
 * [gio: Make progress callback in `File::copy_async` optional](https://github.com/gtk-rs/gtk-rs-core/pull/331)
 * [glib: Remove `glib::String` bindings](https://github.com/gtk-rs/gtk-rs-core/pull/332)
 * [Remove `Into<&str>` trait bounds and directly use `&str`](https://github.com/gtk-rs/gtk-rs-core/pull/333)
 * [glib: Add support for `BTreeMap` in `Variant`](https://github.com/gtk-rs/gtk-rs-core/pull/334)
 * [Add ObjectExt helpers](https://github.com/gtk-rs/gtk-rs-core/pull/323)
 * [glib: make error `message()` public](https://github.com/gtk-rs/gtk-rs-core/pull/339)
 * [glib: Lots of `Variant` / `VariantType` improvements](https://github.com/gtk-rs/gtk-rs-core/pull/340)
 * [glib-macros: Add a `Variant` trait derive macro](https://github.com/gtk-rs/gtk-rs-core/pull/341)
 * [Some more `Variant` API additions](https://github.com/gtk-rs/gtk-rs-core/pull/344)
 * [glib: Fix `Deref` impls for `FixedSizeVariantArray`](https://github.com/gtk-rs/gtk-rs-core/pull/347)
 * [glib: Mark wrapper structs for `Shared`/`Object`/`Boxed`/`Type` as `#\[repr(transparent)\]`](https://github.com/gtk-rs/gtk-rs-core/pull/348)
 * [macros: implement `FromGlibNone`/`Full` for shared boxed types](https://github.com/gtk-rs/gtk-rs-core/pull/346)
 * [glib: Implement `Send`/`Sync`/`PartialOrd`/`Ord`/`Hash` on `GPtrSlice`/`GSlice`](https://github.com/gtk-rs/gtk-rs-core/pull/349)
 * [glib: Re-use paramspec names instead of creating a new NUL-terminated…](https://github.com/gtk-rs/gtk-rs-core/pull/351)
 * [glib: Simplify enum/flags class implementation](https://github.com/gtk-rs/gtk-rs-core/pull/352)
 * [pango: take a generic attr in `AttrList` methods](https://github.com/gtk-rs/gtk-rs-core/pull/354)
 * [macros: make `ParentType` optional](https://github.com/gtk-rs/gtk-rs-core/pull/356)
 * [Add wrapper type around `GList` / `GSList` and various container cleanups/improvements](https://github.com/gtk-rs/gtk-rs-core/pull/355)
 * [Remove `glib::Array` bindings and make `glib::ByteArray` bindings safer (plus micro-optimization)](https://github.com/gtk-rs/gtk-rs-core/pull/358)
 * [gio: don't expose task module](https://github.com/gtk-rs/gtk-rs-core/pull/360)
 * [gdk-pixbuf: generate missing auto bindings](https://github.com/gtk-rs/gtk-rs-core/pull/361)
 * [Add gclosure macro](https://github.com/gtk-rs/gtk-rs-core/pull/338)
 * [Simplify `IsImplementable` implementations](https://github.com/gtk-rs/gtk-rs-core/pull/363)
 * [Add `GStringBuilder` and generate Variant type signatures with only safe code](https://github.com/gtk-rs/gtk-rs-core/pull/359)
 * [glib: Add doc alias for `g_error_new()` to `glib::Error::new()`](https://github.com/gtk-rs/gtk-rs-core/pull/371)
 * [glib: Implement `Send`/`Sync` for `List`/`SList` if the items implement the corresponding trait](https://github.com/gtk-rs/gtk-rs-core/pull/372)
 * [Rename ffi crates on Cargo.toml instead of inside source code](https://github.com/gtk-rs/gtk-rs-core/pull/374)
 * [glib: Implement `FromValue` for references of object/shared/boxed types](https://github.com/gtk-rs/gtk-rs-core/pull/376)
 * [glib: Fix missing indirection in previous commit and add tests](https://github.com/gtk-rs/gtk-rs-core/pull/377)
 * [glib: Use plain FFI functions instead of a GClosure for the property binding transform functions](https://github.com/gtk-rs/gtk-rs-core/pull/381)
 * [glib: Validate signal class handler return value and arguments when chaining up](https://github.com/gtk-rs/gtk-rs-core/pull/380)
 * [glib: Mark `g_get_user_special_dir()` return value as `nullable`](https://github.com/gtk-rs/gtk-rs-core/pull/383)
 * [Rename various constructors for consistency](https://github.com/gtk-rs/gtk-rs-core/pull/384)
 * [glib: Fix `FromValue` implementations for `&Boxed`, `&Shared` and `&Object`](https://github.com/gtk-rs/gtk-rs-core/pull/385)
 * [glib: Add API for non-destructive iteration over a `List` / `SList`](https://github.com/gtk-rs/gtk-rs-core/pull/386)
 * [glib: Add new trait for allowing to unwrap the return value of `Closure::emit()` directly instead of working with `glib::Value`](https://github.com/gtk-rs/gtk-rs-core/pull/366)
 * [macros: Update macro syntax for `enum`, `flags`, `boxed` and `variant`](https://github.com/gtk-rs/gtk-rs-core/pull/364)
 * [glib: return a `ParamSpec` for override methods](https://github.com/gtk-rs/gtk-rs-core/pull/393)
 * [glib: add missing doc-aliases to `Type`](https://github.com/gtk-rs/gtk-rs-core/pull/395)
 * [Generate missing const doc aliases](https://github.com/gtk-rs/gtk-rs-core/pull/397)
 * [glib: make `spawn\*()` return the `SourceId`](https://github.com/gtk-rs/gtk-rs-core/pull/400)
 * [glib/gir: ignore `g_clear_error`](https://github.com/gtk-rs/gtk-rs-core/pull/402)
 * [glib: Fix accumulator trampoline in signals defined from Rust](https://github.com/gtk-rs/gtk-rs-core/pull/403)
 * [glib: specify it's a `Variant` struct and not a derive macro](https://github.com/gtk-rs/gtk-rs-core/pull/404)
 * [graphene: add getters/setters for `Size`/`Point`/`Point3D`](https://github.com/gtk-rs/gtk-rs-core/pull/389)
 * [glib: add `ObjectSubclassIsExt` trait with `impl_` method](https://github.com/gtk-rs/gtk-rs-core/pull/405)
 * [pango: allow for the modifying `GlyphInfo` and `GlyphGeometry`](https://github.com/gtk-rs/gtk-rs-core/pull/413)
 * [glib: Implement `ValueTypeOptional` for shared/boxed/object types in `glib::wrapper`](https://github.com/gtk-rs/gtk-rs-core/pull/420)
 * [glib: add `AnyGObject`](https://github.com/gtk-rs/gtk-rs-core/pull/410)
 * [gio: impl `std::iter::Extend` for `gio::ListStore`](https://github.com/gtk-rs/gtk-rs-core/pull/421)
 * [gio: Implement `Extend` on `ListStore` for `AsRef<Object>`](https://github.com/gtk-rs/gtk-rs-core/pull/428)
 * [glib: Implement `ToValue` on `signal::Inhibit`](https://github.com/gtk-rs/gtk-rs-core/pull/430)
 * [gio: add `ListModel::snapshot` and implement `IntoIterator` for `ListModel`](https://github.com/gtk-rs/gtk-rs-core/pull/427)
 * [glib-macros: Use absolute paths in proc macros](https://github.com/gtk-rs/gtk-rs-core/pull/432)
 * [glib: Add a helper trait for getting an object from a wrapper or subclass](https://github.com/gtk-rs/gtk-rs-core/pull/435)
 * [Use impl\_() in tests/examples instead of from\_instance()](https://github.com/gtk-rs/gtk-rs-core/pull/433)
 * [glib: Rename `impl_` to `imp`](https://github.com/gtk-rs/gtk-rs-core/pull/437)
 * [gio: mark `content_type_guess` parameter as filename](https://github.com/gtk-rs/gtk-rs-core/pull/438)
 * [glib: Add Object::NONE const](https://github.com/gtk-rs/gtk-rs-core/pull/440)
 * [glib: ignore various unneeded functions](https://github.com/gtk-rs/gtk-rs-core/pull/412)
 * [glib: manually implement `ParamSpec::is_valid_name`](https://github.com/gtk-rs/gtk-rs-core/pull/444)
 * [gio: Make `Task` binding sound and support generics in the `wrapper!` macro](https://github.com/gtk-rs/gtk-rs-core/pull/446)
 * [glib: Reduce allocations in `g_log` bindings](https://github.com/gtk-rs/gtk-rs-core/pull/449)
 * [gio: require `Send` also for the source object](https://github.com/gtk-rs/gtk-rs-core/pull/453)
 * [gio: mark creating `Task` as unsafe and add public documentation](https://github.com/gtk-rs/gtk-rs-core/pull/455)
 * [gio: generate `SimpleProxyResolver`](https://github.com/gtk-rs/gtk-rs-core/pull/458)
 * [gio: generate missing errors](https://github.com/gtk-rs/gtk-rs-core/pull/459)
 * [glib: Correctly validate signal argument types in `emit_with_details()` variants](https://github.com/gtk-rs/gtk-rs-core/pull/461)
 * [glib: Don't query signals twice when connecting](https://github.com/gtk-rs/gtk-rs-core/pull/463)
 * [glib: Handle zero `Quark`s correctly](https://github.com/gtk-rs/gtk-rs-core/pull/464)
 * [glib: implement `From<Infallible>` for error types](https://github.com/gtk-rs/gtk-rs-core/pull/465)
 * [cairo: Implement `Send+Sync` for `ImageSurfaceData` and `ImageSurfaceDataOwned`](https://github.com/gtk-rs/gtk-rs-core/pull/470)
 * [cairo: Allow converting `ImageSurfaceDataOwned` back into an `ImageSurface`](https://github.com/gtk-rs/gtk-rs-core/pull/471)

[gtk3-rs](https://github.com/gtk-rs/gtk3-rs):

 * [Bump minimum required version to 1.53.0](https://github.com/gtk-rs/gtk3-rs/pull/612)
 * [gtk: Acquire and leak main context in `gtk::init()`](https://github.com/gtk-rs/gtk3-rs/pull/614)
 * [gtk: Make `Clipboard::request_image` pixbuf an `Option`](https://github.com/gtk-rs/gtk3-rs/pull/621)
 * [gdk: Don't require `&mut self` for `Event` getters](https://github.com/gtk-rs/gtk3-rs/pull/626)
 * [gtk: Add test for `gtk::init()` and port `TEST_THREAD_WORKER` from gtk4](https://github.com/gtk-rs/gtk3-rs/pull/617)
 * [gtk: Make `ButtonImpl` depend on `BinImpl`](https://github.com/gtk-rs/gtk3-rs/pull/629)
 * [gtk: Nullable callback param](https://github.com/gtk-rs/gtk3-rs/pull/630)
 * [gtk: Add more default object implementations](https://github.com/gtk-rs/gtk3-rs/pull/634)
 * [Add support for inline-allocated Boxed types](https://github.com/gtk-rs/gtk3-rs/pull/639)
 * [gdk: Fix `RGBA::parse()` signature and implement `FromStr`](https://github.com/gtk-rs/gtk3-rs/pull/641)
 * [Mark simple structs as `BoxedInline`](https://github.com/gtk-rs/gtk3-rs/pull/649)
 * [Simplify various `IsSubclassable` implementations](https://github.com/gtk-rs/gtk3-rs/pull/650)
 * [examples: fix pango attributes per gtk-rs-core changes](https://github.com/gtk-rs/gtk3-rs/pull/652)
 * [Update to 2021 Rust Edition](https://github.com/gtk-rs/gtk3-rs/pull/653)
 * [gtk: Add missing methods on `TreeViewColumn`](https://github.com/gtk-rs/gtk3-rs/pull/654)
 * [gtk: Rename `Window::focus` into `Windows::focused_widget`](https://github.com/gtk-rs/gtk3-rs/pull/655)
 * [gdk: remove unsafe marker for `Atom::value`](https://github.com/gtk-rs/gtk3-rs/pull/656)
 * [gtk: panic if gtk wasn't init at `class_init`](https://github.com/gtk-rs/gtk3-rs/pull/657)
 * [gdk: add helpers for checking which display is being used](https://github.com/gtk-rs/gtk3-rs/pull/658)
 * [examples: Don't silently ignore errors when property bindings can't be established](https://github.com/gtk-rs/gtk3-rs/pull/659)
 * [gdk: bind `WaylandWindow` manually](https://github.com/gtk-rs/gtk3-rs/pull/660)
 * [gtk: implement subclassing for `Scrolledwindow`](https://github.com/gtk-rs/gtk3-rs/pull/661)
 * [Replace `None` constants as associated constants](https://github.com/gtk-rs/gtk3-rs/pull/662)
 * [Update per `ObjectExt` changes](https://github.com/gtk-rs/gtk3-rs/pull/663)
 * [examples: update per pango::AttrList simplification](https://github.com/gtk-rs/gtk3-rs/pull/671)
 * [gdkwayland: Add missing wayland types and create new gdkwayland crate](https://github.com/gtk-rs/gtk3-rs/pull/665)
 * [gdk: add setters to `RGBA`](https://github.com/gtk-rs/gtk3-rs/pull/673)
 * [gtk: Fix usage of `pthread_main_np()` return value](https://github.com/gtk-rs/gtk3-rs/pull/675)
 * [gtk3-macros: make the doc example building](https://github.com/gtk-rs/gtk3-rs/pull/682)
 * [Simplify imports in doc example](https://github.com/gtk-rs/gtk3-rs/pull/683)
 * [Generate missing doc aliases for consts](https://github.com/gtk-rs/gtk3-rs/pull/685)
 * [gtk: manually implement `gtk_print_operation_get_error`](https://github.com/gtk-rs/gtk3-rs/pull/689)
 * [gtk/builder: manually implement several methods (custom return codes)](https://github.com/gtk-rs/gtk3-rs/pull/691)
 * [Rename `impl_` to `imp`](https://github.com/gtk-rs/gtk3-rs/pull/694)
 * [gtk: manually implement `Container::(get|set)_property`](https://github.com/gtk-rs/gtk3-rs/pull/699)

[gtk4-rs](https://github.com/gtk-rs/gtk4-rs):

 * [book: Fix explanation in gobject memory management](https://github.com/gtk-rs/gtk4-rs/pull/589)
 * [book: Improve `todo_app` listing](https://github.com/gtk-rs/gtk4-rs/pull/583)
 * [Fixed small typo in Virtual methods example README](https://github.com/gtk-rs/gtk4-rs/pull/588)
 * [book: Use weak reference in `gobject_memory_managment`](https://github.com/gtk-rs/gtk4-rs/pull/590)
 * [book: Rename listing app-id to org.gtk-rs](https://github.com/gtk-rs/gtk4-rs/pull/598)
 * [book: Finish up remainder of app-id](https://github.com/gtk-rs/gtk4-rs/pull/599)
 * [book: Mention that expressions only go in one direction](https://github.com/gtk-rs/gtk4-rs/pull/600)
 * [book: Add "Actions & Menus" chapter](https://github.com/gtk-rs/gtk4-rs/pull/577)
 * [book: Add headings to existing chapters](https://github.com/gtk-rs/gtk4-rs/pull/602)
 * [book: Fix action name in book listing](https://github.com/gtk-rs/gtk4-rs/pull/605)
 * [gtk: Add more manual default implementations](https://github.com/gtk-rs/gtk4-rs/pull/595)
 * [book: Add `Variant` to `gobject_values` chapter ](https://github.com/gtk-rs/gtk4-rs/pull/601)
 * [gdk: expose `EventKind`](https://github.com/gtk-rs/gtk4-rs/pull/609)
 * [gsk: rename `Renderer` trait](https://github.com/gtk-rs/gtk4-rs/pull/608)
 * [gdk: fix `ToplevelSize::bounds`](https://github.com/gtk-rs/gtk4-rs/pull/611)
 * [Add support for inline-allocated `Boxed` types](https://github.com/gtk-rs/gtk4-rs/pull/615)
 * [book: Fix meson build instruction](https://github.com/gtk-rs/gtk4-rs/pull/625)
 * [book: Fix shortcut in todo listing](https://github.com/gtk-rs/gtk4-rs/pull/592)
 * [gtk: Fixed a typo in the README.md](https://github.com/gtk-rs/gtk4-rs/pull/626)
 * [gtk/gsk: remove C convenience functions](https://github.com/gtk-rs/gtk4-rs/pull/629)
 * [book: Add chapter about todo\_app\_2](https://github.com/gtk-rs/gtk4-rs/pull/620)
 * [gtk: make `*_set_sort_func` use `gtk::Ordering`](https://github.com/gtk-rs/gtk4-rs/pull/635)
 * [examples: Add an example for a widget that scales its child](https://github.com/gtk-rs/gtk4-rs/pull/634)
 * [wayland: Update to wayland-client 0.29](https://github.com/gtk-rs/gtk4-rs/pull/638)
 * [simplify `IsSubclassable` implementations](https://github.com/gtk-rs/gtk4-rs/pull/631)
 * [gtk: don't deref a null ptr on `EntryBuffer`](https://github.com/gtk-rs/gtk4-rs/pull/640)
 * [gtk: take the closure on last param for `ClosureExpression`](https://github.com/gtk-rs/gtk4-rs/pull/642)
 * [gtk: manually implement `FileChooser::add_choice`](https://github.com/gtk-rs/gtk4-rs/pull/612)
 * [gtk-macros: `CompositeTemplate`: support setting internal-child to true](https://github.com/gtk-rs/gtk4-rs/pull/531)
 * [book: Fix videos](https://github.com/gtk-rs/gtk4-rs/pull/641)
 * [gtk: drop unneeded builders](https://github.com/gtk-rs/gtk4-rs/pull/643)
 * [gtk: manually implement `PrintSettings::set_page_ranges`](https://github.com/gtk-rs/gtk4-rs/pull/644)
 * [gtk: ignore `StringList::take`](https://github.com/gtk-rs/gtk4-rs/pull/651)
 * [gdk: drop automatic `device_tool getter` for `Device`](https://github.com/gtk-rs/gtk4-rs/pull/650)
 * [gdk: bind `Event::get_device_tool`](https://github.com/gtk-rs/gtk4-rs/pull/649)
 * [book: Use `splice` in lists listings](https://github.com/gtk-rs/gtk4-rs/pull/652)
 * [gtk: manually implement `Shortcut::with_arguments`](https://github.com/gtk-rs/gtk4-rs/pull/645)
 * [gtk: Implement missing `Event` functions](https://github.com/gtk-rs/gtk4-rs/pull/653)
 * [book/examples: Use dash instead of underline for properties](https://github.com/gtk-rs/gtk4-rs/pull/660)
 * [gtk: manually implement more functions](https://github.com/gtk-rs/gtk4-rs/pull/658)
 * [gtk: manually implement `CellLayout::set_attributes`](https://github.com/gtk-rs/gtk4-rs/pull/665)
 * [gtk: manually implement `accelerator_parse_with_keycode`](https://github.com/gtk-rs/gtk4-rs/pull/666)
 * [gtk: free memory on `Drop` for `set_qdata` uses](https://github.com/gtk-rs/gtk4-rs/pull/667)
 * [gdk: add helpers for checking which display is being used](https://github.com/gtk-rs/gtk4-rs/pull/534)
 * [book: Add docs for `Builder` and `Menu`](https://github.com/gtk-rs/gtk4-rs/pull/661)
 * [book: Mention string list in lists chapter](https://github.com/gtk-rs/gtk4-rs/pull/657)
 * [gsk: drop manual `FromGlibContainerAsVec` implementation for `ColorStop`](https://github.com/gtk-rs/gtk4-rs/pull/672)
 * [book: Simplify `splice` usage](https://github.com/gtk-rs/gtk4-rs/pull/671)
 * [gtk: Implement `FromIterator`/`Extend` for `StringList`](https://github.com/gtk-rs/gtk4-rs/pull/675)
 * [gdk-x11: generate missing functions](https://github.com/gtk-rs/gtk4-rs/pull/679)
 * [book: Fix todo\_app\_2 chapter](https://github.com/gtk-rs/gtk4-rs/pull/681)
 * [Replace `None` constants as associated constants](https://github.com/gtk-rs/gtk4-rs/pull/684)
 * [book: Add cross-platform installation instructions](https://github.com/gtk-rs/gtk4-rs/pull/670)
 * [gdk: remove `MemoryFormat::NFormats`](https://github.com/gtk-rs/gtk4-rs/pull/689)
 * [book: Fix book link](https://github.com/gtk-rs/gtk4-rs/pull/699)
 * [Improves variants for getters that returns `glib::Value`](https://github.com/gtk-rs/gtk4-rs/pull/690)
 * [gtk: Add `SymbolicPaintable`](https://github.com/gtk-rs/gtk4-rs/pull/702)
 * [gtk: Use `impl IntoIterator<Item = Expression>` in `ClosureExpression` params](https://github.com/gtk-rs/gtk4-rs/pull/703)
 * [gtk: Allow slices on `ClosureExpression`'s params](https://github.com/gtk-rs/gtk4-rs/pull/704)
 * [gtk: Add `PropExpr` and `ChainExpr` as convenience traits to chain `GtkExpressions`](https://github.com/gtk-rs/gtk4-rs/pull/694)
 * [Remove unnecessary clone](https://github.com/gtk-rs/gtk4-rs/pull/709)
 * [book: Use the new expressions API](https://github.com/gtk-rs/gtk4-rs/pull/708)
 * [drop `instance_init` per `IsImplementable` changes](https://github.com/gtk-rs/gtk4-rs/pull/715)
 * [gdk: Add setters to `RGBA` and missing builder methods](https://github.com/gtk-rs/gtk4-rs/pull/716)
 * [gtk: Reduce number of allocations in `accelerator_parse_with_keycode`](https://github.com/gtk-rs/gtk4-rs/pull/718)
 * [gtk: backport macos fix for the main thread](https://github.com/gtk-rs/gtk4-rs/pull/720)
 * [gsk: drop empty functions module](https://github.com/gtk-rs/gtk4-rs/pull/721)
 * [docs: add very brief info for each subclass module](https://github.com/gtk-rs/gtk4-rs/pull/724)
 * [gsk: fix `Renderer` trait name](https://github.com/gtk-rs/gtk4-rs/pull/725)
 * [gtk: manually implement `gtk_print_operation_get_error`](https://github.com/gtk-rs/gtk4-rs/pull/744)
 * [gdkx11: manually implement `xevent` signal](https://github.com/gtk-rs/gtk4-rs/pull/747)
 * [gtk: manually implement callback getters](https://github.com/gtk-rs/gtk4-rs/pull/751)
 * [gtk: re-implement missing `TextBuffer` functions](https://github.com/gtk-rs/gtk4-rs/pull/636)
 * [book: Add chapter about CSS](https://github.com/gtk-rs/gtk4-rs/pull/711)
 * [book: Move icon section from css to actions](https://github.com/gtk-rs/gtk4-rs/pull/754)
 * [gdkx11: don't mark safe functions as unsafe](https://github.com/gtk-rs/gtk4-rs/pull/755)
 * [gdkx11: fixes](https://github.com/gtk-rs/gtk4-rs/pull/756)
 * [gdkx11: Allow chaining expressions with `Closure` objects](https://github.com/gtk-rs/gtk4-rs/pull/714)
 * [gtk: Add method to create a "this" expression from `GObject` types](https://github.com/gtk-rs/gtk4-rs/pull/710)
 * [book: Fix code snippets and some formatting in `gobject_memory_management`](https://github.com/gtk-rs/gtk4-rs/pull/757)
 * [book: Extend action chapter to mention `PropertyAction`](https://github.com/gtk-rs/gtk4-rs/pull/760)
 * [examples: Update to glium 0.31](https://github.com/gtk-rs/gtk4-rs/pull/769)
 * [gdk: add associative constants for keys](https://github.com/gtk-rs/gtk4-rs/pull/773)
 * [book: Use `imp()` everywhere instead of `from_instance()`, `impl_()`](https://github.com/gtk-rs/gtk4-rs/pull/776)
 * [book: Fix broken `set_state` link](https://github.com/gtk-rs/gtk4-rs/pull/782)
 * [gtk: string list: implement `Default`](https://github.com/gtk-rs/gtk4-rs/pull/784)
 * [gdk: trust nullability annotations](https://github.com/gtk-rs/gtk4-rs/pull/786)
 * [gtk: Rework AccessibleExtManual](https://github.com/gtk-rs/gtk4-rs/pull/775)
 * [gdk/gtk/gsk: manually implement `Debug` for shared types](https://github.com/gtk-rs/gtk4-rs/pull/793)
 * [gtk: use `ToVariant` for `Actionable::set_action_target`](https://github.com/gtk-rs/gtk4-rs/pull/792)
 * [gtk: provide gdk backend information to dependencies](https://github.com/gtk-rs/gtk4-rs/pull/794)
 * [gdk: add sanity checks for `Texture::download`](https://github.com/gtk-rs/gtk4-rs/pull/765)
 * [gdk: Implement `Send+Sync` for `Texture`](https://github.com/gtk-rs/gtk4-rs/pull/795)
 * [gtk: Automatically generate `ParamSpecExpression`](https://github.com/gtk-rs/gtk4-rs/pull/797)
 * [examples: Add a custom model example](https://github.com/gtk-rs/gtk4-rs/pull/770)
 * [book: Use the predefined action "window.close"](https://github.com/gtk-rs/gtk4-rs/pull/805)
 * [book: Fix error message for `activate_action`](https://github.com/gtk-rs/gtk4-rs/pull/813)
 * [examples: Add composite template callback macro](https://github.com/gtk-rs/gtk4-rs/pull/691)
 * [examples: Add example of a Rotation Bin widget](https://github.com/gtk-rs/gtk4-rs/pull/740)

All this was possible thanks to the [gtk-rs/gir](https://github.com/gtk-rs/gir) project as well:

 * [Fix doc condition for warning](https://github.com/gtk-rs/gir/pull/1196)
 * [docs: disable language warning for various languages](https://github.com/gtk-rs/gir/pull/1201)
 * [docs: don't generate for properties with getter/setter](https://github.com/gtk-rs/gir/pull/1187)
 * [book: Replace `shell` with `console` codeblocks](https://github.com/gtk-rs/gir/pull/1206)
 * [Remove the `links` annotations](https://github.com/gtk-rs/gir/pull/1210)
 * [Do not generate `Default` implementation for `Option<>`](https://github.com/gtk-rs/gir/pull/1212)
 * [codegen/flags: Put doc attribute on struct instead of macro calls](https://github.com/gtk-rs/gir/pull/1213)
 * [Update system-deps version in generated crates](https://github.com/gtk-rs/gir/pull/1215)
 * [Config for nullable callback param](https://github.com/gtk-rs/gir/pull/1217)
 * [Fix parameter setting by applying it to the `rust_parameters` field as well](https://github.com/gtk-rs/gir/pull/1218)
 * [Add default impls for all objects](https://github.com/gtk-rs/gir/pull/1222)
 * [Use `impl Trait` instead of generic type names with trait bound](https://github.com/gtk-rs/gir/pull/1153)
 * [Update to system-deps 5](https://github.com/gtk-rs/gir/pull/1223)
 * [build: Emit rerun-if-changed for branch file on `ref: ` HEAD](https://github.com/gtk-rs/gir/pull/1224)
 * [Handle nullability configuration for async function return values](https://github.com/gtk-rs/gir/pull/1227)
 * [Always output git short revisions with 12 characters](https://github.com/gtk-rs/gir/pull/1228)
 * [Remove type version heuristics](https://github.com/gtk-rs/gir/pull/1229)
 * [Handle objects correctly where a supertype has a newer version than the type itself](https://github.com/gtk-rs/gir/pull/1230)
 * [Special case C `_Bool` by treating it like a Rust bool instead of gboolean](https://github.com/gtk-rs/gir/pull/1232)
 * [Implement support for inline allocated `Boxed` types](https://github.com/gtk-rs/gir/pull/1234)
 * [book: Fix references to the `girs_dir` config option](https://github.com/gtk-rs/gir/pull/1239)
 * [book: Remove suggestions to add `extern crate` imports](https://github.com/gtk-rs/gir/pull/1240)
 * [book: Add a section on fixing missing macros](https://github.com/gtk-rs/gir/pull/1242)
 * [book: Fix sys crate import to use the 'ffi' convention.](https://github.com/gtk-rs/gir/pull/1241)
 * [Add `use glib::translate::*` for generating the equal special function](https://github.com/gtk-rs/gir/pull/1243)
 * [Switch to 2021 edition](https://github.com/gtk-rs/gir/pull/1244)
 * [analysis: mark `to_str` functions as renamed](https://github.com/gtk-rs/gir/pull/1237)
 * [codegen: generate deprecated cfg attribute for Default trait](https://github.com/gtk-rs/gir/pull/1248)
 * [Fix support for nullable paths / `OsString`s](https://github.com/gtk-rs/gir/pull/1245)
 * [codegen: generate `NONE` constants as associated constants](https://github.com/gtk-rs/gir/pull/1253)
 * [codegen: simplify properties getters/setters](https://github.com/gtk-rs/gir/pull/1255)
 * [codegen: fix a logic issue in `version_condition_no_doc`](https://github.com/gtk-rs/gir/pull/1258)
 * [codegen: don't assume child props are gtk only](https://github.com/gtk-rs/gir/pull/1259)
 * [codegen: don't re-export builder types on crate root](https://github.com/gtk-rs/gir/pull/1263)
 * [codegen: generate builders inside a builders module](https://github.com/gtk-rs/gir/pull/1264)
 * [Correctly generate opaque types](https://github.com/gtk-rs/gir/pull/1262)
 * [codegen: don't generate a functions mod if it's empty](https://github.com/gtk-rs/gir/pull/1265)
 * [codegen: don't generate empty impl blocks](https://github.com/gtk-rs/gir/pull/1266)
 * [codegen: stop renaming crates inside sys generated code](https://github.com/gtk-rs/gir/pull/1267)
 * [Remove "auto" folder when regenarating non-sys crate](https://github.com/gtk-rs/gir/pull/1270)
 * [Update to system-deps 6](https://github.com/gtk-rs/gir/pull/1272)
 * [Move auto folder removal into gir directly](https://github.com/gtk-rs/gir/pull/1271)
 * [Only use `remove_dir_all` if there is a folder to remove](https://github.com/gtk-rs/gir/pull/1273)
 * [Mark gi-docgen as optional](https://github.com/gtk-rs/gir/pull/1274)
 * [gir: fix per `emit_by_name` change](https://github.com/gtk-rs/gir/pull/1275)
 * [Add `#\[must\_use\]` to the autogenerated builder types](https://github.com/gtk-rs/gir/pull/1280)
 * [codegen/function: assert sane GError behavior](https://github.com/gtk-rs/gir/pull/1281)
 * [docs: work around glib::Variant case](https://github.com/gtk-rs/gir/pull/1282)
 * [docs: allow documenting global functions in traits](https://github.com/gtk-rs/gir/pull/1284)
 * [sys: stop importing `time_t`](https://github.com/gtk-rs/gir/pull/1283)
 * [docs: allow to set `doc_struct_name` for global functions](https://github.com/gtk-rs/gir/pull/1285)
 * [codegen: trim extra `_async` in future variants](https://github.com/gtk-rs/gir/pull/1286)
 * [writer: check return code as `gboolean`](https://github.com/gtk-rs/gir/pull/1287)
 * [docs: avoid generating docs for uneeded properties getters/setters](https://github.com/gtk-rs/gir/pull/1289)
 * [parser: ignore private records](https://github.com/gtk-rs/gir/pull/1293)
 * [support fundamental types](https://github.com/gtk-rs/gir/pull/1294)
 * [analysis: don't take a slice of copy types by ref](https://github.com/gtk-rs/gir/pull/1296)
 * [analysis: fix logic code in slice of copy types](https://github.com/gtk-rs/gir/pull/1300)
 * [Allow tweaking visibility](https://github.com/gtk-rs/gir/pull/1292)
 * [codegen/special\_functions: Add missing space between `pub` and `fn`](https://github.com/gtk-rs/gir/pull/1303)
 * [Generate `#[must_use]` where needed](https://github.com/gtk-rs/gir/pull/1301)
 * [codegen: go through the safe bindings for child properties](https://github.com/gtk-rs/gir/pull/1304)

Thanks to all of our contributors for their (awesome!) work on this release:

 * [@A6GibKm](https://github.com/A6GibKm)
 * [@AaronErhardt](https://github.com/AaronErhardt)
 * [@alatiera](https://github.com/alatiera)
 * [@alcarney](https://github.com/alcarney)
 * [@arcnmx](https://github.com/arcnmx)
 * [@ArekPiekarz](https://github.com/ArekPiekarz)
 * [@atheriel](https://github.com/atheriel)
 * [@bbb651](https://github.com/bbb651)
 * [@bilelmoussaoui](https://github.com/bilelmoussaoui)
 * [@bvinc](https://github.com/bvinc)
 * [@cgwalters](https://github.com/cgwalters)
 * [@decathorpe](https://github.com/decathorpe)
 * [@elmarco](https://github.com/elmarco)
 * [@euclio](https://github.com/euclio)
 * [@federicomenaquintero](https://github.com/federicomenaquintero)
 * [@fengalin](https://github.com/fengalin)
 * [@GuillaumeGomez](https://github.com/GuillaumeGomez)
 * [@Gymxo](https://github.com/Gymxo)
 * [@hbina](https://github.com/hbina)
 * [@Hofer-Julian](https://github.com/Hofer-Julian)
 * [@ids1024](https://github.com/ids1024)
 * [@jackpot51](https://github.com/jackpot51)
 * [@jf2048][@jf2048]
 * [@keltrycroft](https://github.com/keltrycroft)
 * [@lehmanju](https://github.com/lehmanju)
 * [@lucab](https://github.com/lucab)
 * [@MarijnS95](https://github.com/MarijnS95)
 * [@MGlolenstine](https://github.com/MGlolenstine)
 * [@nagisa](https://github.com/nagisa)
 * [@pbor](https://github.com/pbor)
 * [@philn](https://github.com/philn)
 * [@piegamesde](https://github.com/piegamesde)
 * [@ranfdev](https://github.com/ranfdev)
 * [@RealKC](https://github.com/RealKC)
 * [@remilauzier](https://github.com/remilauzier)
 * [@sdroege](https://github.com/sdroege)
 * [@SeaDve](https://github.com/SeaDve)
 * [@sophie-h](https://github.com/sophie-h)
 * [@tronta](https://github.com/tronta)
 * [@Ungedummt](https://github.com/Ungedummt)
 * [@vhdirk](https://github.com/vhdirk)
 * [@xanathar](https://github.com/xanathar)

[@jf2048]: https://github.com/jf2048
[gtk-rs]: https://github.com/gtk-rs
[gtk4]: https://github.com/gtk-rs/gtk4-rs

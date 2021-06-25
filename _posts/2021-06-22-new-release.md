---
layout: post
author: Guillaume Gomez
title: Here comes the 4
categories: [front, crates]
date: 2021-06-22 21:00:00 +0000
---

It's been a long time since the last release, and, as you can guess, a lot of things happened in
this span of time. Let's start with the most important one:

**gtk-rs now provides bindings for GTK4 libraries!**

They are all available in the [gtk4-rs](https://github.com/gtk-rs/gtk4-rs) repository.

We also wrote an introductory book to teach users how to use **gtk4-rs**. You can read it
[here](https://gtk-rs.org/gtk4-rs/stable/latest/book/). A more detailed blog post about GTK4 will
follow in the next days.

## New website and new logo

We used this occasion to completely re-design the website and also make a logo. Since you're already
here, don't hesitate to go take a look around!

## GNOME Circle

**gtk-rs** is now part of the [GNOME Circle](https://circle.gnome.org/)! It allows our contributors
to join the GNOME foundation if they want to in addition to some other benefits. Check the website
for more details.

## Repositories changes

This release also saw changes to the gtk-rs repositories structure. We now have three main
repositories:

 * [gtk-rs-core][gtk-rs-core]: It contains crates which are considered "core" because they are used
   by both GTK3 and GTK4, but also by other projects such as [gstreamer-rs][gstreamer-rs]:
   * cairo
   * gdk-pixbuf
   * gio
   * glib
   * glib-macros
   * graphene
   * pango
   * pangocairo
 * [gtk3-rs][gtk3-rs]: Contains crates which are part of the GTK3 ecosystem:
   * atk
   * gdk
   * gdkx11
   * gtk3-macros
 * [gtk4-rs][gtk4-rs]: Contains crates which are part of the GTK4 ecosystem:
   * gdk4
   * gdk4-wayland
   * gdk4-x11
   * gsk4
   * gtk4
   * gtk4-macros

Another important point about this: all crates in one repository share the same version number now.
Before it was a bit of a mess so we decided to simplify it. So here are the version numbers for each
repository:

 * [gtk-rs-core][gtk-rs-core]: 0.14
 * [gtk3-rs][gtk3-rs]: 0.14
 * [gtk4-rs][gtk4-rs]: 0.1

## Documentation improvements

**gtk-rs** crates use the C documentation, however we improved its rendering a bit to make it even
more useful for Rust developers:

 * The items' links are now correctly generated.
 * If code examples are not written in Rust, we now add warnings to avoid confusion.
 * We added doc aliases, so you can now search signal names and even C function names directly.
 * Global functions, builder patterns, constants and statics are now documented as well.
 * Arguments which are C specific and therefore not used in the Rust bindings are not rendered anymore.

## Dependencies are re-exported

Instead of a long explanation, let's take an example. You have a GTK application and you also use
Cairo and GDK. Before this release, you would add all the 3 dependencies to your `Cargo.toml` file
to be able to use them. Now, you only need to import GTK and then you can do:

```rust
use gtk::{cairo, gdk};
```

And that's it! It'll make your management of dependencies much simpler. To be noted, they are also
in the `prelude`, so importing it will give you access to them:

```rust
use gtk::prelude::*;

// ...
let x = cairo::something();
let y = gdk::something();
```

Last note about the re-exports: the `-sys` crates are also re-exported under the name `ffi`:

```rust
use gtk::ffi;

// You now have access to all raw C-functions of GTK.
```

## The `Value` trait was refactored

The main change is that for non-nullable types `Value::get()` will never ever return `None`,
replacing the previous confusing `Value::get_some()`.

In addition it is now possible to `Value::get()` a nullable type directly without `Option`
wrapping. If the value was actually `None` this would return an `Err`. In cases where the value
being `None` was unexpected this avoids one layer of unwrapping.

There is also a new generic `ValueType` trait that is implemented by all types that can be used
inside a `Value` and that allows storing/retrieving types of this value into/from a `Value`.

## Added GTK composite template support

For constructing widgets from a UI file, you can either use `gtk::Builder` or composite templates.
With the former, you have to keep an instance of `gtk::Builder` around. While with composite
templates, you make your custom widget (a subclass of `gtk::Widget`) use the template internally and
with the difference of being able to use your `CustomWidget` in a different UI file by defining:

```xml
<object class="CustomWidget">
  <property name="some-property">some-value</property>
</object>
```

You can now make your `CustomWidget` use the `#[CompositeTemplate]` derive macro. The work was done
initially for GTK4 Rust bindings, but was backported to GTK3 as well. See
[here](https://gtk-rs.org/gtk4-rs/stable/0.1/docs/gtk4_macros/derive.CompositeTemplate.html) or
[here](https://github.com/gtk-rs/gtk4-rs/tree/0.1/examples/composite_template) for examples.

Composite templates also allow you to use methods defined on your `CustomWidget` as a callback to a
signal directly from the UI file, even though the macro doesn't support that for now for both
GTK3/GTK4 bindings... But don't worry, [we're working on it](https://github.com/gtk-rs/gtk3-rs/issues/128)!

## New and improved macros

In addition to the `glib::object_subclass` attribute macro (see link to paragraph about subclassing
improvements), `glib` provides a couple of other macros now for making application development
easier and with less boilerplate:

 * [`glib::clone!`](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/glib/macro.clone.html): This macro allows automatic cloning or creation of weak references plus upgrading for closures and greatly simplifies creation of signal handler closures. The documentation contains a couple of examples. While this macro existed in the last release already, it was completely rewritten and made more powerful and got a companion `derive` macro [`glib::Downgrade`](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/glib_macros/derive.Downgrade.html) that extends custom types with the required machinery to be used for weak references in the context of the [`clone!`](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/glib/macro.clone.html) macro.
 * [`glib::GBoxed`](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/glib_macros/derive.GBoxed.html) and [`glib::GSharedBoxed`](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/glib_macros/derive.GSharedBoxed.html): These derive macros allow using custom Rust types inside [`glib::Value`](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/glib/value/struct.Value.html)s, which is required for example for GObject properties and signal parameters/return values or the content of GTK tree views. The first macro always clones the underlying value when necessary while the second makes use of reference counting instead of normal cloning.
 * [`glib::gflags!`](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/glib_macros/attr.gflags.html) and [`glib::GEnum`](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/glib_macros/derive.GEnum.html): These macros allow using Rust enums and [bitflags](https://docs.rs/bitflags) to be used inside [`glib::Value`](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/glib/value/struct.Value.html)s. See the [subclassing docs](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/glib/subclass/index.html#example-for-registering-a-glibobject-subclass) for examples.
 * [`glib::GErrorDomain`](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/glib_macros/derive.GErrorDomain.html): This derive macro allows using a suitable Rust enum to be used as an error domain for [`glib::Error`](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/glib/error/struct.Error.html)s.

See also the [subclassing docs](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/glib/subclass/index.html#example-for-registering-a-glibobject-subclass) for more examples about the [`glib::GBoxed`](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/glib_macros/derive.GBoxed.html), [`glib::gflags`](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/glib_macros/attr.gflags.html) and [`glib::GEnum`](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/glib_macros/derive.GEnum.html) macros.

## Improvements to subclassing

Implementing a GObject is simpler, thanks to the introduction of the [glib::object_subclass](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/glib_macros/attr.object_subclass.html) `derive` macro. Additionally registering properties and signals now requires less boiler plate. Refer to [this page](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/glib/subclass/index.html#example-for-registering-a-glibobject-subclass) for a complete example but a minimal example would look as follows now:

```rust
mod imp {
    #[derive(Default)]
    pub struct MyObject;

    #[glib::object_subclass]
    impl ObjectSubclass for MyObject {
        const NAME: &'static str = "MyObject";

        type Type = super::MyObject;
        type ParentType = glib::Object;
    }

    impl ObjectImpl for MyObject {}
}

glib::wrapper! {
    pub struct MyObject(ObjectSubclass<imp::MyObject>);
}

impl MyObject {
    pub fn new() -> Self {
        glib::Object::new(&[]).unwrap()
    }
}
```

## Better cairo error handling

Using cairo is now more ergonomic: functions like [`fill()`](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/cairo/struct.Context.html#method.fill) or [`stroke()`](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/cairo/struct.Context.html#method.stroke) return a `Result` instead of requiring to manually check the [`Context::status()`](https://gtk-rs.org/gtk-rs-core/stable/0.14/docs/cairo/struct.Context.html#method.status). Additionally, all internal calls to `expect()` on the cairo status were removed, enabling the caller to handle error conditions, rather than causing a `panic`.

## Gir tutorial

**gtk-rs** crates are mostly generated automatically thanks to the [gir][gir] project. If you also
want to generate your own GObject-based crate bindings, you can use it as well! To help you, we
started a tutorial book that is available [here](https://gtk-rs.org/gir/book/).

## Naming improvements

We renamed a lot of functions/methods in order to make them more Rust-compliant. Specifically,
getter functions were renamed from `get_something()` to just `something()` or `is_something()`
while the setters stayed as `set_something()`. In addition GObject property getters/setters lost
their property designation from the name (i.e. `set_property_something()` was replaced by
`set_something()`).

On this note:

### Note to applications developers

Applications developers should use [`fix-getters-calls`](https://crates.io/crates/fix-getters-calls)
to ease migration of their applications. Use [`fix-getters-def`](https://crates.io/crates/fix-getters-def)
if you also want your get functions definition to comply with the API standards applied in this
release.

## Minimum supported versions

**Rust** minimum supported version is now **1.51**.

 * ATK: 2.18
 * Cairo: 1.14
 * GDK3: 3.18
 * GDK4: 4.0
 * GDK4-Wayland: 4.0
 * GDKX11: 3.18
 * GDK4-X11: 4.0
 * GDK-Pixbuf: 2.32
 * Gio: 2.48
 * GLib: 2.48
 * Graphene: 1.10
 * GSK4: 4.0
 * GTK3: 3.20
 * GTK4: 4.0
 * Pango: 1.38
 * PangoCairo: 1.38

## Migration to the Rust 2018 edition

The gtk-rs crates all migrated to the Rust 2018 edition. Just in time because the 2021 edition is
getting close!

# Changes

For the interested ones, here is the list of the merged pull requests:

[gtk-rs-core][gtk-rs-core]:

 * [translate/TryFromGlib: add shortcut function](https://github.com/gtk-rs/gtk-rs-core/pull/3)
 * [Fix typo in function name](https://github.com/gtk-rs/gtk-rs-core/pull/56)
 * [gio: Only assign to `GError\*\*`s if they're not `NULL`](https://github.com/gtk-rs/gtk-rs-core/pull/58)
 * [glib: Mark various Variant getter functions correctly as (transfer fu…](https://github.com/gtk-rs/gtk-rs-core/pull/59)
 * [glib: Fix leaks in FromGlibContainer impls for GString](https://github.com/gtk-rs/gtk-rs-core/pull/60)
 * [glib: Implement main context acquire guard type](https://github.com/gtk-rs/gtk-rs-core/pull/72)
 * [glib: bind freeze\_notify and freeze\_thaw](https://github.com/gtk-rs/gtk-rs-core/pull/78)
 * [Add missing doc aliases](https://github.com/gtk-rs/gtk-rs-core/pull/83)
 * [Add doc alias check](https://github.com/gtk-rs/gtk-rs-core/pull/86)
 * [Add missing doc aliases on variants](https://github.com/gtk-rs/gtk-rs-core/pull/91)
 * [Manually bind g\_win32\_get\_package\_installation\_directory\_of\_module](https://github.com/gtk-rs/gtk-rs-core/pull/90)
 * [Add more doc aliases on variants](https://github.com/gtk-rs/gtk-rs-core/pull/92)
 * [glib: Allow creating Variants from slices instead of just Vecs](https://github.com/gtk-rs/gtk-rs-core/pull/96)
 * [Add missing binding for pango::Attribute::new\_shape](https://github.com/gtk-rs/gtk-rs-core/pull/99)
 * [Expose the type of pango::Attribute](https://github.com/gtk-rs/gtk-rs-core/pull/104)
 * [glib: add a doc alias for GType](https://github.com/gtk-rs/gtk-rs-core/pull/105)
 * [Generate missing doc aliases for newtypes](https://github.com/gtk-rs/gtk-rs-core/pull/108)
 * [Generate new bitfields values and more doc aliases](https://github.com/gtk-rs/gtk-rs-core/pull/109)
 * [Create Boxed(Value) newtype for Boxed GValue](https://github.com/gtk-rs/gtk-rs-core/pull/85)
 * [Generate missing doc aliases](https://github.com/gtk-rs/gtk-rs-core/pull/113)
 * [gio: allow subtypes as item for Listmodels and improved error message](https://github.com/gtk-rs/gtk-rs-core/pull/117)
 * [Fix graphene-sys tests](https://github.com/gtk-rs/gtk-rs-core/pull/73)
 * [glib-macros: add proc\_macro\_error attribute to clone](https://github.com/gtk-rs/gtk-rs-core/pull/125)
 * [Fix glib re-export detection for macros](https://github.com/gtk-rs/gtk-rs-core/pull/116)
 * [glib-macros: remove KNOWN\_GLIB\_EXPORTS](https://github.com/gtk-rs/gtk-rs-core/pull/132)
 * [Let cancellable be passed into GioFuture instead of creating it by the closure](https://github.com/gtk-rs/gtk-rs-core/pull/136)
 * [glib: Duplicate some ObjectClass methods to Interface](https://github.com/gtk-rs/gtk-rs-core/pull/135)
 * [Add missing information for glib clone macro](https://github.com/gtk-rs/gtk-rs-core/pull/137)
 * [Remove duplicated doc aliases](https://github.com/gtk-rs/gtk-rs-core/pull/143)
 * [glib: explain why Clone isn't implemented on SourceId](https://github.com/gtk-rs/gtk-rs-core/pull/148)
 * [misc: update docs links & repos links](https://github.com/gtk-rs/gtk-rs-core/pull/151)
 * [Add gio::TlsBackend](https://github.com/gtk-rs/gtk3-rs/pull/9)
 * [glib/functions: fix get\_charset logic](https://github.com/gtk-rs/gtk3-rs/pull/8)
 * [glib-macros: Use absolute paths to the StaticType trait](https://github.com/gtk-rs/gtk3-rs/pull/12)
 * [glib: Add ObjectExt::connect\_notify\_local()](https://github.com/gtk-rs/gtk3-rs/pull/34)
 * [glib/translate: take advantage of Rust Option & Result types](https://github.com/gtk-rs/gtk3-rs/pull/11)
 * [cairo: Update to system-deps 2.0 like everything else](https://github.com/gtk-rs/gtk3-rs/pull/25)
 * [glib: Implement Clone for glib::GString](https://github.com/gtk-rs/gtk3-rs/pull/158)
 * [glib: Require all the Value traits to be implemented for ObjectType](https://github.com/gtk-rs/gtk3-rs/pull/156)
 * [Clone to proc macro](https://github.com/gtk-rs/gtk3-rs/pull/65)
 * [glib::Binding improvements](https://github.com/gtk-rs/gtk3-rs/pull/179)
 * [Fix clone macro by allowing returned value with type parameters](https://github.com/gtk-rs/gtk3-rs/pull/184)
 * [gio/sys: resolve winapi reference](https://github.com/gtk-rs/gtk3-rs/pull/194)
 * [gio: Add `Settings::bind\_with\_mapping()` binding](https://github.com/gtk-rs/gtk3-rs/pull/210)
 * [glib: Hook up dispose() in ObjectImpl](https://github.com/gtk-rs/gtk3-rs/pull/214)
 * [glib: Add an `Object::new\_subclass()` function](https://github.com/gtk-rs/gtk3-rs/pull/219)
 * [Rename glib\_wrapper! and glib\_object\_subclass! to wrapper! and object\_subclass!](https://github.com/gtk-rs/gtk3-rs/pull/220)
 * [glib: implement FromGlibContainer for GString](https://github.com/gtk-rs/gtk3-rs/pull/181)
 * [From glib unsafe](https://github.com/gtk-rs/gtk3-rs/pull/199)
 * [pango: export Glyph\* manual types](https://github.com/gtk-rs/gtk3-rs/pull/204)
 * [pango: implement FromGlibContainerAsVec for GlyphInfo](https://github.com/gtk-rs/gtk3-rs/pull/208)
 * [glib: Add documentation for SignalHandlerId](https://github.com/gtk-rs/gtk3-rs/pull/202)
 * [Fix weird indent in glib/Gir.toml](https://github.com/gtk-rs/gtk3-rs/pull/233)
 * [Add checks in Date methods](https://github.com/gtk-rs/gtk3-rs/pull/232)
 * [Add bindings for GTask](https://github.com/gtk-rs/gtk3-rs/pull/245)
 * [Make DateTime Option returns into Result](https://github.com/gtk-rs/gtk3-rs/pull/234)
 * [Make gio::File::get\_uri\_scheme() nullable](https://github.com/gtk-rs/gtk3-rs/pull/248)
 * [In glib\_object\_wrapper!, use generic Class type instead defining a struct](https://github.com/gtk-rs/gtk3-rs/pull/10)
 * [gio: use default methods when possible for ActionGroup](https://github.com/gtk-rs/gtk3-rs/pull/263)
 * [gio: Add `glib-compile-resources` wrapper, and macro to include](https://github.com/gtk-rs/gtk3-rs/pull/261)
 * [Implement StaticType on ()](https://github.com/gtk-rs/gtk3-rs/pull/272)
 * [glib-macros: Make `GBoxed` not require importing `BoxedType`](https://github.com/gtk-rs/gtk3-rs/pull/275)
 * [gio: Remove unneeded trailing semicolon](https://github.com/gtk-rs/gtk3-rs/pull/278)
 * [Cairo: make status() public](https://github.com/gtk-rs/gtk3-rs/pull/279)
 * [gio: Add DBusActionGroup](https://github.com/gtk-rs/gtk3-rs/pull/288)
 * [Keep glib::clone spans for proc macros](https://github.com/gtk-rs/gtk3-rs/pull/290)
 * [glib: rename TypeData::interface\_data to class\_data](https://github.com/gtk-rs/gtk3-rs/pull/292)
 * [glib: ignore new clippy warnings for now](https://github.com/gtk-rs/gtk3-rs/pull/299)
 * [cairo: Update system-deps dependency to 3.0](https://github.com/gtk-rs/gtk3-rs/pull/301)
 * [glib: Correctly mark future returned by ThreadPool::push\_future() as …](https://github.com/gtk-rs/gtk3-rs/pull/304)
 * [gio: Mark ETag out parameter in various GFile functions as nullable](https://github.com/gtk-rs/gtk3-rs/pull/307)
 * [gio: File::get\_child() is not nullable](https://github.com/gtk-rs/gtk3-rs/pull/310)
 * [SignalId: add missing methods](https://github.com/gtk-rs/gtk3-rs/pull/302)
 * [glib: rename remaining \_generic to \_values](https://github.com/gtk-rs/gtk3-rs/pull/315)
 * [glib: Derive Ord on Type](https://github.com/gtk-rs/gtk3-rs/pull/317)
 * [glib: Improve the API of Type](https://github.com/gtk-rs/gtk3-rs/pull/318)
 * [glib-macros: Forward the visibility of the type into the code generat…](https://github.com/gtk-rs/gtk3-rs/pull/321)
 * [ connect\_unsafe: Refactor, then don't ignore the return\_type for null objects ](https://github.com/gtk-rs/gtk3-rs/pull/319)
 * [glib: `#\[object\_subclass\]` proc macro.](https://github.com/gtk-rs/gtk3-rs/pull/335)
 * [glib: Move `type\_data()` and `get\_type()` to new `unsafe trait`](https://github.com/gtk-rs/gtk3-rs/pull/338)
 * [cairo: add doc aliases round 1](https://github.com/gtk-rs/gtk3-rs/pull/343)
 * [object: Return a pointer from get\_qdata, not a reference](https://github.com/gtk-rs/gtk3-rs/pull/344)
 * [Store class\_data/instance\_data hashmaps directly instead of boxing an…](https://github.com/gtk-rs/gtk3-rs/pull/345)
 * [glib: Add \_once variants to many methods](https://github.com/gtk-rs/gtk3-rs/pull/349)
 * [glib: add ObjectExt::connect\_id & other variants](https://github.com/gtk-rs/gtk3-rs/pull/350)
 * [glib: Distinguish between classes and interfaces at the type level](https://github.com/gtk-rs/gtk3-rs/pull/352)
 * [Add support for async blocks in clone macro](https://github.com/gtk-rs/gtk3-rs/pull/362)
 * [Update to GLib 2.68.0](https://github.com/gtk-rs/gtk3-rs/pull/364)
 * [glib: Fix compilation of listbox\_model example](https://github.com/gtk-rs/gtk3-rs/pull/355)
 * [glib: Don't offset property ids before calling ObjectImpl::set\_proper…](https://github.com/gtk-rs/gtk3-rs/pull/368)
 * [Add a GError derive macro](https://github.com/gtk-rs/gtk3-rs/pull/367)
 * [glib-macros: Fix typo: doman -&gt; domain](https://github.com/gtk-rs/gtk3-rs/pull/370)
 * [Fix some clone @default-return handlings](https://github.com/gtk-rs/gtk3-rs/pull/373)
 * [Fix panic when there is no @default-panic and add more checks for clone macro](https://github.com/gtk-rs/gtk3-rs/pull/377)
 * [glib: Actually call the function in \_once wrappers](https://github.com/gtk-rs/gtk3-rs/pull/383)
 * [pango: Fix x\_to\_index docs](https://github.com/gtk-rs/gtk3-rs/pull/388)
 * [Remove optional $rust\_class\_name argument from glib\_wrapper!](https://github.com/gtk-rs/gtk3-rs/pull/24)
 * [cairo: don't include freetype by default](https://github.com/gtk-rs/gtk3-rs/pull/411)
 * [glib: Implement StaticType, FromValue(Optional)? and SetValue(Optional)? for Value](https://github.com/gtk-rs/gtk3-rs/pull/414)
 * [glib: add Error::into\_raw()](https://github.com/gtk-rs/gtk3-rs/pull/428)
 * [glib: bind WeakRef::set()](https://github.com/gtk-rs/gtk3-rs/pull/433)
 * [Improve/fix NULL handling in GString](https://github.com/gtk-rs/gtk3-rs/pull/439)
 * [glib: add some unit tests for translate](https://github.com/gtk-rs/gtk3-rs/pull/441)
 * [glib: Remove glib::TypedValue](https://github.com/gtk-rs/gtk3-rs/pull/449)
 * [glib: add Array wrapper](https://github.com/gtk-rs/gtk3-rs/pull/444)
 * [glib: glib-macros: add SharedType and Shared derive macro](https://github.com/gtk-rs/gtk3-rs/pull/452)
 * [glib: mark ParamSpecType trait as unsafe](https://github.com/gtk-rs/gtk3-rs/pull/457)
 * [glib: Remove un-generatable type UriParamsIter](https://github.com/gtk-rs/gtk3-rs/pull/459)
 * [Update to proc-macro-crate 1.0](https://github.com/gtk-rs/gtk3-rs/pull/466)
 * [glib-macros: Try harder to find glib](https://github.com/gtk-rs/gtk3-rs/pull/471)
 * [glib: Only allow canonical names in property and signal builders](https://github.com/gtk-rs/gtk3-rs/pull/416)
 * [Fix clone macro docs](https://github.com/gtk-rs/gtk3-rs/pull/396)
 * [\[docs\] Some changes to glib intro](https://github.com/gtk-rs/gtk3-rs/pull/435)
 * [glib-macros: Don't assume `glib::StaticType` is in scope in the gener…](https://github.com/gtk-rs/gtk3-rs/pull/482)
 * [glib: bind g\_signal\_has\_handler\_pending](https://github.com/gtk-rs/gtk3-rs/pull/475)
 * [glib/value: impl StaticType for Option&lt;T&gt; when applicable](https://github.com/gtk-rs/gtk3-rs/pull/484)
 * [glib: manually bind g\_unix\_open\_pipe](https://github.com/gtk-rs/gtk3-rs/pull/488)
 * [ToGlib should take Self](https://github.com/gtk-rs/gtk3-rs/pull/427)
 * [Impl IntoGlib for Result...](https://github.com/gtk-rs/gtk3-rs/pull/493)
 * [glib: `From` and `TryFrom` implementations for working with `Char`](https://github.com/gtk-rs/gtk3-rs/pull/494)
 * [Fix gio file constructors names](https://github.com/gtk-rs/gtk3-rs/pull/505)
 * [glib-macros: do not export ::type\_() for boxed types](https://github.com/gtk-rs/gtk3-rs/pull/513)
 * [glib: Make use of g\_source\_set\_dispose\_function() in 2.64+ to fix a r…](https://github.com/gtk-rs/gtk3-rs/pull/514)
 * [glib: fix some nullables](https://github.com/gtk-rs/gtk3-rs/pull/508)
 * [glib: add VariantTy::any()](https://github.com/gtk-rs/gtk3-rs/pull/516)
 * [gio: Fix callbacks of bus\_watch\_name](https://github.com/gtk-rs/gtk3-rs/pull/492)
 * [gio: rename spawnv to plain spawn](https://github.com/gtk-rs/gtk3-rs/pull/481)
 * [gio: Rename TlsConnectionManualExt to ExtManual and export from prelude](https://github.com/gtk-rs/gtk3-rs/pull/483)
 * [Add missing gio reexports](https://github.com/gtk-rs/gtk3-rs/pull/521)
 * [Make cairo error handling slightly better](https://github.com/gtk-rs/gtk3-rs/pull/498)

[gtk3-rs][gtk3-rs]:

 * [Use `Object<T>::as\_mut()` without unsafe, and a couple other small things](https://github.com/gtk-rs/gtk3-rs/pull/16)
 * [Fix entry\_completion quit shortcut](https://github.com/gtk-rs/gtk3-rs/pull/33)
 * [Move to edition "2018"](https://github.com/gtk-rs/gtk3-rs/pull/32)
 * [inet\_socket\_address: Add std::net::SocketAddr conversions](https://github.com/gtk-rs/gtk3-rs/pull/135)
 * [Allow log\_domain to be null](https://github.com/gtk-rs/gtk3-rs/pull/35)
 * [Replace all Into impls with the corresponding From impls](https://github.com/gtk-rs/gtk3-rs/pull/136)
 * [Reexport sys dependencies](https://github.com/gtk-rs/gtk3-rs/pull/153)
 * [migrate to 2018 edition](https://github.com/gtk-rs/gtk3-rs/pull/165)
 * [Improve naming](https://github.com/gtk-rs/gtk3-rs/pull/174)
 * [gtk: backport fix compute\_expand vfunc](https://github.com/gtk-rs/gtk3-rs/pull/186)
 * [Subclassing for GtkButton](https://github.com/gtk-rs/gtk3-rs/pull/188)
 * [Add composite templates](https://github.com/gtk-rs/gtk3-rs/pull/189)
 * [Add ListModel subclassing support](https://github.com/gtk-rs/gtk3-rs/pull/191)
 * [Replace manual enum functions with autogenerated ones](https://github.com/gtk-rs/gtk3-rs/pull/155)
 * [Regenerate everything with latest gir](https://github.com/gtk-rs/gtk3-rs/pull/198)
 * [Macro parser improvements](https://github.com/gtk-rs/gtk3-rs/pull/206)
 * [Add new pango attributes](https://github.com/gtk-rs/gtk3-rs/pull/212)
 * [Implement derive macro for Downgrade/Upgrade traits](https://github.com/gtk-rs/gtk3-rs/pull/200)
 * [subclass: Hook up instance\_init()](https://github.com/gtk-rs/gtk3-rs/pull/216)
 * [2015 cleanup](https://github.com/gtk-rs/gtk3-rs/pull/221)
 * [Add more aliases](https://github.com/gtk-rs/gtk3-rs/pull/222)
 * [More checks and add missing license headers](https://github.com/gtk-rs/gtk3-rs/pull/217)
 * [docs: update per the new macro names](https://github.com/gtk-rs/gtk3-rs/pull/223)
 * [export deps from gtk](https://github.com/gtk-rs/gtk3-rs/pull/201)
 * [Consistently re-export subclassing preludes of dependency crates](https://github.com/gtk-rs/gtk3-rs/pull/228)
 * [Minor type / value improvements](https://github.com/gtk-rs/gtk3-rs/pull/231)
 * [Reduce external dependencies for futures-related things](https://github.com/gtk-rs/gtk3-rs/pull/252)
 * [Remove useless badges info](https://github.com/gtk-rs/gtk3-rs/pull/253)
 * [Regenerate with latest gir/gir-files, remove use\_boxed\_functions](https://github.com/gtk-rs/gtk3-rs/pull/254)
 * [add manual doc aliases](https://github.com/gtk-rs/gtk3-rs/pull/227)
 * [gio: add Windows stream types](https://github.com/gtk-rs/gtk3-rs/pull/255)
 * [A couple minor improvements](https://github.com/gtk-rs/gtk3-rs/pull/249)
 * [gtk: Implement Deref for TemplateChild](https://github.com/gtk-rs/gtk3-rs/pull/260)
 * [add ActionMap/ActionGroup subclassing support](https://github.com/gtk-rs/gtk3-rs/pull/257)
 * [examples: Use autobins](https://github.com/gtk-rs/gtk3-rs/pull/267)
 * [Add Dialog::run\_future()](https://github.com/gtk-rs/gtk3-rs/pull/268)
 * [Subclassing refactoring](https://github.com/gtk-rs/gtk3-rs/pull/270)
 * [Remove dependency on itertools](https://github.com/gtk-rs/gtk3-rs/pull/281)
 * [Mark 'key' parameter nullable for KeyFile's get\_comment()](https://github.com/gtk-rs/gtk3-rs/pull/286)
 * [Update to system-deps 3](https://github.com/gtk-rs/gtk3-rs/pull/296)
 * [gtk: specify template as an attribute of CompositeTemplate](https://github.com/gtk-rs/gtk3-rs/pull/269)
 * [gdk: Use cairo::Format instead of i32 for the format in Window::creat…](https://github.com/gtk-rs/gtk3-rs/pull/311)
 * [gtk: Take (column, value) tuples instead of separate slices for the t…](https://github.com/gtk-rs/gtk3-rs/pull/312)
 * [Added screenshots to example readme](https://github.com/gtk-rs/gtk3-rs/pull/314)
 * [Make virtual methods take wrapper of type, not parent](https://github.com/gtk-rs/gtk3-rs/pull/27)
 * [gtk: use "assertion" = "skip" instead of manual implementation](https://github.com/gtk-rs/gtk3-rs/pull/327)
 * [API changes due to signal-detail PR to gir](https://github.com/gtk-rs/gtk3-rs/pull/324)
 * [Implement ListBoxRowImplExt for activate method](https://github.com/gtk-rs/gtk3-rs/pull/331)
 * [gtk: Add `enter\_notify\_event` and `leave\_notify\_event` to `WidgetImpl`](https://github.com/gtk-rs/gtk3-rs/pull/334)
 * [Subclass cleanup](https://github.com/gtk-rs/gtk3-rs/pull/337)
 * [Add a way for the subclassing infrastructure to add per-instance management data](https://github.com/gtk-rs/gtk3-rs/pull/342)
 * [Add support for chaining up to parent interface implementations](https://github.com/gtk-rs/gtk3-rs/pull/353)
 * [Make `drag-motion` and `drag-drop` signals return `bool` instead of `Inhibit`](https://github.com/gtk-rs/gtk3-rs/pull/361)
 * [Use girs\_directories option from `Gir.toml` files instead of using "-d" by default on gir](https://github.com/gtk-rs/gtk3-rs/pull/366)
 * [Fix async clone closures handling](https://github.com/gtk-rs/gtk3-rs/pull/371)
 * [Don't need serial\_test\_derive](https://github.com/gtk-rs/gtk3-rs/pull/273)
 * [Fix use of gflags attribute in the subclass example](https://github.com/gtk-rs/gtk3-rs/pull/379)
 * [Add layout.rs, and manual LayoutLine::x\_to\_index impl](https://github.com/gtk-rs/gtk3-rs/pull/375)
 * [Expose layout line fields](https://github.com/gtk-rs/gtk3-rs/pull/376)
 * [Replace \_new constructor for Unix/Win32 Input and Output streams](https://github.com/gtk-rs/gtk3-rs/pull/384)
 * [generator: Iterate gir directories passed on the command line](https://github.com/gtk-rs/gtk3-rs/pull/385)
 * [Fix clippy lints](https://github.com/gtk-rs/gtk3-rs/pull/389)
 * [add access to analysis.extra\_attrs](https://github.com/gtk-rs/gtk3-rs/pull/394)
 * [Fix #392 export gdk::event::FromEvent](https://github.com/gtk-rs/gtk3-rs/pull/395)
 * [Move examples to separate folders](https://github.com/gtk-rs/gtk3-rs/pull/386)
 * [Examples fixes](https://github.com/gtk-rs/gtk3-rs/pull/397)
 * [Further refactor examples](https://github.com/gtk-rs/gtk3-rs/pull/403)
 * [Refactor example to modules](https://github.com/gtk-rs/gtk3-rs/pull/406)
 * [Refactor CSS and dialog example](https://github.com/gtk-rs/gtk3-rs/pull/408)
 * [Add ValueArray::len()/is\_empty()](https://github.com/gtk-rs/gtk3-rs/pull/412)
 * [Improve Debug output for GString, SendValue](https://github.com/gtk-rs/gtk3-rs/pull/420)
 * [gio: do not take args in application.run()](https://github.com/gtk-rs/gtk3-rs/pull/421)
 * [gio: Mark `DBusProxy` as `send+sync` and regenerate](https://github.com/gtk-rs/gtk3-rs/pull/422)
 * [gio: implement enumerate\_children\_async](https://github.com/gtk-rs/gtk3-rs/pull/425)
 * [Add Ecosystem section to the README](https://github.com/gtk-rs/gtk3-rs/pull/424)
 * [Add minimum Rust supported version](https://github.com/gtk-rs/gtk3-rs/pull/429)
 * [Continue refactoring the examples](https://github.com/gtk-rs/gtk3-rs/pull/415)
 * [gtk: make all with\_label and with\_mnemonic constructors consistent](https://github.com/gtk-rs/gtk3-rs/pull/448)
 * [\[gtk\] Do not return Result from Application::new()](https://github.com/gtk-rs/gtk3-rs/pull/447)
 * [\[gtk\] Small Gir.toml cleanup](https://github.com/gtk-rs/gtk3-rs/pull/451)
 * [Remove get  for getters & properties where applicable](https://github.com/gtk-rs/gtk3-rs/pull/211)
 * [Return Options for new UnixMountEntry](https://github.com/gtk-rs/gtk3-rs/pull/461)
 * [\[docs\] Some changes to gtk intro](https://github.com/gtk-rs/gtk3-rs/pull/431)
 * [set minimal features for syn/futures crates](https://github.com/gtk-rs/gtk3-rs/pull/469)
 * [Get removal round 2](https://github.com/gtk-rs/gtk3-rs/pull/455)
 * [list\_model: Rename object to item](https://github.com/gtk-rs/gtk3-rs/pull/479)
 * [Value trait refactoring](https://github.com/gtk-rs/gtk3-rs/pull/454)
 * [Remove doc generation features](https://github.com/gtk-rs/gtk3-rs/pull/465)
 * [Don't re-export traits from crate root](https://github.com/gtk-rs/gtk3-rs/pull/487)
 * [gtk: Add `WidgetClassSubclassExt::{css\_name,set\_css\_name}`](https://github.com/gtk-rs/gtk3-rs/pull/476)
 * [gtk: rename StyleContext::property to StyleContext::style\_property](https://github.com/gtk-rs/gtk3-rs/pull/495)
 * [Regen with latest gir](https://github.com/gtk-rs/gtk3-rs/pull/501)
 * [Add rename doc aliases](https://github.com/gtk-rs/gtk3-rs/pull/490)
 * [error: remove misleading example](https://github.com/gtk-rs/gtk3-rs/pull/507)
 * [gtk: Add binding for `gtk\_container\_class\_handle\_border\_width()`](https://github.com/gtk-rs/gtk3-rs/pull/497)
 * [gtk: Add run\_future() for native dialogs](https://github.com/gtk-rs/gtk3-rs/pull/500)
 * [Fix new 1.52 clippy warnings](https://github.com/gtk-rs/gtk3-rs/pull/510)
 * [remove the deprecated functions/reduce the number of disabled clippy linters](https://github.com/gtk-rs/gtk3-rs/pull/509)
 * [Update minimum versions to versions available in Ubuntu 16.04](https://github.com/gtk-rs/gtk3-rs/pull/512)
 * [Add a variant prop to the example](https://github.com/gtk-rs/gtk3-rs/pull/518)
 * [Split core](https://github.com/gtk-rs/gtk3-rs/pull/523)
 * [Update URLs](https://github.com/gtk-rs/gtk3-rs/pull/526)
 * [Fix links to GIO examples](https://github.com/gtk-rs/gtk3-rs/pull/527)
 * [README: it's gtk3-rs](https://github.com/gtk-rs/gtk3-rs/pull/531)
 * [Update issue templates](https://github.com/gtk-rs/gtk3-rs/pull/533)
 * [Replace invalid repository name](https://github.com/gtk-rs/gtk3-rs/pull/534)
 * [gtk: adapt per glib::MainContext changes](https://github.com/gtk-rs/gtk3-rs/pull/536)
 * [Icon size property fix](https://github.com/gtk-rs/gtk3-rs/pull/538)
 * [gdk: Fixes for keymap/keysym API](https://github.com/gtk-rs/gtk3-rs/pull/529)
 * [Add missing doc aliases](https://github.com/gtk-rs/gtk3-rs/pull/539)
 * [Add doc alias check](https://github.com/gtk-rs/gtk3-rs/pull/540)
 * [gtk: drop MainContext check](https://github.com/gtk-rs/gtk3-rs/pull/542)
 * [More doc aliases](https://github.com/gtk-rs/gtk3-rs/pull/545)
 * [regen with latest gir](https://github.com/gtk-rs/gtk3-rs/pull/546)
 * [Update crates version for next release](https://github.com/gtk-rs/gtk3-rs/pull/549)
 * [Ignore tmp emacs files](https://github.com/gtk-rs/gtk3-rs/pull/550)
 * [Upgrade gtk3-macro crate version to 0.14.0](https://github.com/gtk-rs/gtk3-rs/pull/551)
 * [Remove special handling for Window::present on mac](https://github.com/gtk-rs/gtk3-rs/pull/554)
 * [regen with latest gir](https://github.com/gtk-rs/gtk3-rs/pull/555)
 * [Gir update and example adjustment](https://github.com/gtk-rs/gtk3-rs/pull/552)
 * [Generate missing doc aliases for newtypes](https://github.com/gtk-rs/gtk3-rs/pull/556)
 * [Regen (new bitfields values and more doc aliases)](https://github.com/gtk-rs/gtk3-rs/pull/557)
 * [Add more doc aliases](https://github.com/gtk-rs/gtk3-rs/pull/559)
 * [Fix README files format](https://github.com/gtk-rs/gtk3-rs/pull/560)
 * [Fix git URLs](https://github.com/gtk-rs/gtk3-rs/pull/561)
 * [Add minimal crate info](https://github.com/gtk-rs/gtk3-rs/pull/563)
 * [Rename project to "gtk-rs"](https://github.com/gtk-rs/gtk3-rs/pull/566)
 * [image: pre-install wget](https://github.com/gtk-rs/gtk3-rs/pull/573)
 * [Fix duplicate doc aliases](https://github.com/gtk-rs/gtk3-rs/pull/577)
 * [Fix outdated docs overview link](https://github.com/gtk-rs/gtk3-rs/pull/578)
 * [Fix icon-size property type issue](https://github.com/gtk-rs/gtk3-rs/pull/576)
 * [Fix clippy warnings](https://github.com/gtk-rs/gtk3-rs/pull/580)
 * [misc: update docs links & repos links](https://github.com/gtk-rs/gtk3-rs/pull/584)

[gtk4-rs][gtk4-rs]:

 * [Regenerate with gtk 3.99.3](https://github.com/gtk-rs/gtk4-rs/pull/38)
 * [gtk4: update subclasses to the latest glib](https://github.com/gtk-rs/gtk4-rs/pull/42)
 * [regenerate with gtk 3.99.4](https://github.com/gtk-rs/gtk4-rs/pull/41)
 * [Generate gdk4-x11](https://github.com/gtk-rs/gtk4-rs/pull/45)
 * [gtk4: remove unneeded atk dependency](https://github.com/gtk-rs/gtk4-rs/pull/47)
 * [gdk4-wayland: generate bindings](https://github.com/gtk-rs/gtk4-rs/pull/46)
 * [gdkx11: fix crate name](https://github.com/gtk-rs/gtk4-rs/pull/53)
 * [Gtk subclassing round 1](https://github.com/gtk-rs/gtk4-rs/pull/57)
 * [Subclassing round 2](https://github.com/gtk-rs/gtk4-rs/pull/58)
 * [Widget subclass](https://github.com/gtk-rs/gtk4-rs/pull/26)
 * [Add some trust\_return\_value\_nullability's for gtk](https://github.com/gtk-rs/gtk4-rs/pull/67)
 * [Port builder\_basics from gtk-rs/examples4](https://github.com/gtk-rs/gtk4-rs/pull/59)
 * [Update to 2018 edition](https://github.com/gtk-rs/gtk4-rs/pull/65)
 * [2018 migration fixes](https://github.com/gtk-rs/gtk4-rs/pull/72)
 * [Add initial support for GTK composite templates](https://github.com/gtk-rs/gtk4-rs/pull/51)
 * [subclass/widget: Rework the default measure() vfunc](https://github.com/gtk-rs/gtk4-rs/pull/78)
 * [gtk: fix widget's set\_focus\_child implementation](https://github.com/gtk-rs/gtk4-rs/pull/84)
 * [Subclassing round 4](https://github.com/gtk-rs/gtk4-rs/pull/62)
 * [Port examples builders, clock from gtk-rs/examples4](https://github.com/gtk-rs/gtk4-rs/pull/79)
 * [Subclassing part 3](https://github.com/gtk-rs/gtk4-rs/pull/60)
 * [gtk: add TextBuffer/TextView subclassing support](https://github.com/gtk-rs/gtk4-rs/pull/87)
 * [backport CellRenderer/CellRendererText subclasses](https://github.com/gtk-rs/gtk4-rs/pull/90)
 * [gtk: subclassing round 7](https://github.com/gtk-rs/gtk4-rs/pull/91)
 * [gtk: fix compute\_expand implementation](https://github.com/gtk-rs/gtk4-rs/pull/96)
 * [gtk4/subclass: Add composite template support to prelude](https://github.com/gtk-rs/gtk4-rs/pull/98)
 * [port css and entry\_completion from gtk-rs/examples4](https://github.com/gtk-rs/gtk4-rs/pull/93)
 * [Fix some nullable return annotations 2](https://github.com/gtk-rs/gtk4-rs/pull/81)
 * [gtk: nullability trust part 3](https://github.com/gtk-rs/gtk4-rs/pull/83)
 * [gtk: implement From cmp::Ordering](https://github.com/gtk-rs/gtk4-rs/pull/101)
 * [Macro parser improvements](https://github.com/gtk-rs/gtk4-rs/pull/103)
 * [Regen with gtk 3.99.5](https://github.com/gtk-rs/gtk4-rs/pull/108)
 * [Add 2 widget class methods](https://github.com/gtk-rs/gtk4-rs/pull/109)
 * [regen with the latest gir-files](https://github.com/gtk-rs/gtk4-rs/pull/110)
 * [Add a Widget subclass example](https://github.com/gtk-rs/gtk4-rs/pull/112)
 * [gtk: add more WidgetClass methods](https://github.com/gtk-rs/gtk4-rs/pull/113)
 * [gtk: regen from the latest gir-files](https://github.com/gtk-rs/gtk4-rs/pull/115)
 * [examples: Move unparent to dispose()](https://github.com/gtk-rs/gtk4-rs/pull/117)
 * [gtk: backport application subclass startup override](https://github.com/gtk-rs/gtk4-rs/pull/120)
 * [Hook up gtk\_widget\_init\_template() into InitializingObject](https://github.com/gtk-rs/gtk4-rs/pull/121)
 * [Use manual gdk::Rectangle from gdk3-rs bindings](https://github.com/gtk-rs/gtk4-rs/pull/125)
 * [Regenerate with gtk 4.0.0](https://github.com/gtk-rs/gtk4-rs/pull/124)
 * [Update per glib macros names changes](https://github.com/gtk-rs/gtk4-rs/pull/127)
 * [More doc alias](https://github.com/gtk-rs/gtk4-rs/pull/129)
 * [Rexport dependencies from gtk](https://github.com/gtk-rs/gtk4-rs/pull/105)
 * [port text\_viewer from gtk-rs/examples4](https://github.com/gtk-rs/gtk4-rs/pull/130)
 * [gdkx11/gdkwayland: export missed dependencies](https://github.com/gtk-rs/gtk4-rs/pull/131)
 * [simpler callbacks: avoid Option&lt;Box&lt;Q&gt;&gt;](https://github.com/gtk-rs/gtk4-rs/pull/133)
 * [Add doc aliases to manual types](https://github.com/gtk-rs/gtk4-rs/pull/135)
 * [gtk subclassing: re-export preludes of dependencies as well](https://github.com/gtk-rs/gtk4-rs/pull/138)
 * [gdk: add Paintable subclassing support](https://github.com/gtk-rs/gtk4-rs/pull/139)
 * [Manually Implement Custom Sorter & Filter](https://github.com/gtk-rs/gtk4-rs/pull/142)
 * [gtk: Add Orientable subclassing support](https://github.com/gtk-rs/gtk4-rs/pull/148)
 * [gtk: generate ApplicationBuilder manually](https://github.com/gtk-rs/gtk4-rs/pull/155)
 * [gtk: allow setting layout\_child\_type on GtkLayoutManager](https://github.com/gtk-rs/gtk4-rs/pull/156)
 * [gdk: properly export all consts](https://github.com/gtk-rs/gtk4-rs/pull/158)
 * [Add Dialog::run\_future()](https://github.com/gtk-rs/gtk4-rs/pull/149)
 * [examples: Use autobins](https://github.com/gtk-rs/gtk4-rs/pull/161)
 * [Add Dialog::run\_async](https://github.com/gtk-rs/gtk4-rs/pull/159)
 * [Implement Deref for TemplateChild](https://github.com/gtk-rs/gtk4-rs/pull/163)
 * [gtk: subclassing round 8](https://github.com/gtk-rs/gtk4-rs/pull/164)
 * [gdk: manually implement Event and it's subclasses](https://github.com/gtk-rs/gtk4-rs/pull/160)
 * [Subclassing round 9](https://github.com/gtk-rs/gtk4-rs/pull/165)
 * [gtk: subclassing round 6](https://github.com/gtk-rs/gtk4-rs/pull/89)
 * [Specify template as an attribute of CompositeTemplate](https://github.com/gtk-rs/gtk4-rs/pull/168)
 * [examples: update per subclassing changes](https://github.com/gtk-rs/gtk4-rs/pull/172)
 * [Ignore CustomLayout](https://github.com/gtk-rs/gtk4-rs/pull/145)
 * [subclass/widget: Ensure TemplateChild types are registered](https://github.com/gtk-rs/gtk4-rs/pull/166)
 * [gtk: Remove outdated Gir.toml downstream fixes](https://github.com/gtk-rs/gtk4-rs/pull/167)
 * [widget: Implement Debug for TickCallbackId](https://github.com/gtk-rs/gtk4-rs/pull/180)
 * [Some small fixes](https://github.com/gtk-rs/gtk4-rs/pull/178)
 * [gtk: add BuilderScope subclassing support](https://github.com/gtk-rs/gtk4-rs/pull/181)
 * [gtk: add IMContext subclassing support](https://github.com/gtk-rs/gtk4-rs/pull/114)
 * [gdk: bind gdk\_gl\_texture\_new](https://github.com/gtk-rs/gtk4-rs/pull/183)
 * [gtk: set the controller signals that return inhibit](https://github.com/gtk-rs/gtk4-rs/pull/184)
 * [regenerate with detailed signals support](https://github.com/gtk-rs/gtk4-rs/pull/197)
 * [gtk: make sure gtk::disable\_setlocale has to be called before gtk::init()](https://github.com/gtk-rs/gtk4-rs/pull/196)
 * [gtk: use "assertion" = "skip" instead of manual implementation](https://github.com/gtk-rs/gtk4-rs/pull/198)
 * [gtk: mark manually implemented functions as such](https://github.com/gtk-rs/gtk4-rs/pull/199)
 * [More doc aliases](https://github.com/gtk-rs/gtk4-rs/pull/200)
 * [gtk: add Expression bindings](https://github.com/gtk-rs/gtk4-rs/pull/201)
 * [update per glib::object\_subclass changes](https://github.com/gtk-rs/gtk4-rs/pull/203)
 * [gtk: more manual stuff](https://github.com/gtk-rs/gtk4-rs/pull/206)
 * [Update per subclassing changes](https://github.com/gtk-rs/gtk4-rs/pull/207)
 * [gtk: update per glib changes](https://github.com/gtk-rs/gtk4-rs/pull/208)
 * [update subclassing per gtk-rs/gtk-rs#342](https://github.com/gtk-rs/gtk4-rs/pull/209)
 * [more manual gtk stuff](https://github.com/gtk-rs/gtk4-rs/pull/210)
 * [more manual stuff 2](https://github.com/gtk-rs/gtk4-rs/pull/211)
 * [correctly make RenderNode not a glib::Object](https://github.com/gtk-rs/gtk4-rs/pull/186)
 * [subclassing: interfaces are now distinct from objects](https://github.com/gtk-rs/gtk4-rs/pull/214)
 * [interfaces chain up](https://github.com/gtk-rs/gtk4-rs/pull/215)
 * [gtk: add more WidgetClass methods](https://github.com/gtk-rs/gtk4-rs/pull/137)
 * [more manual stuff](https://github.com/gtk-rs/gtk4-rs/pull/213)
 * [gir: regen with always generate builder](https://github.com/gtk-rs/gtk4-rs/pull/219)
 * [gtk: add subclassing support for more types](https://github.com/gtk-rs/gtk4-rs/pull/224)
 * [more manual stuff](https://github.com/gtk-rs/gtk4-rs/pull/157)
 * [Examples: remove `get` from video\_player](https://github.com/gtk-rs/gtk4-rs/pull/226)
 * [Examples: move .ui files into separate folder](https://github.com/gtk-rs/gtk4-rs/pull/227)
 * [gtk: Application subclass initialization fix](https://github.com/gtk-rs/gtk4-rs/pull/228)
 * [attempt of a new readme format](https://github.com/gtk-rs/gtk4-rs/pull/189)
 * [gdk: add ToplevelExtManual to prelude](https://github.com/gtk-rs/gtk4-rs/pull/231)
 * [gtk: disable more printer stuff on non-unix platforms](https://github.com/gtk-rs/gtk4-rs/pull/233)
 * [gtk: ShortcutTriggerExtManual traits to prelude](https://github.com/gtk-rs/gtk4-rs/pull/234)
 * [Move the examples into separate folders](https://github.com/gtk-rs/gtk4-rs/pull/230)
 * [gtk: add features to re-export gdk-x11 & gdk-wayland](https://github.com/gtk-rs/gtk4-rs/pull/245)
 * [Properly expose features](https://github.com/gtk-rs/gtk4-rs/pull/246)
 * [examples: remove the duplicate custom editable](https://github.com/gtk-rs/gtk4-rs/pull/248)
 * [Read dropped application subclass example](https://github.com/gtk-rs/gtk4-rs/pull/241)
 * [Add book](https://github.com/gtk-rs/gtk4-rs/pull/252)
 * [Add book to README](https://github.com/gtk-rs/gtk4-rs/pull/262)
 * [gtk: make ShortcutTrigger::compare return a cmp::Ordering](https://github.com/gtk-rs/gtk4-rs/pull/263)
 * [misc: bump default features](https://github.com/gtk-rs/gtk4-rs/pull/264)
 * [Specify naming of types, signals & properties](https://github.com/gtk-rs/gtk4-rs/pull/269)
 * [Finish up prerequisites](https://github.com/gtk-rs/gtk4-rs/pull/265)
 * [Accomodate Gio changes](https://github.com/gtk-rs/gtk4-rs/pull/271)
 * [Put listings into the shared workspace](https://github.com/gtk-rs/gtk4-rs/pull/272)
 * [gtk: expose KeyvalTrigger](https://github.com/gtk-rs/gtk4-rs/pull/274)
 * [Update display of minimum supported Rust version](https://github.com/gtk-rs/gtk4-rs/pull/278)
 * [get\_widget\_name return annotation fixed upstream](https://github.com/gtk-rs/gtk4-rs/pull/279)
 * [gdk-x11: manual impl get\_xdisplay and get\_xsreen](https://github.com/gtk-rs/gtk4-rs/pull/281)
 * [Use relative paths to gtk4-rs docs](https://github.com/gtk-rs/gtk4-rs/pull/284)
 * [Use Error::into\_raw()](https://github.com/gtk-rs/gtk4-rs/pull/282)
 * [Refactor custom objects in own modules](https://github.com/gtk-rs/gtk4-rs/pull/273)
 * [Take str for with\_label and with\_mnemonic constructors.](https://github.com/gtk-rs/gtk4-rs/pull/290)
 * [\[gtk\] Update to gtk3 handling of Application](https://github.com/gtk-rs/gtk4-rs/pull/289)
 * [mark EventKind/IsExpression/IsRenderNode as unsafe](https://github.com/gtk-rs/gtk4-rs/pull/292)
 * [\[docs\] Adds an introduction for the gtk4 crate](https://github.com/gtk-rs/gtk4-rs/pull/288)
 * [Remove get  for getters & properties where applicable](https://github.com/gtk-rs/gtk4-rs/pull/296)
 * [no more boxes](https://github.com/gtk-rs/gtk4-rs/pull/298)
 * [bump min required rustc](https://github.com/gtk-rs/gtk4-rs/pull/302)
 * [readme: include a note about the other libs part of the ecosystem](https://github.com/gtk-rs/gtk4-rs/pull/305)
 * [Get removal round 2](https://github.com/gtk-rs/gtk4-rs/pull/303)
 * [more widget class methods](https://github.com/gtk-rs/gtk4-rs/pull/268)
 * [new generator & fancy updated docs](https://github.com/gtk-rs/gtk4-rs/pull/313)
 * [Improve signals](https://github.com/gtk-rs/gtk4-rs/pull/300)
 * [README: Add Video Trimmer to the app list](https://github.com/gtk-rs/gtk4-rs/pull/316)
 * [Cleanup leftovers from the remove-get-changes](https://github.com/gtk-rs/gtk4-rs/pull/315)
 * [Value trait refactoring](https://github.com/gtk-rs/gtk4-rs/pull/309)
 * [gtk: fix measure & add a layout manager example](https://github.com/gtk-rs/gtk4-rs/pull/320)
 * [move ExtManual traits to prelude only](https://github.com/gtk-rs/gtk4-rs/pull/323)
 * [add missing doc\_trait\_name & few fixes](https://github.com/gtk-rs/gtk4-rs/pull/327)
 * [Re-export glib::signal::Inhibit to gtk4 crate root like gtk3's bindings.](https://github.com/gtk-rs/gtk4-rs/pull/319)
 * [Add examples to README](https://github.com/gtk-rs/gtk4-rs/pull/295)
 * [gtk: bind WidgetClass::query\_action](https://github.com/gtk-rs/gtk4-rs/pull/328)
 * [Rename ToGlib into IntoGlib](https://github.com/gtk-rs/gtk4-rs/pull/331)
 * [Accomodate changes in glib::Value](https://github.com/gtk-rs/gtk4-rs/pull/325)
 * [gdk: make ContentProvider subclassable](https://github.com/gtk-rs/gtk4-rs/pull/314)
 * [Put modules of examples in separate files](https://github.com/gtk-rs/gtk4-rs/pull/330)
 * [gdk: manually bind ContentFormats::mime\_types](https://github.com/gtk-rs/gtk4-rs/pull/335)
 * [gdk: accept NULL GCancellable\*](https://github.com/gtk-rs/gtk4-rs/pull/336)
 * [gdk: ContentFormats use transfer none instead of container](https://github.com/gtk-rs/gtk4-rs/pull/337)
 * [Add grid\_packing example from the upstream C repository.](https://github.com/gtk-rs/gtk4-rs/pull/338)
 * [gtk: rename MediaStream::error to MediaStream::set\_error](https://github.com/gtk-rs/gtk4-rs/pull/341)
 * [gtk: make ClosureExpression's api a bit nicer](https://github.com/gtk-rs/gtk4-rs/pull/342)
 * [gtk: bind BitsetIter manually](https://github.com/gtk-rs/gtk4-rs/pull/307)
 * [split expressions/events to multiple files](https://github.com/gtk-rs/gtk4-rs/pull/343)
 * [Properly mark functions as renamed](https://github.com/gtk-rs/gtk4-rs/pull/345)
 * [gdk: fix ContentProvider::write\_mime\_type\_async](https://github.com/gtk-rs/gtk4-rs/pull/344)
 * [gtk: add getters/setters for Border](https://github.com/gtk-rs/gtk4-rs/pull/346)
 * [reduce usage of allow clippy](https://github.com/gtk-rs/gtk4-rs/pull/351)
 * [use Self where appropriate part 2](https://github.com/gtk-rs/gtk4-rs/pull/350)
 * [gtk: add FontChooser/TreeModelFilter subclassing support](https://github.com/gtk-rs/gtk4-rs/pull/347)
 * [Subclassing round 11](https://github.com/gtk-rs/gtk4-rs/pull/174)
 * [regen with latest gir & re-enable let\_and\_return lint](https://github.com/gtk-rs/gtk4-rs/pull/353)
 * [Add rename doc aliases + rename prop notify signals as connect\_\*\_notify](https://github.com/gtk-rs/gtk4-rs/pull/354)
 * [gtk: expose invalid pos](https://github.com/gtk-rs/gtk4-rs/pull/356)
 * [Add "Saving Window State" chapter](https://github.com/gtk-rs/gtk4-rs/pull/340)
 * [gtk: Builder is final](https://github.com/gtk-rs/gtk4-rs/pull/358)
 * [Fix new 1.52 clippy warnings](https://github.com/gtk-rs/gtk4-rs/pull/359)
 * [gtk: Put module of `list\_view\_apps\_launcher` in separate folder](https://github.com/gtk-rs/gtk4-rs/pull/360)
 * [gtk: use transfer full for property expression](https://github.com/gtk-rs/gtk4-rs/pull/362)
 * [misc: drop x11/wayland features from gtk4 crate](https://github.com/gtk-rs/gtk4-rs/pull/367)
 * [gdk: unmark \*\_async callbacks as Send](https://github.com/gtk-rs/gtk4-rs/pull/225)
 * [gtk: Add run\_future() for native dialogs](https://github.com/gtk-rs/gtk4-rs/pull/366)
 * [gtk: add ParamSpecExpression](https://github.com/gtk-rs/gtk4-rs/pull/369)
 * [gtk: drop duplicate getter/setters on SearchBar](https://github.com/gtk-rs/gtk4-rs/pull/372)
 * [gtk: make show\_about\_dialog's behaviour more like the upstream one](https://github.com/gtk-rs/gtk4-rs/pull/373)
 * [Update URLs pointing to gtk-rs](https://github.com/gtk-rs/gtk4-rs/pull/374)
 * [Add search\_bar example from the upstream C repository.](https://github.com/gtk-rs/gtk4-rs/pull/370)
 * [gtk: bind functions::test\_list\_all\_types](https://github.com/gtk-rs/gtk4-rs/pull/329)
 * [examples: point to gtk-rs-core ones](https://github.com/gtk-rs/gtk4-rs/pull/376)
 * [gtk: manually bind ConstraintLayout::add\_constraints\_from\_description](https://github.com/gtk-rs/gtk4-rs/pull/377)
 * [drop not needed subclassing](https://github.com/gtk-rs/gtk4-rs/pull/380)
 * [misc: add missing doc aliases](https://github.com/gtk-rs/gtk4-rs/pull/381)
 * [gdk fixes](https://github.com/gtk-rs/gtk4-rs/pull/386)
 * [Add doc alias check](https://github.com/gtk-rs/gtk4-rs/pull/388)
 * [gtk: drop MainContext check](https://github.com/gtk-rs/gtk4-rs/pull/391)
 * [gtk: stop abusing pattern and use name instead](https://github.com/gtk-rs/gtk4-rs/pull/394)
 * [gtk response type](https://github.com/gtk-rs/gtk4-rs/pull/395)
 * [gtk: ignore css\_parser\_warning\_quark](https://github.com/gtk-rs/gtk4-rs/pull/396)
 * [gir: enums fixes](https://github.com/gtk-rs/gtk4-rs/pull/397)
 * [gdk: ignore n\_ranges params in](https://github.com/gtk-rs/gtk4-rs/pull/398)
 * [book: Upgrade license to Creative Commons Attribution 4.0](https://github.com/gtk-rs/gtk4-rs/pull/402)
 * [book: Take advantage of the newly introduced `builder` method](https://github.com/gtk-rs/gtk4-rs/pull/403)
 * [drop not useful builders & generate missing ones](https://github.com/gtk-rs/gtk4-rs/pull/408)
 * [Gir fixes & regen](https://github.com/gtk-rs/gtk4-rs/pull/410)
 * [gdk: mark some types as non final](https://github.com/gtk-rs/gtk4-rs/pull/411)
 * [glib wrapper out of macros](https://github.com/gtk-rs/gtk4-rs/pull/415)
 * [gtk: register actions on the subclassed widget](https://github.com/gtk-rs/gtk4-rs/pull/413)
 * [tests: drop extern crate](https://github.com/gtk-rs/gtk4-rs/pull/417)
 * [misc: add doc aliases on manual types](https://github.com/gtk-rs/gtk4-rs/pull/418)
 * [gtk: panic if gtk wasn't init at class\_init/interface\_init](https://github.com/gtk-rs/gtk4-rs/pull/420)
 * [gtk4 macros test](https://github.com/gtk-rs/gtk4-rs/pull/421)
 * [gtk: add Buildable subclassing support](https://github.com/gtk-rs/gtk4-rs/pull/419)
 * [gtk: mark buildable\_get\_id as nullable](https://github.com/gtk-rs/gtk4-rs/pull/426)
 * [Use ::builder() in doc examples](https://github.com/gtk-rs/gtk4-rs/pull/428)
 * [Generate missing doc aliases for newtypes](https://github.com/gtk-rs/gtk4-rs/pull/429)
 * [Regen (new bitfields values and more doc aliases)](https://github.com/gtk-rs/gtk4-rs/pull/430)
 * [use ffi values instead of integers for bitfields](https://github.com/gtk-rs/gtk4-rs/pull/431)
 * [Add more doc aliases](https://github.com/gtk-rs/gtk4-rs/pull/432)
 * [book: Scalable lists chapter](https://github.com/gtk-rs/gtk4-rs/pull/361)
 * [less ext manual traits](https://github.com/gtk-rs/gtk4-rs/pull/434)
 * [book: Fix links in lists chapter](https://github.com/gtk-rs/gtk4-rs/pull/435)
 * [examples: fix per glib-macros changes](https://github.com/gtk-rs/gtk4-rs/pull/438)
 * [gdk-wayland: add missing prelude](https://github.com/gtk-rs/gtk4-rs/pull/441)
 * [Add an intro to all crates](https://github.com/gtk-rs/gtk4-rs/pull/440)
 * [docs: replace rust-logo with gtk-rs logo on the CI stage](https://github.com/gtk-rs/gtk4-rs/pull/449)
 * [Fix outdated docs overview link](https://github.com/gtk-rs/gtk4-rs/pull/453)
 * [A few miscellaneous book improvements](https://github.com/gtk-rs/gtk4-rs/pull/456)
 * [gtk: don't generate a builder for ListItem/BuilderListItemFactory](https://github.com/gtk-rs/gtk4-rs/pull/457)
 * [gtk: don't generate a builder for \*Page objects](https://github.com/gtk-rs/gtk4-rs/pull/458)
 * [\[regen\] Fix duplicate doc aliases](https://github.com/gtk-rs/gtk4-rs/pull/459)
 * [add missing gsk function & docs fixes](https://github.com/gtk-rs/gtk4-rs/pull/461)
 * [gtk: TreePath fixes](https://github.com/gtk-rs/gtk4-rs/pull/462)
 * [gdk texture fixes](https://github.com/gtk-rs/gtk4-rs/pull/463)
 * [gtk: TreeStore/ListStore are final](https://github.com/gtk-rs/gtk4-rs/pull/464)
 * [gdk: add a RGBABuilder](https://github.com/gtk-rs/gtk4-rs/pull/466)
 * [Fix clippy warnings](https://github.com/gtk-rs/gtk4-rs/pull/468)
 * [misc: update stable docs links](https://github.com/gtk-rs/gtk4-rs/pull/470)
 * [Book: Fix outdated and dead links](https://github.com/gtk-rs/gtk4-rs/pull/472)

All this was possible thanks to the [gir][gir] project as well:

 * [Specify link attribute for Windows to be happy](https://github.com/gtk-rs/gir/pull/965)
 * [Properly handle error-domain](https://github.com/gtk-rs/gir/pull/972)
 * [Add per-crate and per-object configuration to trust return value nullability](https://github.com/gtk-rs/gir/pull/970)
 * [Generate error quark functions in -sys mode if they exist](https://github.com/gtk-rs/gir/pull/978)
 * [toml: use new system-deps versions syntax](https://github.com/gtk-rs/gir/pull/980)
 * [Make sure that closures in global functions require Send+Sync](https://github.com/gtk-rs/gir/pull/981)
 * [Use char::TryFrom::&lt;u32&gt; to convert from UniChar](https://github.com/gtk-rs/gir/pull/977)
 * [Do not pass $rust\_class\_name to glib\_wrapper!](https://github.com/gtk-rs/gir/pull/983)
 * [Generate doc cfg attributes for more beautiful docs](https://github.com/gtk-rs/gir/pull/988)
 * [Don't warn on docsection elements](https://github.com/gtk-rs/gir/pull/989)
 * [Try to fix Windows CI](https://github.com/gtk-rs/gir/pull/986)
 * [Simplify `match` blocks into `?` operator using SSR](https://github.com/gtk-rs/gir/pull/992)
 * [codegen/enum: Do not generate doc(cfg) on match arms](https://github.com/gtk-rs/gir/pull/994)
 * [This is not needed any longer](https://github.com/gtk-rs/gir/pull/995)
 * [Switch to 2018 edition](https://github.com/gtk-rs/gir/pull/996)
 * [config/members: add manual to wanted check](https://github.com/gtk-rs/gir/pull/1003)
 * [Switch to doc cfg instead of feature dox](https://github.com/gtk-rs/gir/pull/1005)
 * [codegen: Explicitly use glib::Value instead of importing](https://github.com/gtk-rs/gir/pull/1006)
 * [codegen: Add version condition on special function traits](https://github.com/gtk-rs/gir/pull/1007)
 * [Use write\_str instead of write\_fmt when no formatting is needed](https://github.com/gtk-rs/gir/pull/1008)
 * [Revert "Switch to doc cfg instead of feature dox"](https://github.com/gtk-rs/gir/pull/1010)
 * [cargo\_toml: Do not overwrite library name for unversioned system-deps](https://github.com/gtk-rs/gir/pull/1011)
 * [don't be verbose on missing c:type on internal fields](https://github.com/gtk-rs/gir/pull/1001)
 * [Use `cargo:warning` instead of `eprintln!` for printing warnings](https://github.com/gtk-rs/gir/pull/1017)
 * [Generate `impl` blocks for associated enum functions](https://github.com/gtk-rs/gir/pull/991)
 * [Improve final type heuristic to also check for unknown instance structs](https://github.com/gtk-rs/gir/pull/1015)
 * [Make calls to from\_glib unsafe](https://github.com/gtk-rs/gir/pull/1018)
 * [Doc aliases for C functions](https://github.com/gtk-rs/gir/pull/1014)
 * [Fixed issue generating the -sys/Cargo.toml](https://github.com/gtk-rs/gir/pull/1022)
 * [cargo\_toml: Do not overwrite system-deps version if already set](https://github.com/gtk-rs/gir/pull/1023)
 * [Use new glib::Object::new() syntax](https://github.com/gtk-rs/gir/pull/1024)
 * [Use `wrapper!` instead of `glib\_wrapper!`](https://github.com/gtk-rs/gir/pull/1025)
 * [Generate doc aliases for enums and constants too](https://github.com/gtk-rs/gir/pull/1026)
 * [Add an error in case a name field has content of the pattern field](https://github.com/gtk-rs/gir/pull/1027)
 * [Unify toml comments format in README](https://github.com/gtk-rs/gir/pull/1028)
 * [Fix import of BoolError in glib](https://github.com/gtk-rs/gir/pull/1029)
 * [Remove use\_boxed\_functions override](https://github.com/gtk-rs/gir/pull/1032)
 * [function: Teach gir how to generate whole functions as unsafe](https://github.com/gtk-rs/gir/pull/1033)
 * [Add extra\_dox\_features config setting](https://github.com/gtk-rs/gir/pull/1038)
 * [codegen: Omit mut\_override from boxed copy if parameter is \*const](https://github.com/gtk-rs/gir/pull/1044)
 * [analysis: Move global imports to object-specific analysis and under versioning constraints](https://github.com/gtk-rs/gir/pull/1043)
 * [Honor the PKG\_CONFIG env var in the codegen for abi tests](https://github.com/gtk-rs/gir/pull/1045)
 * [Add documentation in case this is an abstract class](https://github.com/gtk-rs/gir/pull/1051)
 * [codegen: rework ABI tests to use a single C program for each test](https://github.com/gtk-rs/gir/pull/1050)
 * [Fix new clippy warning in generated C tests](https://github.com/gtk-rs/gir/pull/1053)
 * [sys: use system-deps 3.0](https://github.com/gtk-rs/gir/pull/1054)
 * [doc\_alias: don't generate if the enum c\_name = rust\_name](https://github.com/gtk-rs/gir/pull/1055)
 * [Consider nullability of out parameters in normal and async functions](https://github.com/gtk-rs/gir/pull/1057)
 * [signals: rename emit to emit\_by\_name](https://github.com/gtk-rs/gir/pull/1060)
 * [codegen: Avoid a dead code warning in ABI tests](https://github.com/gtk-rs/gir/pull/1061)
 * [assertions: add a not initialized variant](https://github.com/gtk-rs/gir/pull/1064)
 * [README: fix object.function "assertion" key name](https://github.com/gtk-rs/gir/pull/1065)
 * [Add support for connecting to signals with details](https://github.com/gtk-rs/gir/pull/1062)
 * [Also populate interface structs in addition to class structs](https://github.com/gtk-rs/gir/pull/1066)
 * [Extend --gir-directory (into --gir-directories) to be able to pass multiple gir directories](https://github.com/gtk-rs/gir/pull/1041)
 * ["canonicalize" paths](https://github.com/gtk-rs/gir/pull/1074)
 * [add an option to always generate builder patterns](https://github.com/gtk-rs/gir/pull/1072)
 * [sys mode: allow clippy warning upper\_case\_acronyms](https://github.com/gtk-rs/gir/pull/1082)
 * [config: "Canonicalize" ../ away from relative git paths](https://github.com/gtk-rs/gir/pull/1075)
 * [Omit version constraints if the surrounding scope already guards these](https://github.com/gtk-rs/gir/pull/1080)
 * [\[1/3\] Emit intra-doc links for self (`@`) references](https://github.com/gtk-rs/gir/pull/1088)
 * [config: Normalize submodule path before looking it up in .gitmodules](https://github.com/gtk-rs/gir/pull/1090)
 * [Remove get for getters](https://github.com/gtk-rs/gir/pull/1021)
 * [Fix renamed functions not being documented](https://github.com/gtk-rs/gir/pull/1098)
 * [analysis/record: Do not bail on missing memory functions](https://github.com/gtk-rs/gir/pull/1103)
 * [doc: Use intra-doc-links instead of relative paths to html pages](https://github.com/gtk-rs/gir/pull/1084)
 * [config,git: Omit gir directory hash and URL if not a submodule](https://github.com/gtk-rs/gir/pull/1101)
 * [Get removal round 2](https://github.com/gtk-rs/gir/pull/1102)
 * [Import generator.py from gtk-rs](https://github.com/gtk-rs/gir/pull/1097)
 * [Value trait refactoring](https://github.com/gtk-rs/gir/pull/1100)
 * [docs: manual traits are in prelude only](https://github.com/gtk-rs/gir/pull/1111)
 * [codegen/object: Only re-export traits from `traits`/`prelude` module](https://github.com/gtk-rs/gir/pull/1113)
 * [codegen/general: Emit "Since vXXX" in #\[deprecated\] attributes](https://github.com/gtk-rs/gir/pull/1087)
 * [codegen/doc: Omit "Feature: `vXXX`" text in favour of doc\_cfg](https://github.com/gtk-rs/gir/pull/1086)
 * [\[3/3\] Emit intra-doc-links for symbol references](https://github.com/gtk-rs/gir/pull/1085)
 * [\[2/3\] Emit intra-doc links for function references](https://github.com/gtk-rs/gir/pull/1089)
 * [analysis/properties: Remove unused ToValue import for property getters](https://github.com/gtk-rs/gir/pull/1117)
 * [codegen: take Self for Copy types](https://github.com/gtk-rs/gir/pull/1093)
 * [out\_param: follow aliases for imports](https://github.com/gtk-rs/gir/pull/1120)
 * [build: Rerun if git hash changed](https://github.com/gtk-rs/gir/pull/1118)
 * [Fix some clippy::use\_self warnings in generated code](https://github.com/gtk-rs/gir/pull/1121)
 * [doc: Always consider `trait\_name` from `Gir.toml` in implementation docs](https://github.com/gtk-rs/gir/pull/1108)
 * [codegen: only use ret if a builder\_postprocess is set](https://github.com/gtk-rs/gir/pull/1123)
 * [codegen: add missing } for build pattern](https://github.com/gtk-rs/gir/pull/1125)
 * [Add rename doc aliases](https://github.com/gtk-rs/gir/pull/1116)
 * [codegen/enums: Keep emitting name of `Self` in string literals](https://github.com/gtk-rs/gir/pull/1124)
 * [TryFromGlib support](https://github.com/gtk-rs/gir/pull/1092)
 * [config/function: allow forcing 'constructor' annotation](https://github.com/gtk-rs/gir/pull/1126)
 * [codegen: Emit `crate::` for all global `%` constants except from prelude](https://github.com/gtk-rs/gir/pull/1127)
 * [doc: Link trait functions in `prelude`](https://github.com/gtk-rs/gir/pull/1119)
 * [\[RFC\] codegen/doc: Simplify links by allowing `Self::` and `crate::` prefix](https://github.com/gtk-rs/gir/pull/1128)
 * [funct async: use codegen name for \_future funct](https://github.com/gtk-rs/gir/pull/1130)
 * [Fix some clippy/compiler warnings](https://github.com/gtk-rs/gir/pull/1131)
 * [git: Read remote url from upstream or origin](https://github.com/gtk-rs/gir/pull/1068)
 * [Use try\_from\_glib shortcut](https://github.com/gtk-rs/gir/pull/1135)
 * [codegen/sys: Use pointer formatting literal to print address of self](https://github.com/gtk-rs/gir/pull/1138)
 * [Stop dereferencing followed by reborrowing in `match` and `if let`](https://github.com/gtk-rs/gir/pull/1139)
 * [codegen: default to gtk-rs-core for sys crates](https://github.com/gtk-rs/gir/pull/1141)
 * [Rename `do\_main` to `main`](https://github.com/gtk-rs/gir/pull/1146)
 * [codegen/doc: Drop `\[Deprecated\]` text in favour of Rust annotations](https://github.com/gtk-rs/gir/pull/1148)
 * [codegen/object: Add missing deprecation attribute to builders](https://github.com/gtk-rs/gir/pull/1147)
 * [docs: generate docs for builder properties](https://github.com/gtk-rs/gir/pull/1144)
 * [docs: ignore not useful function parameters](https://github.com/gtk-rs/gir/pull/1145)
 * [docs: generate docs for global functions](https://github.com/gtk-rs/gir/pull/1151)
 * [docs: fix a missing param due to not rebasing #1151](https://github.com/gtk-rs/gir/pull/1154)
 * [codegen: use C value instead of hardcoding it](https://github.com/gtk-rs/gir/pull/1152)
 * [docs: use doc\_ignore\_parameters for global functions as well](https://github.com/gtk-rs/gir/pull/1155)
 * [codgen: generate a builder method for objects with a Builder ](https://github.com/gtk-rs/gir/pull/1156)
 * [codgen: generate impl T if there are builder properties as well](https://github.com/gtk-rs/gir/pull/1159)
 * [\[refactor\] Simplify handling of trait bounds and aliases](https://github.com/gtk-rs/gir/pull/1160)
 * [codegen/doc: Make extension trait docs link back to the type](https://github.com/gtk-rs/gir/pull/1168)
 * [docs: properly look for renamed enum members](https://github.com/gtk-rs/gir/pull/1166)
 * [docs: use renamed function name for records as well](https://github.com/gtk-rs/gir/pull/1167)
 * [docs: filter out final types from implements trait list](https://github.com/gtk-rs/gir/pull/1165)
 * [enums,flags: Always analyze manual types](https://github.com/gtk-rs/gir/pull/1164)
 * [flags: generate doc aliases](https://github.com/gtk-rs/gir/pull/1170)
 * [enums,flags: Do not analyze imports if the type is not generated](https://github.com/gtk-rs/gir/pull/1169)
 * [Docs: refactored + GI Docgen support](https://github.com/gtk-rs/gir/pull/1161)
 * [docs: look for renamed properties getters/setters](https://github.com/gtk-rs/gir/pull/1172)
 * [codgen: make the builder method doc slightly better formatted](https://github.com/gtk-rs/gir/pull/1173)
 * [Generate doc aliases on items in wrapper! macro](https://github.com/gtk-rs/gir/pull/1176)
 * [use C const for flags variants](https://github.com/gtk-rs/gir/pull/1175)
 * [Fix sys crate name for bitfields](https://github.com/gtk-rs/gir/pull/1177)
 * [analysis/function: Don't link docs that are commented or invisible](https://github.com/gtk-rs/gir/pull/1178)
 * [codegen/doc: Generate links for enum/flag functions/methods](https://github.com/gtk-rs/gir/pull/1179)
 * [Add float format to PRINT\_CONSTANT](https://github.com/gtk-rs/gir/pull/1142)
 * [enum,flags: Take `version=` attribute in XML for members into account](https://github.com/gtk-rs/gir/pull/1180)
 * [Add support for cfg\_condition on enum variants and bitfields and fix cfg\_condition for enums and bitfields](https://github.com/gtk-rs/gir/pull/1181)
 * [Let cancellable be passed into GioFuture instead of creating it ourselves](https://github.com/gtk-rs/gir/pull/1182)
 * [Don't generate duplicated doc aliases](https://github.com/gtk-rs/gir/pull/1185)
 * [Move tutorial & configurations docs to an mdbook](https://github.com/gtk-rs/gir/pull/1188)
 * [docs: properly handle trait name for manual methods](https://github.com/gtk-rs/gir/pull/1186)
 * [Rust 1.53: Use the new nested or\_patterns](https://github.com/gtk-rs/gir/pull/1189)
 * [Generate warnings for code examples](https://github.com/gtk-rs/gir/pull/1191)
 * [Remove extra & to fix clippy lint](https://github.com/gtk-rs/gir/pull/1192)
 * [Fix a/an grammar by changing the sentences.](https://github.com/gtk-rs/gir/pull/1194)
 * [Fix link to builder pattern explanation](https://github.com/gtk-rs/gir/pull/1195)

Thanks to all of our contributors for their (awesome!) work on this release:

 * [@A6GibKm](https://github.com/A6GibKm)
 * [@AaronErhardt](https://github.com/AaronErhardt)
 * [@abdulrehman-git](https://github.com/abdulrehman-git)
 * [@aknarts](https://github.com/aknarts)
 * [@alatiera](https://github.com/alatiera)
 * [@andy128k](https://github.com/andy128k)
 * [@bilelmoussaoui](https://github.com/bilelmoussaoui)
 * [@BrainBlasted](https://github.com/BrainBlasted)
 * [@bvinc](https://github.com/bvinc)
 * [@chengchangwu](https://github.com/chengchangwu)
 * [@cmyr](https://github.com/cmyr)
 * [@Cogitri](https://github.com/Cogitri)
 * [@deanleggo](https://github.com/deanleggo)
 * [@derekdreery](https://github.com/derekdreery)
 * [@dns2utf8](https://github.com/dns2utf8)
 * [@elmarco](https://github.com/elmarco)
 * [@federicomenaquintero](https://github.com/federicomenaquintero)
 * [@felinira](https://github.com/felinira)
 * [@fengalin](https://github.com/fengalin)
 * [@gdesmott](https://github.com/gdesmott)
 * [@george-hopkins](https://github.com/george-hopkins)
 * [@grantshandy](https://github.com/grantshandy)
 * [@GuillaumeGomez](https://github.com/GuillaumeGomez)
 * [@haecker-felix](https://github.com/haecker-felix)
 * [@heftig](https://github.com/heftig)
 * [@hfiguiere](https://github.com/hfiguiere)
 * [@Hofer-Julian](https://github.com/Hofer-Julian)
 * [@idanarye](https://github.com/idanarye)
 * [@ids1024](https://github.com/ids1024)
 * [@jplatte](https://github.com/jplatte)
 * [@jsparber](https://github.com/jsparber)
 * [@kavanmevada](https://github.com/kavanmevada)
 * [@Krowemoh](https://github.com/Krowemoh)
 * [@lucab](https://github.com/lucab)
 * [@MarijnS95](https://github.com/MarijnS95)
 * [@matzipan](https://github.com/matzipan)
 * [@mbiggio](https://github.com/mbiggio)
 * [@mehmooda](https://github.com/mehmooda)
 * [@palfrey](https://github.com/palfrey)
 * [@pbor](https://github.com/pbor)
 * [@piegamesde](https://github.com/piegamesde)
 * [@sdroege](https://github.com/sdroege)
 * [@seungha-yang](https://github.com/seungha-yang)
 * [@SolraBizna](https://github.com/SolraBizna)
 * [@sophie-h](https://github.com/sophie-h)
 * [@vamsikrishna-brahmajosyula](https://github.com/vamsikrishna-brahmajosyula)
 * [@wonchulee](https://github.com/wonchulee)
 * [@YaLTeR](https://github.com/YaLTeR)
 * [@zec](https://github.com/zec)

[gtk-rs-core]: https://github.com/gtk-rs/gtk-rs-core
[gtk3-rs]: https://github.com/gtk-rs/gtk3-rs
[gtk4-rs]: https://github.com/gtk-rs/gtk4-rs
[gstreamer-rs]: https://gitlab.freedesktop.org/gstreamer/gstreamer-rs
[gir]: https://github.com/gtk-rs/gir

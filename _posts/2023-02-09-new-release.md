---
layout: post
author: gtk-rs devs
title: New release
categories: [front, crates]
date: 2023-02-10 22:00:00 +0000
---

It's now time for a new gtk-rs release! As you might've noticed, the `gtk3-rs` projects are getting less and less attention and we intend to deprecate them in one of the future releases. Therefore, we recommend to anyone who didn't upgrade to GTK4 to do it.

You can also find the CHANGELOG of the corresponding `gstreamer-rs` 0.20 release [here](https://gitlab.freedesktop.org/gstreamer/gstreamer-rs/-/blob/main/gstreamer/CHANGELOG.md#0200-2023-02-10).

On this note, time to go through the major changes of this release. Enjoy!

## Increase of the minimum supported Rust version (MSRV)

With this release, Rust 1.64 is the minimum version required to compile and use the bindings.

## New `#[properties]` macro to make using properties in `glib::Object` subclasses simpler

The `glib::Properties` macro is now available! It can be used to define object properties straight from the implementation struct definition. The macro will:
 - define all the necessary `ParamSpec`s, with the required flags
 - generate, for each property, a default getter/setter on the wrapper type
 - generate, for each property, a `notify_$property` method on the wrapper type
 - generate the methods `derived_properties` `derived_property` and `derived_set_property`, which can be directly called inside your overrides for `ObjectImpl` methods `properties`, `property` and `set_property`.

### Quick example

```
#[derive(Properties)]
#[properties(wrapper_type = super::Author)]
pub struct Author {
    #[property(get, set)]
    name: RefCell<String>,
}
```

This is the result of months of work, and will greatly improve the gtk-rs ecosystem by reducing some of the most prevalent boilerplate and making the platform more welcoming.

Be sure to check out the [documentation](https://gtk-rs.org/gtk-rs-core/stable/latest/docs/glib/derive.Properties.html) for more info.

## Direct conversions to `glib::Value` and `glib::Variant` via `From`

Previously conversions required using the custom `ToValue` and `ToVariant` traits, which is not very intuitive. Now it's possible to directly use the `From` trait, i.e. `123i32.to_value()` could become `123i32.into()`.

In addition to improving usability this also avoids copies of the values in a few cases.

## `gdk_pixbuf` subclassing support

Support for subclassing various `gdk_pixbuf` types was added. This allows writing custom pixbuf loaders in Rust and hopefully opens the way for replacing the old C-based PNG/JPEG/GIF pixbuf loaders with Rust versions to improve image loading in all GTK/GNOME applications.

## New `glib::CastNone` convenience trait

In many cases casting failures of `Option`al values should be treated as `None`. For this purpose a new convenience trait was introduced, which provides an `and_downcast()` method.

```rust
let widget: Option<Widget> = list_item.child();

// Without using `CastNone`
let label = widget.unwrap().downcast::<gtk::Label>().unwrap();

// Using `CastNone` we can avoid the first `unwrap()` call
let label = widget.and_downcast::<gtk::Label>().unwrap();
```

## New `glib::function_name!` macro

While a huge hack, until Rust supports this directly, this macro will allow to get the name of the current function as a `&'static str`. Or to be more exact, the whole path to the current function.

This is now used in the GLib structured logging API to provide the function name (in addition to the file name, line number and other metadata) and `glib::BoolError` to provide better location information.

## `glib::GStr`, `glib::List`, `glib::PtrSlice`, `glib::Slice`, `glib::StrV` and related native GLib types

New API was added to all the aforementioned types to make dealing with them more natural in Rust. Using them instead of the native Rust types, e.g. `Vec`, allows for fewer copies when passing the FFI boundary.

Various bindings were also switched to these types for the same reason, and it is planned for the next release(s) to move even more API to it.

In addition two new traits were introduced for dealing with GLib strings and string arrays more efficiently: `IntoGStr` and `IntoStrV`. Both allow passing a plain `&str` or an already `NUL`-terminated `&GStr`, or a `Vec<String>` or an already `NUL`-terminated `glib::StrV` to functions and internally the function would either do a copy or directly pass the value to the C function. Up to a certain size the copy would by done on the stack, afterwards a temporary heap copy is made. Compared to the before, when temporary heap copies were made unconditionally, this allows for a lot fewer temporary heap allocations.

And lastly, `glib::GString` is now storing strings up to a certain size inline without requiring a heap allocation. New `GString`s can be created via the `gformat!` macro similar to the `format!` macro from `std`.

## Various code generation improvements

All over the bindings, various small code generation improvements were applied which reduced the size of the generated code and/or improved the performance.

For example:
 - Various trivial functions were explicitly marked as `#[inline]` to give the compiler yet another hint to actually inline them, and improve inlining across crate boundaries, which then causes the bindings to be completely optimized away in most cases.
 - In many places, where it made sense, assertions were converted to `debug_assert!`s to reduce the number of places where stack unwinding could happen in release builds.
 - The representation of various types was improved, e.g. by removing unnecessary `Option` wrapping around values or replacing unneeded references with `PhantomData` with the same lifetime.
 - Memory initialized by C functions was converted from using zero-initialization to `MaybeUninit`.
 - The number of redundant checks was reduced and `unsafe` variants of functions that skip the checks were added.
 - All object builder types were changed to use `glib::Object::builder()`, which reduces stack usage dramatically in addition to requiring fewer value copies.

## New `glib::Object` constructors

The old `Object::new()` constructor that took a slice of property name / value pairs was removed. Instead, `Object::new()` takes no parameters and creates a new object with default property values.

For creating a new object with non-default property values, use `Object::builder()`. It provides a much nicer API and also allows for better code generation and fewer value copies.

```rust
// before
let obj = glib::Object::new::<MyObject>(&[("a", &123i32), ("b", &"some string")]);
// after
let obj = glib::Object::builder::<MyObject>()
    .property("a", 123i32)
    .property("b", "some string")
    .build();
```

## `gio::Application::run()` returns an `ExitCode`

Instead of returning a plain `i32`, `gio::Application::run()` now returns an `ExitCode` type. This can be directly returned from the `main()` function as it implements the `Termination` trait, making it much easier to correctly propagate application exit codes.

## GTK4 4.10 API additions

The GTK4 bindings were updated to include all the new APIs introduced by the upcoming GTK 4.10 release. These new APIs are available via the `v4_10` feature flag. Note that they are **not stable** and are subject to change if the underlying C API happens to change before the 4.10.0 release.

The minimum supported GTK version stays at 4.0.0.

## Add Blueprint UI definition support

[Blueprint](https://jwestman.pages.gitlab.gnome.org/blueprint-compiler/) is a new markup language for defining GTK4 UIs. The `#[template]` macro can now accept Blueprint UI definitions in addition to the old XML-based UI definitions. Doing so requires `blueprint-compiler` to be available during compilation.

```rust
#[derive(Debug, Default, gtk::CompositeTemplate)]
#[template(string = "
template MyWidget : Widget {
    Label label {
        label: 'foobar';
    }
    Label my_label2 {
        label: 'foobaz';
    }
}
")]
pub struct MyWidget {
    #[template_child]
    pub label: TemplateChild<gtk::Label>,
    #[template_child(id = "my_label2")]
    pub label2: gtk::TemplateChild<gtk::Label>,
}
```

You can also copy the example from <https://github.com/gtk-rs/gtk4-rs/releases/tag/0.6.0>.

## Better mapping of C ownership transfer

Previously various functions that took ownership of their parameters still used references in the bindings. This required an unnecessary copy to be made in the worst case, and in the best case made it less clear that ownership of the object is given away.

In this release, functions are taking various arguments by value in more places.

## Spawning of blocking functions on the `glib::MainContext`

`gio::spawn_blocking()` was added, which allows to spawn blocking functions on an internal threadpool and retrieve their results as a `Future` from the `glib::MainContext`. This is useful for doing blocking / CPU intensive work in the background and when the results are available to handle them on the application's main thread.

As part of this work, `JoinHandle`-style types were also added to `glib::MainContext::spawn()` and related functions for spawning `Future`s on the main context, and to `glib::ThreadPool` for spawning functions on a custom thread pool and collecting their results.

# Changes

For those who are interested, here is the list of the merged pull requests:

[gtk-rs-core](https://github.com/gtk-rs/gtk-rs-core):

 * [Fixed clippy lints and warnings](https://github.com/gtk-rs/gtk-rs-core/pull/800)
 * [cairo: Fix rectangle getter](https://github.com/gtk-rs/gtk-rs-core/pull/803)
 * [glib: Add helpers for setting property bindings flags](https://github.com/gtk-rs/gtk-rs-core/pull/802)
 * [glib: Add a getter for `ObjectBuilder::type_`](https://github.com/gtk-rs/gtk-rs-core/pull/801)
 * [glib: Add unsafe bindings to `g_object_run_dispose()`](https://github.com/gtk-rs/gtk-rs-core/pull/811)
 * [gio: Add `set_only`/`get_only` helpers to BindingBuilder](https://github.com/gtk-rs/gtk-rs-core/pull/810)
 * [gio: Add helpers for setting SettingBinding flags ](https://github.com/gtk-rs/gtk-rs-core/pull/809)
 * [Correct outdated references to `subclass::simple`](https://github.com/gtk-rs/gtk-rs-core/pull/808)
 * [glib: Add `ObjectSubclass::obj()` as a shorter alias for `instance()`](https://github.com/gtk-rs/gtk-rs-core/pull/806)
 * [image: Rebuild once every week](https://github.com/gtk-rs/gtk-rs-core/pull/817)
 * [Fix new clippy lints](https://github.com/gtk-rs/gtk-rs-core/pull/816)
 * [fix CI for 1.65/1.66](https://github.com/gtk-rs/gtk-rs-core/pull/819)
 * [Fix new clippy lints](https://github.com/gtk-rs/gtk-rs-core/pull/823)
 * [Move from `imp.instance()` to `imp.obj()`](https://github.com/gtk-rs/gtk-rs-core/pull/814)
 * [Move `g_cancellable_set_error_if_cancelled()` to manual](https://github.com/gtk-rs/gtk-rs-core/pull/820)
 * [pango: Auto generate Language](https://github.com/gtk-rs/gtk-rs-core/pull/827)
 * [pango: Make `pango::Language::from_string()` infallible](https://github.com/gtk-rs/gtk-rs-core/pull/828)
 * [Implement `From<T>` for Value, Variant](https://github.com/gtk-rs/gtk-rs-core/pull/826)
 * [glib: fix undefined behavior in `types::register_type`](https://github.com/gtk-rs/gtk-rs-core/pull/836)
 * [gdk-pixbuf: Add subclassing support](https://github.com/gtk-rs/gtk-rs-core/pull/835)
 * [glib: Document the value guarantees for `ObjectImpl::set_property()` and `property()`](https://github.com/gtk-rs/gtk-rs-core/pull/832)
 * [glib: Add a doc string for `as_ptr` generated impls](https://github.com/gtk-rs/gtk-rs-core/pull/830)
 * [Fix ABI tests](https://github.com/gtk-rs/gtk-rs-core/pull/840)
 * [cairo: fix some misc warnings](https://github.com/gtk-rs/gtk-rs-core/pull/841)
 * [gio: socket/stream extras](https://github.com/gtk-rs/gtk-rs-core/pull/822)
 * [cairo: Update to freetype 0.32](https://github.com/gtk-rs/gtk-rs-core/pull/844)
 * [Add `CastNone` trait](https://github.com/gtk-rs/gtk-rs-core/pull/843)
 * [pango: Backport Language changes](https://github.com/gtk-rs/gtk-rs-core/pull/846)
 * [gio: Make GioFuture handle infaliable futures](https://github.com/gtk-rs/gtk-rs-core/pull/848)
 * [gio: Add a GioInfaliableFuture](https://github.com/gtk-rs/gtk-rs-core/pull/849)
 * [Add a changelog file](https://github.com/gtk-rs/gtk-rs-core/pull/850)
 * [glib: Implement `IntoGlibPtr` for `Option<T>`](https://github.com/gtk-rs/gtk-rs-core/pull/853)
 * [glib: Use actual function name in `glib::BoolError` and include function name/source file/line number in structured logs](https://github.com/gtk-rs/gtk-rs-core/pull/852)
 * [glib: Add `GStr::from_ptr_lossy()` and `GString::from_ptr_lossy()` and implement `From<GStr>` and `From<GString>` for `Cow<GStr>`](https://github.com/gtk-rs/gtk-rs-core/pull/855)
 * [glib: Implement `GStringBuilder` as `BoxedInline` to avoid a useless additional heap allocation](https://github.com/gtk-rs/gtk-rs-core/pull/856)
 * [glib: Minor `GStringBuilder` improvements](https://github.com/gtk-rs/gtk-rs-core/pull/857)
 * [Group imports and use prelude](https://github.com/gtk-rs/gtk-rs-core/pull/854)
 * [glib: Bind more `g_utf8` APIs](https://github.com/gtk-rs/gtk-rs-core/pull/813)
 * [gio: fix clippy lints for rust 1.64](https://github.com/gtk-rs/gtk-rs-core/pull/861)
 * [gio: add `spawn_blocking()`](https://github.com/gtk-rs/gtk-rs-core/pull/818)
 * [Fix various new beta clippy warnings](https://github.com/gtk-rs/gtk-rs-core/pull/862)
 * [examples: spawn async gio task on the current thread context](https://github.com/gtk-rs/gtk-rs-core/pull/863)
 * [Various `Stash` / `to_glib_none()` related optimizations and bugfixes](https://github.com/gtk-rs/gtk-rs-core/pull/865)
 * [GString refactor](https://github.com/gtk-rs/gtk-rs-core/pull/600)
 * [ActionEntry: take proper types instead of strings](https://github.com/gtk-rs/gtk-rs-core/pull/870)
 * [Inline various trivial functions](https://github.com/gtk-rs/gtk-rs-core/pull/866)
 * [Suggest kebab-case for the error domain](https://github.com/gtk-rs/gtk-rs-core/pull/874)
 * [gio: simplify async initable](https://github.com/gtk-rs/gtk-rs-core/pull/876)
 * [Improve `glib::collections` API and make it more versatile](https://github.com/gtk-rs/gtk-rs-core/pull/875)
 * [glib: Minor optimization for `List`/`SList` with `Copy` types](https://github.com/gtk-rs/gtk-rs-core/pull/877)
 * [glib: Fix `glib::wrapper!` for `BoxedInline` with generic parameters](https://github.com/gtk-rs/gtk-rs-core/pull/879)
 * [glib: Optimize various from/to `Vec` FFI translation functions](https://github.com/gtk-rs/gtk-rs-core/pull/878)
 * [Use `IntoGlibPtr` instead of `to_glib_full()` in more places](https://github.com/gtk-rs/gtk-rs-core/pull/881)
 * [glib: Add `Value::from_type_unchecked()`](https://github.com/gtk-rs/gtk-rs-core/pull/883)
 * [glib: Use `IntoGStr` trait in a couple of places](https://github.com/gtk-rs/gtk-rs-core/pull/882)
 * [Generate string constants as `&'static GStr` / `[u8]`](https://github.com/gtk-rs/gtk-rs-core/pull/885)
 * [glib: Fix usage of `gformat!` macro if `GString` is not in scope](https://github.com/gtk-rs/gtk-rs-core/pull/886)
 * [build tools: fix documentation link](https://github.com/gtk-rs/gtk-rs-core/pull/894)
 * [Enable introspection](https://github.com/gtk-rs/gtk-rs-core/pull/900)
 * [pango: use the new List api to simplify `reorder_items`](https://github.com/gtk-rs/gtk-rs-core/pull/896)
 * [glib: implement `ToGlibPtr<*mut _>` for boxed types](https://github.com/gtk-rs/gtk-rs-core/pull/895)
 * [settings: implement strv setter and getter manually](https://github.com/gtk-rs/gtk-rs-core/pull/899)
 * [gio: use StrV for the simple proxy resolver API](https://github.com/gtk-rs/gtk-rs-core/pull/898)
 * [glib: Add `ParamSpec::is()` helper function](https://github.com/gtk-rs/gtk-rs-core/pull/907)
 * [gdk-pixbuf: Trust return value nullability](https://github.com/gtk-rs/gtk-rs-core/pull/905)
 * [glib: Deprecate `ObjectSubclass::instance()` / `from_instance()` in favour of the shorter versions](https://github.com/gtk-rs/gtk-rs-core/pull/906)
 * [build-tools: Fix reporting of errors](https://github.com/gtk-rs/gtk-rs-core/pull/904)
 * [Do not hard-code path separator](https://github.com/gtk-rs/gtk-rs-core/pull/911)
 * [glib: Implement enum paramspec builder variant that builds the default value automatically](https://github.com/gtk-rs/gtk-rs-core/pull/909)
 * [glib: Deprecate paramspec `new()` functions in favour of the builder](https://github.com/gtk-rs/gtk-rs-core/pull/908)
 * [glib: Add new object constructor for constructing an object with default property values](https://github.com/gtk-rs/gtk-rs-core/pull/910)
 * [glib: Add `MainContext::spawn_from_within()` for spawning non-`Send` futures from another thread](https://github.com/gtk-rs/gtk-rs-core/pull/901)
 * [mark suboptimal `Object` constructors as deprecated](https://github.com/gtk-rs/gtk-rs-core/pull/914)
 * [glib: Implement more From traits for StrV](https://github.com/gtk-rs/gtk-rs-core/pull/919)
 * [build-tools: Allow passing multiple source dirs to `compile_resources`](https://github.com/gtk-rs/gtk-rs-core/pull/917)
 * [gio: use GStr for the manual extension point implenentation](https://github.com/gtk-rs/gtk-rs-core/pull/920)
 * [glib: Implement various traits on `GStr` manually](https://github.com/gtk-rs/gtk-rs-core/pull/921)
 * [gio: bind GFileDescriptorBased](https://github.com/gtk-rs/gtk-rs-core/pull/915)
 * [glib: Manually implement `TimeZone::adjust_time()` instead of ignoring it](https://github.com/gtk-rs/gtk-rs-core/pull/924)
 * [application: Return ExitCode](https://github.com/gtk-rs/gtk-rs-core/pull/880)
 * [Properties macro](https://github.com/gtk-rs/gtk-rs-core/pull/494)
 * [gdk-pixbuf: check if either width/height is null before assignment in `animation_get_size()`](https://github.com/gtk-rs/gtk-rs-core/pull/928)
 * [glib: Rename `Object::new_default()` to `Object::new()` and remove deprecated API](https://github.com/gtk-rs/gtk-rs-core/pull/931)
 * [Add TransparentPtr marker trait to List, SList and StrVItem](https://github.com/gtk-rs/gtk-rs-core/pull/936)
 * [Rename StrVItem to GStrPtr and make it clonable and transparent](https://github.com/gtk-rs/gtk-rs-core/pull/938)
 * [Remove `construct_cell`, too experimental](https://github.com/gtk-rs/gtk-rs-core/pull/941)
 * [Use `PtrSlice<GStrPtr>` for `KeyFile` methods](https://github.com/gtk-rs/gtk-rs-core/pull/926)
 * [gio: Don't require a `'static` `&str` in `File::enumerate_children_async()` and `enumerate_children_future()`](https://github.com/gtk-rs/gtk-rs-core/pull/944)
 * [gdk-pixbuf: Ensure that transfer-none return values in subclassing are staying alive long enough](https://github.com/gtk-rs/gtk-rs-core/pull/934)
 * [gdk-pixbuf: Fix time related types](https://github.com/gtk-rs/gtk-rs-core/pull/933)
 * [Add doc for ConstructCell, improve doc Boxed, Enum](https://github.com/gtk-rs/gtk-rs-core/pull/940)
 * [macros: further tweak docs](https://github.com/gtk-rs/gtk-rs-core/pull/948)
 * [glib: Add `NULL` debug assertion to `from_glib_full()` and others for GObjects](https://github.com/gtk-rs/gtk-rs-core/pull/953)
 * [Rename GStrPtr to GStringPtr](https://github.com/gtk-rs/gtk-rs-core/pull/950)
 * [properties: Update syntax for custom flags and other builder fields](https://github.com/gtk-rs/gtk-rs-core/pull/945)
 * [gio: implement FromIterator for ListStore](https://github.com/gtk-rs/gtk-rs-core/pull/954)
 * [properties: correctly type check value returned by the getter fn](https://github.com/gtk-rs/gtk-rs-core/pull/961)
 * [Use strcmp for GStringPtr comparisons](https://github.com/gtk-rs/gtk-rs-core/pull/955)
 * [Support `default = ...` in the properties macro](https://github.com/gtk-rs/gtk-rs-core/pull/958)
 * [macros: support overrides in the properties macro](https://github.com/gtk-rs/gtk-rs-core/pull/959)
 * [gio: make ListModel::iter() infallible](https://github.com/gtk-rs/gtk-rs-core/pull/962)
 * [Greatly improve `clone!` proc macro error output](https://github.com/gtk-rs/gtk-rs-core/pull/963)
 * [clippy cleanup](https://github.com/gtk-rs/gtk-rs-core/pull/964)
 * [Refactor properties macro, improve errors](https://github.com/gtk-rs/gtk-rs-core/pull/965)
 * [impl PropertyGet for T: `HasParamSpec`](https://github.com/gtk-rs/gtk-rs-core/pull/967)
 * [Improve properties macro docs](https://github.com/gtk-rs/gtk-rs-core/pull/969)
 * [glib: Implement `ValueArray` `Value` traits manually because of the custom paramspec](https://github.com/gtk-rs/gtk-rs-core/pull/973)
 * [add `ParamSpecEnumBuilder::default_value()`](https://github.com/gtk-rs/gtk-rs-core/pull/974)

[gtk3-rs](https://github.com/gtk-rs/gtk3-rs):

 * [Update link](https://github.com/gtk-rs/gtk3-rs/pull/783)
 * [Base Dockerfile on gtk-rs-core image](https://github.com/gtk-rs/gtk3-rs/pull/750)
 * [Move from `imp.instance()` to `imp.obj()`](https://github.com/gtk-rs/gtk3-rs/pull/784)
 * [widget: support `window_state_event` when subclassing](https://github.com/gtk-rs/gtk3-rs/pull/786)
 * [Skip init assertion for `gdk::set_allowed_backends`](https://github.com/gtk-rs/gtk3-rs/pull/791)
 * [gtk: implement `From<ResponseType>` for Value](https://github.com/gtk-rs/gtk3-rs/pull/794)
 * [examples: Fix compilation after `gio::SimpleAction` constructor took the state by value](https://github.com/gtk-rs/gtk3-rs/pull/797)
 * [examples: Adapt to glib-build-tools breaking change](https://github.com/gtk-rs/gtk3-rs/pull/798)
 * [Allow subclassing ToggleButton and MenuButton](https://github.com/gtk-rs/gtk3-rs/pull/804)
 * [Update wayland-client version to 0.30](https://github.com/gtk-rs/gtk3-rs/pull/801)

[gtk4-rs](https://github.com/gtk-rs/gtk4-rs):

 * [examples/glium: lookup libepoxy-0.dll first](https://github.com/gtk-rs/gtk4-rs/pull/1153)
 * [book: Migrate to `glib-build-tools`](https://github.com/gtk-rs/gtk4-rs/pull/1024)
 * [Base Dockerfile on gtk-rs-core image](https://github.com/gtk-rs/gtk4-rs/pull/1029)
 * [image: Rebuild once every week](https://github.com/gtk-rs/gtk4-rs/pull/1162)
 * [gtk: Generate new v4.10 APIs](https://github.com/gtk-rs/gtk4-rs/pull/1155)
 * [Move from `imp.instance()` to `imp.obj()`](https://github.com/gtk-rs/gtk4-rs/pull/1157)
 * [gtk: Add gnome_43 feature](https://github.com/gtk-rs/gtk4-rs/pull/1160)
 * [book: Use `Object::builder()` instead of `Object::new()`](https://github.com/gtk-rs/gtk4-rs/pull/1166)
 * [Add gdk4-win32](https://github.com/gtk-rs/gtk4-rs/pull/1103)
 * [Win32 fixes](https://github.com/gtk-rs/gtk4-rs/pull/1171)
 * [Fix latest clippy warnings](https://github.com/gtk-rs/gtk4-rs/pull/1172)
 * [book: Fix typo in xtask code](https://github.com/gtk-rs/gtk4-rs/pull/1173)
 * [gdk-win32: implement `Win32Display.add_filter()` (part 2)](https://github.com/gtk-rs/gtk4-rs/pull/1175)
 * [gdk-win32: implement `Win32Display.add_filter()` (part 1)](https://github.com/gtk-rs/gtk4-rs/pull/1174)
 * [Fixed a typo](https://github.com/gtk-rs/gtk4-rs/pull/1182)
 * [Release 0.5.2](https://github.com/gtk-rs/gtk4-rs/pull/1184)
 * [Fix clippy lints](https://github.com/gtk-rs/gtk4-rs/pull/1176)
 * [Skip init assertion for `gdk::set_allowed_backends`](https://github.com/gtk-rs/gtk4-rs/pull/1183)
 * [book: Fix typo](https://github.com/gtk-rs/gtk4-rs/pull/1190)
 * [Added Libxml, Librsvg, Gettext and Libadwaita demo](https://github.com/gtk-rs/gtk4-rs/pull/1178)
 * [use `Into<Value>` and `Into<Variant>` where possible](https://github.com/gtk-rs/gtk4-rs/pull/1194)
 * [book: Small windows instructions fix](https://github.com/gtk-rs/gtk4-rs/pull/1196)
 * [examples: Use NoneCast trait where possible](https://github.com/gtk-rs/gtk4-rs/pull/1206)
 * [macros: Allow using re-exports of gtk](https://github.com/gtk-rs/gtk4-rs/pull/1179)
 * [gsk: Export builders module](https://github.com/gtk-rs/gtk4-rs/pull/1186)
 * [gtk4: use `impl_offset()` for calculating template child offset](https://github.com/gtk-rs/gtk4-rs/pull/1192)
 * [gtk: Fix missing version guards](https://github.com/gtk-rs/gtk4-rs/pull/1195)
 * [Add a changelog file](https://github.com/gtk-rs/gtk4-rs/pull/1211)
 * [gtk: Cleanup template related functions](https://github.com/gtk-rs/gtk4-rs/pull/1212)
 * [Group imports](https://github.com/gtk-rs/gtk4-rs/pull/1214)
 * [Generate AlertDialog::choose](https://github.com/gtk-rs/gtk4-rs/pull/1210)
 * [Release 0.5.4](https://github.com/gtk-rs/gtk4-rs/pull/1217)
 * [Relax version requirement](https://github.com/gtk-rs/gtk4-rs/pull/1218)
 * [gtk: Subclass BuilderCScope for the BuilderRustScope](https://github.com/gtk-rs/gtk4-rs/pull/1215)
 * [Fix clippy warnings](https://github.com/gtk-rs/gtk4-rs/pull/1219)
 * [Fix compilation after `Stash` `PhantomData` usage in glib](https://github.com/gtk-rs/gtk4-rs/pull/1227)
 * [`install_action_async`: Use owned Variant in closure](https://github.com/gtk-rs/gtk4-rs/pull/1226)
 * [`file_chooser`: Fix `add_choice`](https://github.com/gtk-rs/gtk4-rs/pull/1234)
 * [Mark new dialog api as not nullable](https://github.com/gtk-rs/gtk4-rs/pull/1220)
 * [book: Link to "Rust Atomics and Lock"](https://github.com/gtk-rs/gtk4-rs/pull/1252)
 * [Add blueprint-compiler dependency into Dockerfile](https://github.com/gtk-rs/gtk4-rs/pull/1239)
 * [no need to move in the hello world exercise](https://github.com/gtk-rs/gtk4-rs/pull/1254)
 * [Book: make memory management conclusion clearer.](https://github.com/gtk-rs/gtk4-rs/pull/1255)
 * [Use wrapper macros where possible](https://github.com/gtk-rs/gtk4-rs/pull/1256)
 * [Various improvments](https://github.com/gtk-rs/gtk4-rs/pull/1258)
 * [Allocations improvements](https://github.com/gtk-rs/gtk4-rs/pull/1259)
 * [gtk: Make use of `Value::from_type_unchecked`](https://github.com/gtk-rs/gtk4-rs/pull/1264)
 * [book: warn about precedence over pkg-config-lite](https://github.com/gtk-rs/gtk4-rs/pull/1263)
 * [Recommend (with instructions) building with `gvsbuild`](https://github.com/gtk-rs/gtk4-rs/pull/1203)
 * [book: Simplify instructions on Windows](https://github.com/gtk-rs/gtk4-rs/pull/1265)
 * [Make use of IntoGStr/IntoStrV](https://github.com/gtk-rs/gtk4-rs/pull/1262)
 * [Enable introspection for gtk](https://github.com/gtk-rs/gtk4-rs/pull/1269)
 * [gtk4-macros: Add blueprint support](https://github.com/gtk-rs/gtk4-rs/pull/1238)
 * [Update for `glib::Boxed` `ToGlibPtr<*mut _>` trait impl addition](https://github.com/gtk-rs/gtk4-rs/pull/1270)
 * [book: remove `try_property`](https://github.com/gtk-rs/gtk4-rs/pull/1267)
 * [book: Move listings to feature 4_8](https://github.com/gtk-rs/gtk4-rs/pull/1272)
 * [book: fix panic in `list_widgets_4,5,6`](https://github.com/gtk-rs/gtk4-rs/pull/1273)
 * [Builder related fixes](https://github.com/gtk-rs/gtk4-rs/pull/1275)
 * [book: Rephrase a sentence](https://github.com/gtk-rs/gtk4-rs/pull/1279)
 * [Remove unneeded cfg(dox) condition](https://github.com/gtk-rs/gtk4-rs/pull/1282)
 * [book: Add alt text to images and videos](https://github.com/gtk-rs/gtk4-rs/pull/1287)
 * [Fix nightly clippy warnings](https://github.com/gtk-rs/gtk4-rs/pull/1283)
 * [Use glib::ExitStatus](https://github.com/gtk-rs/gtk4-rs/pull/1284)
 * [Update per Properties macro merge](https://github.com/gtk-rs/gtk4-rs/pull/1288)
 * [gtk-macros: Mention the failed to retrieve template child name](https://github.com/gtk-rs/gtk4-rs/pull/1290)
 * [Prepare for 0.6](https://github.com/gtk-rs/gtk4-rs/pull/1294)
 * [Implement HasParamSpec for Expression types](https://github.com/gtk-rs/gtk4-rs/pull/1295)
 * [Clippy cleanups](https://github.com/gtk-rs/gtk4-rs/pull/1296)
 * [book: Adapt to glib-build-tools breaking change](https://github.com/gtk-rs/gtk4-rs/pull/1277)

All this was possible thanks to the [gtk-rs/gir](https://github.com/gtk-rs/gir) project as well:

 * [Fix new clippy lints](https://github.com/gtk-rs/gir/pull/1393)
 * [nameutil: correct dll link name](https://github.com/gtk-rs/gir/pull/1394)
 * [Add `#[allow(clippy::should_implement_trait)]` if method is named `default`](https://github.com/gtk-rs/gir/pull/1395)
 * [Fix new clippy lint in generated abi and sys test files](https://github.com/gtk-rs/gir/pull/1398)
 * [analysis/special_functions: fix missing import](https://github.com/gtk-rs/gir/pull/1403)
 * [codegen: implement `From<T>` for Value for enums/flags](https://github.com/gtk-rs/gir/pull/1402)
 * [Fix up special functions in traits correctly](https://github.com/gtk-rs/gir/pull/1404)
 * [Fix incorrect 'missing from library' warning when generating in sys mode](https://github.com/gtk-rs/gir/pull/1405)
 * [Add init assertions to the enum/flags `From<T> for glib::Value` impls](https://github.com/gtk-rs/gir/pull/1406)
 * [codegen: silence deprecation warnings in impls for deprecated types/functions](https://github.com/gtk-rs/gir/pull/1408)
 * [analysis: handle C array pointer casts to void](https://github.com/gtk-rs/gir/pull/1407)
 * [fix the layout tests](https://github.com/gtk-rs/gir/pull/1409)
 * [codegen: Handle `_finish` functions not taking a GError inout param](https://github.com/gtk-rs/gir/pull/1397)
 * [Backport: codegen: Handle `_finish` functions not taking a GError inout param](https://github.com/gtk-rs/gir/pull/1411)
 * [analysis: Use the new move trait for in transfer-full params](https://github.com/gtk-rs/gir/pull/1384)
 * [analysis: Don't use IntoGlibPtr for `Vec<T>` parameters](https://github.com/gtk-rs/gir/pull/1412)
 * [analysis: Generate correct bounds when move is used for nullable types](https://github.com/gtk-rs/gir/pull/1413)
 * [analysis: Prefer using `glib::prelude::*`](https://github.com/gtk-rs/gir/pull/1415)
 * [codegen: Group imports by crate](https://github.com/gtk-rs/gir/pull/1416)
 * [Various cleanups](https://github.com/gtk-rs/gir/pull/1419)
 * [Fix generation without any shared libraries](https://github.com/gtk-rs/gir/pull/1410)
 * [Inline various enum/flags functions](https://github.com/gtk-rs/gir/pull/1421)
 * [Generate string constants as `&'static GStr` / `[u8]`](https://github.com/gtk-rs/gir/pull/1424)
 * [Generate static `to_str()` / `name()` functions with `GStr` instead of `str`](https://github.com/gtk-rs/gir/pull/1425)
 * [docs: Generate properties/signals docs](https://github.com/gtk-rs/gir/pull/1359)
 * [Handle user_data renaming](https://github.com/gtk-rs/gir/pull/1429)
 * [Optimize builders](https://github.com/gtk-rs/gir/pull/1430)
 * [Implement object builders around `glib::object::ObjectBuilder`](https://github.com/gtk-rs/gir/pull/1431)
 * [Fix missing check in case a type cannot be generated in builders](https://github.com/gtk-rs/gir/pull/1432)
 * [Add configuration for exhaustive enums](https://github.com/gtk-rs/gir/pull/1433)
 * [Fix new clippy warnings](https://github.com/gtk-rs/gir/pull/1435)
 * [codegen: Generate HasParamSpec for enums/flags](https://github.com/gtk-rs/gir/pull/1436)
 * [Use `Object::new()` instead of `Object::new_default()`](https://github.com/gtk-rs/gir/pull/1437)
 * [Generate less clippy warnings code](https://github.com/gtk-rs/gir/pull/1441)
 * [Reworked the book/tutorial](https://github.com/gtk-rs/gir/pull/1379)

Thanks to all of our contributors for their (awesome!) work on this release:

 * [@A6GibKm](https://github.com/A6GibKm)
 * [@AaronErhardt](https://github.com/AaronErhardt)
 * [@andy128k](https://github.com/andy128k)
 * [@aruiz](https://github.com/aruiz)
 * [@bilelmoussaoui](https://github.com/bilelmoussaoui)
 * [@cgwalters](https://github.com/cgwalters)
 * [@delight-aug](https://github.com/delight-aug)
 * [@elmarco](https://github.com/elmarco)
 * [@gdesmott](https://github.com/gdesmott)
 * [@GuillaumeGomez](https://github.com/GuillaumeGomez)
 * [@harshshredding](https://github.com/harshshredding)
 * [@Hofer-Julian](https://github.com/Hofer-Julian)
 * [@Jedsek](https://github.com/Jedsek)
 * [@jf2048](https://github.com/jf2048)
 * [@lucab](https://github.com/lucab)
 * [@luckylat](https://github.com/luckylat)
 * [@Megadash452](https://github.com/Megadash452)
 * [@mitchhentges](https://github.com/mitchhentges)
 * [@nacho](https://github.com/nacho)
 * [@nardoor](https://github.com/nardoor)
 * [@nt8r](https://github.com/nt8r)
 * [@pbor](https://github.com/pbor)
 * [@pentamassiv](https://github.com/pentamassiv)
 * [@ranfdev](https://github.com/ranfdev)
 * [@RealKC](https://github.com/RealKC)
 * [@sdroege](https://github.com/sdroege)
 * [@veera-sivarajan](https://github.com/veera-sivarajan)
 * [@vikram-kangotra](https://github.com/vikram-kangotra)
 * [@vlinkz](https://github.com/vlinkz)
 * [@wroyca](https://github.com/wroyca)
 * [@yuraiz](https://github.com/yuraiz)

---
layout: post
author: 
title: New release
categories: [front, crates]
date: 2022-10-18 12:00:00 +0000
---

It's now time for a new Gtk-rs release! As usual, a lot of improvements in a lot of places but subclasses in particular got a lot of updates. Time to dive in on some improvements. Enjoy!

### Update of minimum supported versions

The minimum supported version of the C library of various crates was updated to the versions available in Ubuntu 18.04:

 * GLib/GIO requires at least version 2.56 now and supports API up to version 2.74
 * gdk-pixbuf requires at least version 2.36.8 and supports API up to version 2.42
 * Pango requires at least version 1.40 and supports API up to version 1.52
 * GTK3 requires at least version 3.22.30 and supports API up to version 3.24.30
 * GTK4 requires at least version 4.0.0 and supports API up to version 4.8

The minimum supported Rust version by all crates was updated to version 1.63.

### More async support

A couple of futures helper functions were added with this release that should make futures usage easier in GTK applications.

 * Timeouts: `glib::future_with_timeout(Duration::from_millis(20), fut)` will resolve to the result of `fut` if it takes less than 20ms or otherwise to an error
 * Cancellation: `gio::CancellableFuture::new(fut, cancellable)` will resolve to the future unless the `cancellable` is cancelled before that

### GTK 4

Along with plenty of bugfixes and small improvements, the 0.5 release of gtk4-rs brings a couple of useful features

- `gsk::Transform`

Most of the C functions return `NULL` which represents an identity transformation. The Rust API nowadays returns an identity 
transformation instead of `None`

- `#[gtk::CompositeTemplate]` runtime validation

If used with `#[template(string=...)]` or `#[template(file=...)]` and the `xml_validation` feature is enabled, the XML content will be validated to ensure the child widgets that the code is trying to retrieve exists.

- `#[gtk::test]`

As GTK is single-threaded, using it in your tests is problematic as you can't initialize GTK multiple times. The new attribute macro helps with that as it runs the tests in a thread pool instead of in parallel.

Details at <https://gtk-rs.org/gtk4-rs/stable/latest/docs/gtk4_macros/attr.test.html>

- `WidgetClassSubclassExt::install_action_async`

In a lot of use cases, people used to do 

```rust
klass.install_action("some_group.action", None, |widget, _, _| {
    let ctx = glib::MainContext::default();
    ctx.spawn_local(clone!(@weak widget => async move {
        /// call some async function
        widget.async_function().await;
    }));
})
```

The new helper function allows you to write the code above like

```rust
klass.install_action_async("some_group.action", None, |widget, _, _| async move {
    /// call some async function
    widget.async_function().await;
})
```
Which helps avoiding the usage of the `clone` macro in some cases.

- GTK 4.8 API additions which can be enabled with `v4_8`
- Various fixes for the gdk-wayland & wayland-rs integration requiring wayland-client v0.30
- Plenty of new examples:
    * Gif Paintable for rendering Gifs
    * ColumnView for displaying data in a table-like format
    * Confetti animation
    * Rotation / Squeezer example

### `glib::Object` now has a more convenient object builder

In addition to dynamic objects construction, or e.g. when implementing new GObject subclasses, via `glib::Object::new()` and related API, there is also a more convenient object builder available.

```rust
let obj = glib::Object::builder::<MyObject>()
    .property("prop1", 123)
    .property("prop2", "test")
    .property("prop3", false)
    .build();
```

This allows for slightly more idiomatic Rust code.

### GIO objects completion closure doesn't need to be `Send` anymore

Asynchronous operations on GIO objects previously required the completion closure to be `Send`. This is not required anymore as the objects themselves are not `Send`-able either and the operation will be completed on the current thread via the thread's own main context. This should make usage of the asynchronous operations easier from GTK applications, where all UI objects are not `Send`.

As a result of this, also futures provided by GIO objects based on these asynchronous operations do not implement the `Send` trait anymore, which was wrong to begin with and caused panics at runtime in any situation where the future was actually used on different threads.

### Added support for `#[derive(glib::Variant)]` for enums

Starting with the previous release it was possible to derive the required trait implementations for (de)serializing Rust structs from/to `glib::Variant`s. With this release, support for enums is also added with different options for how the enum is going to be represented. Both C-style enums as well as enums with values in the variants are supported.

```rust
#[derive(Debug, PartialEq, Eq, glib::Variant)]
enum Foo {
    MyA,
    MyB(i32),
    MyC { some_int: u32, some_string: String }
}
let v = Foo::MyC { some_int: 1, some_string: String::from("bar") };
let var = v.to_variant();
assert_eq!(var.child_value(0).str(), Some("my-c"));
assert_eq!(var.get::<Foo>(), Some(v));
```

### No need to implement `Send` and `Sync` for subclasses anymore

In the past it was necessary to manually implement the `Send` and `Sync` traits via an `unsafe impl` block for the object types of GObject subclasses defined in Rust.

```rust
glib::wrapper! {
    pub struct MyObject(ObjectSubclass<imp::MyObject>);
}

unsafe impl Send for MyObject {}
unsafe impl Sync for MyObject {}
```

This is not necessary anymore and happens automatically if the implementation struct implements both traits. Like this it is also harder to accidentally implement the traits manually although the requirements of them are not fulfilled.

### Simpler subclassing for virtual methods

Previously when creating a GObject subclass, all virtual methods passed the implementation struct and the object itself as arguments, e.g.

```rust
pub trait ObjectImpl {
    fn constructed(&self, obj: &Self::Type);
}
```

This caused a lot of confusion and was also redundant. Instead, starting with this release only the implementation struct is passed by reference, e.g.

```rust
pub trait ObjectImpl {
    fn constructed(&self);
}
```

In most contexts the object itself was not actually needed, so this also simplifies the code. For the cases when the object is needed, it can be retrieved via the `obj()` method on the implementation struct

```rust
impl ObjectImpl for MyObject {
    fn constructed(&self) {
        self.parent_constructed();
        let obj = self.obj();
        obj.do_something();
    }
}
```

In a similar way it is also possible to retrieve the implementation struct from the instance via the `imp()` method. Both methods are cheap and only involve some pointer arithmetic.

Additionally, to make it easy to pass around the implementation struct into e.g. closures, there is now also a reference counted wrapper around it available (`ObjectImplRef`) that can be retrieved via `imp.to_owned()` or `imp.ref_counted()`, and a weak reference variant that can be retrieved via `imp.downgrade()`. Both are working in combination with the `glib::clone!` macro, too.

```rust
impl ObjectImpl for MyObject {
    fn constructed(&self) {
        self.parent_constructed();
        // for a strong reference
        self.button.connect_clicked(glib::clone!(@to-owned self as imp => move |button| {
            imp.do_something();
        }));

        // for a weak reference
        self.button.connect_clicked(glib::clone!(@weak self as imp => move |button| {
            imp.do_something();
        }));
    }
}
```

### Simpler subclassing for properties

When creating properties for GObject subclasses they need to be declared beforehand via a `glib::ParamSpec`. Previously these had simple `new()` functions with lots of parameters. These still exist but it's usually more convenient to use the builder pattern to construct them, especially as most of the parameters have sensible defaults.

```rust
// Now
let pspec = glib::ParamSpecUInt::builder("name")
    .maximum(1000)
    .construct()
    .build();

// Previously
let pspec = glib::ParamSpecUInt::new("name", None, None, 0, 1000, 0, glib::ParamFlags::READWRITE | glib::ParamFlags::CONSTRUCT);
```

In a similar spirit, signal definitions are available via a builder. This was available in the previous already but usage was simplified, for example by defaulting to no signal arguments and `()` signal return type.

```rust
// Now
let signal = glib::subclass::Signal::builder("closed").build();

// Before
let signal = glib::subclass::Signal::builder("closed", &[], glib::Type::UNIT).build();
```

### Removing `Result<>` wrapping in some functions returned values

`glib::Object::new()` returned a `Result` in previous versions. However, the only way how this could potentially fail was via a programming error: properties that don't exist were tried to be passed, or values of the wrong type were set for a property. By returning a `Result`, the impression was given that this can also fail in a normal way that is supposed to be handled by the caller.

As this is not the case, `glib::Object::new()` always panics if the arguments passed to it are invalid and no longer returns a `Result`.

In the same spirit, `object.try_set_property()`, `object.try_property()`, `object.try_emit()` and `object.try_connect()` do not exist any longer and only the panicking variants are left as the only way they could fail was if invalid arguments are provided.

### Transform functions for property bindings are now supported

Object property bindings allow for transform functions to be defined, which convert the property value to something else for the other object whenever it changes. Previously these were defined on the generic `glib::Value` type, but as the types are generally fixed and known in advance it is now possible to define them directly with the correct types.

```rust
source
    .bind_property("name", &target, "name")
    .flags(crate::BindingFlags::SYNC_CREATE)
    .transform_to(|_binding, value: &str| Some(format!("{} World", value)))
    .transform_from(|_binding, value: &str| Some(format!("{} World", value)))
    .build();
```

If the types don't match then this is considered a programming error and will panic at runtime.

The old way of defining transform functions via `glib::Value` is still available via new functions

```rust
source
    .bind_property("name", &target, "name")
    .flags(crate::BindingFlags::SYNC_CREATE)
    .transform_to_with_values(|_binding, value| {
        let value = value.get::<&str>().unwrap();
        Some(format!("{} World", value).to_value())
    })
    .transform_from_with_values(|_binding, value| {
        let value = value.get::<&str>().unwrap();
        Some(format!("{} World", value).to_value())
    })
    .build();
```

### Construct `SimpleAction` with `ActionEntryBuilder`

It is now possible to use `gio::ActionEntryBuilder` to construct a `gio::SimpleAction`, the advantage of using that is the `gio::ActionMap` type is passed as a first parameter to the `activate` callback and so avoids the usage of the `clone!` macro.

Before:
```rust
let action = gio::SimpleAction::new("some_action", None);
action.connect_activate(clone!(@weak some_obj => move |_, _| {
     // Do something
});
actions_group.add_action(&action);
```

After
```rust
let action = gio::ActionEntry::builder("some_action").activate(move |some_obj: &SomeType, _, _| {
    // Do something
}).build();
// It is safe to `unwrap` as we don't pass any parameter type that requires validation
actions_group.add_action_entries([action]).unwrap();
```

### Changes

For the interested ones, here is the list of the merged pull requests:

[gtk-rs-core](https://github.com/gtk-rs/gtk-rs-core):

 * [cairo: Implement `Send+Sync` for `ImageSurfaceData` and `ImageSurfaceDataOwned`](https://github.com/gtk-rs/gtk-rs-core/pull/470)
 * [cairo: Allow converting `ImageSurfaceDataOwned` back into an `ImageSurface`](https://github.com/gtk-rs/gtk-rs-core/pull/471)
 * [pango: add setters for Rectangle](https://github.com/gtk-rs/gtk-rs-core/pull/486)
 * [glib: use Result from std for logging macros](https://github.com/gtk-rs/gtk-rs-core/pull/487)
 * [gio: move task docs on the structs](https://github.com/gtk-rs/gtk-rs-core/pull/488)
 * [glib: Generate bindings for markup\_escape\_text](https://github.com/gtk-rs/gtk-rs-core/pull/490)
 * [glib: implement To/FromVariant for OS strings and paths](https://github.com/gtk-rs/gtk-rs-core/pull/483)
 * [glib-macros: Remove redundant allocations](https://github.com/gtk-rs/gtk-rs-core/pull/498)
 * [pangocairo: don't re-export types on prelude](https://github.com/gtk-rs/gtk-rs-core/pull/499)
 * [glib-macros: Smaller subclass macro](https://github.com/gtk-rs/gtk-rs-core/pull/500)
 * [glib: Add an object builder](https://github.com/gtk-rs/gtk-rs-core/pull/503)
 * [glib: Add more documentation on how to replace g\_signal\_connect\_object](https://github.com/gtk-rs/gtk-rs-core/pull/506)
 * [glib: Provide `ThreadGuard` and `thread\_id()` as public API](https://github.com/gtk-rs/gtk-rs-core/pull/504)
 * [Don't require `Send` closures for GIO-style async functions](https://github.com/gtk-rs/gtk-rs-core/pull/511)
 * [gio: Don't implement `Send` on `GioFuture` anymore](https://github.com/gtk-rs/gtk-rs-core/pull/512)
 * [gio: add Initable::with\_type](https://github.com/gtk-rs/gtk-rs-core/pull/515)
 * [gio: Use correct callback type for `File::copy\_async()`](https://github.com/gtk-rs/gtk-rs-core/pull/520)
 * [glib: Never pass `NULL` to `g\_log\_structured\_standard()`](https://github.com/gtk-rs/gtk-rs-core/pull/523)
 * [gio: Use correct callback type for `File::copy\_async()`](https://github.com/gtk-rs/gtk-rs-core/pull/522)
 * [impl `StaticType` and `{From,To}Value` for `gpointer`](https://github.com/gtk-rs/gtk-rs-core/pull/518)
 * [dynamic type function variants for Variants and Values](https://github.com/gtk-rs/gtk-rs-core/pull/519)
 * [gtask: fix memory leak when calling g\_task\_return\_value](https://github.com/gtk-rs/gtk-rs-core/pull/527)
 * [Handle empty slices correctly](https://github.com/gtk-rs/gtk-rs-core/pull/533)
 * [cairo: Allow writing arbitrary `Surface`s as `PNG`s](https://github.com/gtk-rs/gtk-rs-core/pull/543)
 * [glib: add trait `StaticTypeExt` with method `type\_ensure`](https://github.com/gtk-rs/gtk-rs-core/pull/544)
 * [Add missing pango attrs](https://github.com/gtk-rs/gtk-rs-core/pull/548)
 * [Remove remaining public fields](https://github.com/gtk-rs/gtk-rs-core/pull/549)
 * [glib: Add an `Object` specific value type checker](https://github.com/gtk-rs/gtk-rs-core/pull/555)
 * [glib: Fix handling of closures that provide a return value pointer that is initialized to `G_TYPE_INVALID`](https://github.com/gtk-rs/gtk-rs-core/pull/554)
 * [Fix cairo FFI types name](https://github.com/gtk-rs/gtk-rs-core/pull/552)
 * [glib: Don't use `from\_glib\_full()` for the individual items of an array for boxed inline types](https://github.com/gtk-rs/gtk-rs-core/pull/557)
 * [cairo: fix Glyph::index type](https://github.com/gtk-rs/gtk-rs-core/pull/559)
 * [translate: Pre-allocate Rust hashmap at correct size](https://github.com/gtk-rs/gtk-rs-core/pull/561)
 * [glib-macros: Pass a pointer for watched objects into closure macro](https://github.com/gtk-rs/gtk-rs-core/pull/563)
 * [Variant::from\_dict\_entry](https://github.com/gtk-rs/gtk-rs-core/pull/564)
 * [Smaller spec numeric definition](https://github.com/gtk-rs/gtk-rs-core/pull/568)
 * [pango: Add LayoutLine.runs()](https://github.com/gtk-rs/gtk-rs-core/pull/571)
 * [pango: Add missing getter for GlyphItemIter.](https://github.com/gtk-rs/gtk-rs-core/pull/572)
 * [define a corresponding `Builder` for each `ParamSpec`](https://github.com/gtk-rs/gtk-rs-core/pull/551)
 * [glib: impl AsRef&lt;Variant&gt; for Variant](https://github.com/gtk-rs/gtk-rs-core/pull/565)
 * [glib-macros: Add support for enums to glib::Variant ](https://github.com/gtk-rs/gtk-rs-core/pull/434)
 * [use Self where possible in wrapper macros](https://github.com/gtk-rs/gtk-rs-core/pull/575)
 * [remove problematic phantom in glib\_shared\_wrapper](https://github.com/gtk-rs/gtk-rs-core/pull/569)
 * [glib: Use "%s" instead of replacing % in log functions](https://github.com/gtk-rs/gtk-rs-core/pull/583)
 * [impl `ToValue`, `FromValue` for char](https://github.com/gtk-rs/gtk-rs-core/pull/579)
 * [glib: Correctly cast log messages to C char types](https://github.com/gtk-rs/gtk-rs-core/pull/584)
 * [glib: Automatically implement `Send + Sync` on object subclasses if their implementation struct implements those traits](https://github.com/gtk-rs/gtk-rs-core/pull/586)
 * [Use glib 2.71 for minimum v2\_72 pkg-config versions](https://github.com/gtk-rs/gtk-rs-core/pull/587)
 * [glib: Add function to wrap a future with a timeout](https://github.com/gtk-rs/gtk-rs-core/pull/528)
 * [glib: Allow using other error types and value type checkers for optional values](https://github.com/gtk-rs/gtk-rs-core/pull/588)
 * [glib: Only auto-impl `Send+Sync` for subclasses if the parent type does](https://github.com/gtk-rs/gtk-rs-core/pull/591)
 * [glib: Use the correct value type checker for optional types](https://github.com/gtk-rs/gtk-rs-core/pull/592)
 * [Add new classes from glib 2.72](https://github.com/gtk-rs/gtk-rs-core/pull/577)
 * [More gio::Cancellable methods](https://github.com/gtk-rs/gtk-rs-core/pull/589)
 * [glib: Allow borrowing a `ParamSpec` reference from a `Value`](https://github.com/gtk-rs/gtk-rs-core/pull/597)
 * [glib: Allow borrowing a `ParamSpec` reference from a `Value`](https://github.com/gtk-rs/gtk-rs-core/pull/599)
 * [Structured Logging](https://github.com/gtk-rs/gtk-rs-core/pull/595)
 * [gio: add AsyncInitable](https://github.com/gtk-rs/gtk-rs-core/pull/602)
 * [Use Send+Sync for more Boxed types](https://github.com/gtk-rs/gtk-rs-core/pull/601)
 * [glib: Disable log\_structured doc test before v2\_50](https://github.com/gtk-rs/gtk-rs-core/pull/604)
 * [glib: VariantTy tuple type iterator](https://github.com/gtk-rs/gtk-rs-core/pull/607)
 * [impl FromStr for VariantType](https://github.com/gtk-rs/gtk-rs-core/pull/605)
 * [glib: print and parse for Variant](https://github.com/gtk-rs/gtk-rs-core/pull/606)
 * [glib-macros: Port clone failure tests to trybuild2](https://github.com/gtk-rs/gtk-rs-core/pull/580)
 * [glib: Fix build with `v2_72` and require 2.72.0 now](https://github.com/gtk-rs/gtk-rs-core/pull/615)
 * [glib: Generate docs for BindingGroupBuilder](https://github.com/gtk-rs/gtk-rs-core/pull/618)
 * [More Cairo GValue fixes](https://github.com/gtk-rs/gtk-rs-core/pull/623)
 * [Implement ValueTypeOptional for BoxedInline and cairo types](https://github.com/gtk-rs/gtk-rs-core/pull/621)
 * [glib: implement ValueTypeOptional for Variant, VariantType, BoxedValue](https://github.com/gtk-rs/gtk-rs-core/pull/626)
 * [Add rustfmt.toml to allow some editors to auto-format the code on save](https://github.com/gtk-rs/gtk-rs-core/pull/627)
 * [Update minimum supported GLib version to 2.56](https://github.com/gtk-rs/gtk-rs-core/pull/631)
 * [glib: Fix `mkdtemp()` and `mkdtemp\_full()`](https://github.com/gtk-rs/gtk-rs-core/pull/630)
 * [glib/variant: add some more safe wrappers](https://github.com/gtk-rs/gtk-rs-core/pull/632)
 * [glib: Remove ending NUL when converting Variant to OsString.](https://github.com/gtk-rs/gtk-rs-core/pull/625)
 * [error: add `matches` method](https://github.com/gtk-rs/gtk-rs-core/pull/633)
 * [Fix Windows build](https://github.com/gtk-rs/gtk-rs-core/pull/634)
 * [glib: Remove SendUnique and SendUniqueCell](https://github.com/gtk-rs/gtk-rs-core/pull/635)
 * [glib: Add new `ObjectImplRef` and `ObjectImplWeakRef` types](https://github.com/gtk-rs/gtk-rs-core/pull/636)
 * [gdk\_pixbuf: opt-in for gi-docgen](https://github.com/gtk-rs/gtk-rs-core/pull/639)
 * [remove extend\_from\_slice position subtraction, add test](https://github.com/gtk-rs/gtk-rs-core/pull/642)
 * [gdk\_pixbuf: Improve `Pixbuf::pixels` documentation](https://github.com/gtk-rs/gtk-rs-core/pull/629)
 * [glib: Remove redundant null-checks before `g\_free`](https://github.com/gtk-rs/gtk-rs-core/pull/647)
 * [Remove more redundant null checks](https://github.com/gtk-rs/gtk-rs-core/pull/648)
 * [glib: Don't serialize 0 value flags as variants](https://github.com/gtk-rs/gtk-rs-core/pull/624)
 * [glib: Add bindings for GSignalGroup](https://github.com/gtk-rs/gtk-rs-core/pull/644)
 * [gio: Add local variant for connect\_cancelled](https://github.com/gtk-rs/gtk-rs-core/pull/650)
 * [glib: WatchedObject improvements](https://github.com/gtk-rs/gtk-rs-core/pull/651)
 * [glib-macros: Remove boxed\_nullable and shared\_boxed\_nullable attribute for glib::Boxed](https://github.com/gtk-rs/gtk-rs-core/pull/653)
 * [glib: Add getter for `glib::Error` domain quark](https://github.com/gtk-rs/gtk-rs-core/pull/655)
 * [Set properties improvements](https://github.com/gtk-rs/gtk-rs-core/pull/660)
 * [impl fallible IntoIterator for ListModel,ListStore](https://github.com/gtk-rs/gtk-rs-core/pull/668)
 * [cairo+gio+glib: Add safety docs for low hanging fruits](https://github.com/gtk-rs/gtk-rs-core/pull/671)
 * [ glib: Add WeakRefNotify (v2)](https://github.com/gtk-rs/gtk-rs-core/pull/666)
 * [Move `gio::compile\_resources` to its own crate](https://github.com/gtk-rs/gtk-rs-core/pull/670)
 * [Add IntoGlibPtr trait](https://github.com/gtk-rs/gtk-rs-core/pull/673)
 * [glib: Use `ptr::NonNull` for `VariantType` pointer storage](https://github.com/gtk-rs/gtk-rs-core/pull/674)
 * [cairo: Add missing User Fonts](https://github.com/gtk-rs/gtk-rs-core/pull/672)
 * [glib/gio: Implement `FusedFuture` / `FusedStream` in some places](https://github.com/gtk-rs/gtk-rs-core/pull/677)
 * [Port Dockerfile to fedora rawhide and use system deps from git](https://github.com/gtk-rs/gtk-rs-core/pull/676)
 * [Implement `FusedIterator` for various custom iterators](https://github.com/gtk-rs/gtk-rs-core/pull/678)
 * [cairo: Fix user font callbacks.](https://github.com/gtk-rs/gtk-rs-core/pull/679)
 * [Add some more tests for various custom `Iterator` impls](https://github.com/gtk-rs/gtk-rs-core/pull/680)
 * [Don't build gdk-pixbuf tests in the docker image](https://github.com/gtk-rs/gtk-rs-core/pull/682)
 * [gio: add AsyncInitable subclassing support](https://github.com/gtk-rs/gtk-rs-core/pull/654)
 * [gio: Use guard objects for `Application::hold()` and `mark\_busy()`](https://github.com/gtk-rs/gtk-rs-core/pull/685)
 * [cairo: Add missing `cairo\_surface\_get\_content`](https://github.com/gtk-rs/gtk-rs-core/pull/686)
 * [cairo: Add new for TextCluster/TextExtents and add setter for TextCluster](https://github.com/gtk-rs/gtk-rs-core/pull/689)
 * [cairo: Add setter for Glyph.](https://github.com/gtk-rs/gtk-rs-core/pull/690)
 * [cairo: add some 1.18 features](https://github.com/gtk-rs/gtk-rs-core/pull/692)
 * [cairo: Use freetype-sys instead of freetype.](https://github.com/gtk-rs/gtk-rs-core/pull/694)
 * [Fix GBindingGroup bindings](https://github.com/gtk-rs/gtk-rs-core/pull/665)
 * [Add more tests for Binding/BindingGroup](https://github.com/gtk-rs/gtk-rs-core/pull/701)
 * [glib: add missing emit\_by\_name methods](https://github.com/gtk-rs/gtk-rs-core/pull/702)
 * [Use RefCell::take() when possible](https://github.com/gtk-rs/gtk-rs-core/pull/704)
 * [SocketAddressEnumerator: `next` return value should be nullable](https://github.com/gtk-rs/gtk-rs-core/pull/705)
 * [translate.rs: free the container memory also when the container is empty](https://github.com/gtk-rs/gtk-rs-core/pull/709)
 * [gstring: implement AsRef&lt;Path&gt; for GString and GStr](https://github.com/gtk-rs/gtk-rs-core/pull/710)
 * [ProcessLauncher: `close` method should be available on unix only](https://github.com/gtk-rs/gtk-rs-core/pull/707)
 * [Remove is\_windows\_utf8](https://github.com/gtk-rs/gtk-rs-core/pull/643)
 * [Fix off-by-one in GString::from (and missing null terminator in a test)](https://github.com/gtk-rs/gtk-rs-core/pull/720)
 * [gio: Update serial\_test dependency to 0.8](https://github.com/gtk-rs/gtk-rs-core/pull/722)
 * [Add is\_empty for List and SList](https://github.com/gtk-rs/gtk-rs-core/pull/725)
 * [glib: Fix `ParamSpec::name()` return value lifetime](https://github.com/gtk-rs/gtk-rs-core/pull/728)
 * [glib: fix ParamSpec with null blurb and nick](https://github.com/gtk-rs/gtk-rs-core/pull/726)
 * [pango: Mark parameters to `extents\_to\_pixels()` as mutable](https://github.com/gtk-rs/gtk-rs-core/pull/730)
 * [add set\_glyph to GlyphInfo](https://github.com/gtk-rs/gtk-rs-core/pull/736)
 * [fix glyph string methods that don't need to be &mut](https://github.com/gtk-rs/gtk-rs-core/pull/737)
 * [glib: add doc alias for g\_type\_class\_ref](https://github.com/gtk-rs/gtk-rs-core/pull/738)
 * [glib: bind iconv functions](https://github.com/gtk-rs/gtk-rs-core/pull/708)
 * [cairo: Update to freetype 0.31](https://github.com/gtk-rs/gtk-rs-core/pull/741)
 * [glib: Add flag setters to ParamSpec builders](https://github.com/gtk-rs/gtk-rs-core/pull/735)
 * [gio: Manually implement ActionEntry](https://github.com/gtk-rs/gtk-rs-core/pull/743)
 * [as\_ptr() and as\_mut\_ptr() accessors are safe](https://github.com/gtk-rs/gtk-rs-core/pull/744)
 * [cairo: Don't leak user data if setting it failed](https://github.com/gtk-rs/gtk-rs-core/pull/745)
 * [glib: Simplify SignalBuilder constructor](https://github.com/gtk-rs/gtk-rs-core/pull/734)
 * [glib: Allow passing `SignalType`s and plain arrays to the signal builder for the types](https://github.com/gtk-rs/gtk-rs-core/pull/748)
 * [glib: Variant wrapper types for handles, object paths and signatures](https://github.com/gtk-rs/gtk-rs-core/pull/749)
 * [Add `#\[must\_use\]` to guard objects](https://github.com/gtk-rs/gtk-rs-core/pull/752)
 * [glib/object: add track\_caller annotation in a few places](https://github.com/gtk-rs/gtk-rs-core/pull/754)
 * [glib: Remove unneeded and wrong `upcast()` from `BoxedAnyObject` docs example](https://github.com/gtk-rs/gtk-rs-core/pull/758)
 * [Don't checkout submodules by default](https://github.com/gtk-rs/gtk-rs-core/pull/760)
 * [glib: Various paramspec builder API improvements](https://github.com/gtk-rs/gtk-rs-core/pull/761)
 * [glib/gio: Replace various type parameters with `impl trait`](https://github.com/gtk-rs/gtk-rs-core/pull/762)
 * [glib/types: use rustc-hash for HashMap](https://github.com/gtk-rs/gtk-rs-core/pull/755)
 * [glib/subclass/types: use BTreeMap instead of HashMap](https://github.com/gtk-rs/gtk-rs-core/pull/764)
 * [gio: make Task::cancellable return Option](https://github.com/gtk-rs/gtk-rs-core/pull/767)
 * [Implement Borrow on object types](https://github.com/gtk-rs/gtk-rs-core/pull/713)
 * [glib: Reduce number of allocations when writing non-structured logs via the GlibLogger](https://github.com/gtk-rs/gtk-rs-core/pull/770)
 * [gio: `CancellableFuture` ergonomic for cancelling tasks](https://github.com/gtk-rs/gtk-rs-core/pull/772)
 * [glib: Don't allow passing a construct(-only) property twice during object construction](https://github.com/gtk-rs/gtk-rs-core/pull/774)
 * [glib: Panic in Object::new() and related functions and add try\_new()](https://github.com/gtk-rs/gtk-rs-core/pull/771)
 * [Implement more FFI translation traits for shared types](https://github.com/gtk-rs/gtk-rs-core/pull/756)
 * [cairo: Use AsRef&lt;T&gt; for custom subclassing types](https://github.com/gtk-rs/gtk-rs-core/pull/786)
 * [glib/BindingBuilder: add concrete type based transform setters](https://github.com/gtk-rs/gtk-rs-core/pull/782)
 * [pango: Manually implement GlyphItemIter and AttrIterator with lifetimes](https://github.com/gtk-rs/gtk-rs-core/pull/784)
 * [Pango odds and ends](https://github.com/gtk-rs/gtk-rs-core/pull/785)
 * [Change \*Impl trait methods to only take &self and not Self::Type in addition](https://github.com/gtk-rs/gtk-rs-core/pull/783)
 * [glib: Improve assertion message when number of arguments in `glib::closure!` are not matching](https://github.com/gtk-rs/gtk-rs-core/pull/787)
 * [glib: Add `IntoGlibPtr` as supertrait for `ObjectType` / `IsA` and remove redundant `'static` requirement from `IsA`](https://github.com/gtk-rs/gtk-rs-core/pull/791)
 * [glib: Some `IsA` trait polishing](https://github.com/gtk-rs/gtk-rs-core/pull/793)
 * [glib: Implement `Send+Sync` for `BorrowedObject` / `ObjectImplRef` / `ObjectImplWeakRef`](https://github.com/gtk-rs/gtk-rs-core/pull/794)
 * [Expose some fields of GDBusNodeInfo](https://github.com/gtk-rs/gtk-rs-core/pull/780)
 * [pangocairo: Trust upstream nullable annotations for return values](https://github.com/gtk-rs/gtk-rs-core/pull/795)
 * [Add information about pangocairo::FontMap generation and fix some methods](https://github.com/gtk-rs/gtk-rs-core/pull/796)
 * [pango: Trust upstream nullable annotations for return values](https://github.com/gtk-rs/gtk-rs-core/pull/797)

[gtk3-rs](https://github.com/gtk-rs/gtk3-rs):

 * [drop problematic include & add missing symlinks](https://github.com/gtk-rs/gtk3-rs/pull/707)
 * [Drop cursed include and add missing links](https://github.com/gtk-rs/gtk3-rs/pull/706)
 * [Fix `gdkwayland` pkg name in README.md snippets](https://github.com/gtk-rs/gtk3-rs/pull/696)
 * [gtk/{Text,Tree}Iter: derive Debug](https://github.com/gtk-rs/gtk3-rs/pull/714)
 * [Replace `Foo::from\_instance(foo)` with `foo.imp()`](https://github.com/gtk-rs/gtk3-rs/pull/715)
 * [gdk-wayland: re-export ffi](https://github.com/gtk-rs/gtk3-rs/pull/720)
 * [gtk: Use `u32` as underlying type for the `stock-size` property of `CellRendererPixbuf`](https://github.com/gtk-rs/gtk3-rs/pull/722)
 * [gdk: Add constructor for `gdk::Geometry`](https://github.com/gtk-rs/gtk3-rs/pull/721)
 * [gtk: Set gtk-rs as initialized after the original `GtkApplication::startup` has returned](https://github.com/gtk-rs/gtk3-rs/pull/723)
 * [Don't require `Send` closures for GIO-style async functions](https://github.com/gtk-rs/gtk3-rs/pull/725)
 * [Make various newly added 3.24 API conditionally available](https://github.com/gtk-rs/gtk3-rs/pull/728)
 * [gtk: Add `Atk.Role` to `manual` to generate some more bindings](https://github.com/gtk-rs/gtk3-rs/pull/731)
 * [Handle empty slices correctly](https://github.com/gtk-rs/gtk3-rs/pull/732)
 * [gtk3-macros: Add doc links to glib/gtk items](https://github.com/gtk-rs/gtk3-rs/pull/736)
 * [gdk: Fix per phantom field removal](https://github.com/gtk-rs/gtk3-rs/pull/738)
 * [Add rustfmt.toml to allow some editors to auto-format the code on save](https://github.com/gtk-rs/gtk3-rs/pull/740)
 * [subclass support for GtkEntry](https://github.com/gtk-rs/gtk3-rs/pull/744)
 * [Fix link to docs of gdkwayland crate](https://github.com/gtk-rs/gtk3-rs/pull/748)
 * [examples: Migrate to `glib-build-tools`](https://github.com/gtk-rs/gtk3-rs/pull/749)
 * [Add binding for gtk\_file\_chooser\_add\_choice()](https://github.com/gtk-rs/gtk3-rs/pull/760)
 * [Add binding for Gtk.FileFilterInfo](https://github.com/gtk-rs/gtk3-rs/pull/757)
 * [gtk: Add an `unsafe-assume-initialized` feature](https://github.com/gtk-rs/gtk3-rs/pull/762)
 * [gdk: Fix binding for `gdk\_event\_get\_state`](https://github.com/gtk-rs/gtk3-rs/pull/769)
 * [Don't checkout submodules by default](https://github.com/gtk-rs/gtk3-rs/pull/770)
 * [Update for glib::Object::new() API changes](https://github.com/gtk-rs/gtk3-rs/pull/776)
 * [Change \*Impl trait methods to only take &self and not Self::Type in addition](https://github.com/gtk-rs/gtk3-rs/pull/777)

[gtk4-rs](https://github.com/gtk-rs/gtk4-rs):

 * [Add example of a Rotation Bin widget](https://github.com/gtk-rs/gtk4-rs/pull/740)
 * [gtk4/{Text,Tree}Iter: derive Debug ](https://github.com/gtk-rs/gtk4-rs/pull/824)
 * [gtk: fix TreeView subclassing support](https://github.com/gtk-rs/gtk4-rs/pull/825)
 * [book: Remove all mentions of meson and flatpak](https://github.com/gtk-rs/gtk4-rs/pull/829)
 * [Replace `Foo::from\_instance(foo)` with `foo.imp()`](https://github.com/gtk-rs/gtk4-rs/pull/830)
 * [gtk: Set gtk-rs as initialized after the original `GtkApplication::startup` has returned](https://github.com/gtk-rs/gtk4-rs/pull/833)
 * [book: Use closure to connect signal](https://github.com/gtk-rs/gtk4-rs/pull/831)
 * [gdk: implement conversions for Rectangle](https://github.com/gtk-rs/gtk4-rs/pull/837)
 * [make use of impl T wherever possible](https://github.com/gtk-rs/gtk4-rs/pull/839)
 * [gtk: mark some of TextIter methods as nullable](https://github.com/gtk-rs/gtk4-rs/pull/840)
 * [book: Introduce template callbacks](https://github.com/gtk-rs/gtk4-rs/pull/835)
 * [gtk: mark Snapshot::to\_(node\|paintable) as nullable](https://github.com/gtk-rs/gtk4-rs/pull/849)
 * [Don't require Send closures for GIO-style async functions](https://github.com/gtk-rs/gtk4-rs/pull/850)
 * [Remove unnecessary `Send` bounds from GIO-style async functions](https://github.com/gtk-rs/gtk4-rs/pull/851)
 * [Trust return value nullability again for gsk](https://github.com/gtk-rs/gtk4-rs/pull/855)
 * [Fix library name for epoxy on Windows.](https://github.com/gtk-rs/gtk4-rs/pull/869)
 * [image: build on PR as well](https://github.com/gtk-rs/gtk4-rs/pull/867)
 * [Handle empty slices correctly](https://github.com/gtk-rs/gtk4-rs/pull/871)
 * [Disable broken builders/default implementations](https://github.com/gtk-rs/gtk4-rs/pull/899)
 * [gdk: Fix compilation after `cairo::Rectangle` API changes](https://github.com/gtk-rs/gtk4-rs/pull/931)
 * [gtk: Pass an object pointer into rust builder closures instead of weak ref](https://github.com/gtk-rs/gtk4-rs/pull/935)
 * [gtk4-macros: Use relative doc links for glib/gtk items](https://github.com/gtk-rs/gtk4-rs/pull/942)
 * [gtk4: CompositeTemplate set\_template fixes](https://github.com/gtk-rs/gtk4-rs/pull/944)
 * [gtk4: Add runtime type checks for template children](https://github.com/gtk-rs/gtk4-rs/pull/943)
 * [gtk4: Add convenience traits for binding template callbacks to classes](https://github.com/gtk-rs/gtk4-rs/pull/945)
 * [gdk: Fix post removal of PhantomData for BoxedInline](https://github.com/gtk-rs/gtk4-rs/pull/949)
 * [Add CODEOWNERS file](https://github.com/gtk-rs/gtk4-rs/pull/941)
 * [gtk4-macros: Improve error reporting, add failure tests](https://github.com/gtk-rs/gtk4-rs/pull/956)
 * [gtk4-macros: Allow async template callbacks](https://github.com/gtk-rs/gtk4-rs/pull/959)
 * [More checks for composite template children](https://github.com/gtk-rs/gtk4-rs/pull/961)
 * [Add is method to fundamental types](https://github.com/gtk-rs/gtk4-rs/pull/964)
 * [gtk: Add ParamSpecExpressionBuilder](https://github.com/gtk-rs/gtk4-rs/pull/969)
 * [examples: Add new widget that squeezes its child](https://github.com/gtk-rs/gtk4-rs/pull/680)
 * [gtk4-macros: Fix compile error on rust 1.56](https://github.com/gtk-rs/gtk4-rs/pull/977)
 * [gdk: Implement Value traits for Key](https://github.com/gtk-rs/gtk4-rs/pull/973)
 * [gdk4-wayland: Use wayland\_client::Display instead of a display proxy](https://github.com/gtk-rs/gtk4-rs/pull/976)
 * [book: Bring todo closer to libadwaita example](https://github.com/gtk-rs/gtk4-rs/pull/979)
 * [book: Add check in todo whether entry is empty](https://github.com/gtk-rs/gtk4-rs/pull/983)
 * [Add rustfmt.toml to allow some editors to auto-format the code on save](https://github.com/gtk-rs/gtk4-rs/pull/991)
 * [book: Rename (TodoRow, TodoObject) -&gt; (TaskRow, TaskObject)](https://github.com/gtk-rs/gtk4-rs/pull/996)
 * [gtk4-macros: Fix re-entrancy panic in async template callback test](https://github.com/gtk-rs/gtk4-rs/pull/1001)
 * [book: Link snippets to code examples on github](https://github.com/gtk-rs/gtk4-rs/pull/1003)
 * [book: Replace git version of the book with link to stable](https://github.com/gtk-rs/gtk4-rs/pull/1007)
 * [book: Refactor `current\_tasks`](https://github.com/gtk-rs/gtk4-rs/pull/1012)
 * [book: Rename `list\_view`](https://github.com/gtk-rs/gtk4-rs/pull/1013)
 * [book: Add nix to linux installation guide](https://github.com/gtk-rs/gtk4-rs/pull/968)
 * [book: fix links](https://github.com/gtk-rs/gtk4-rs/pull/1017)
 * [fix vendoring by removing include from gdk4/Cargo.toml](https://github.com/gtk-rs/gtk4-rs/pull/1021)
 * [book: Improve `TaskData` methods](https://github.com/gtk-rs/gtk4-rs/pull/1022)
 * [Removed extra bracket in 5.1](https://github.com/gtk-rs/gtk4-rs/pull/1026)
 * [\[🐛 Fix\] Fix app variable name in build\_ui function](https://github.com/gtk-rs/gtk4-rs/pull/1027)
 * [Implement FusedIterator for custom iterators](https://github.com/gtk-rs/gtk4-rs/pull/1030)
 * [Migrate state storing back to json](https://github.com/gtk-rs/gtk4-rs/pull/1028)
 * [book: Use `extend\_from\_slice` instead of `splice`](https://github.com/gtk-rs/gtk4-rs/pull/1034)
 * [gtk: Add NativeDialog::run\_async](https://github.com/gtk-rs/gtk4-rs/pull/998)
 * [Rename app-id](https://github.com/gtk-rs/gtk4-rs/pull/1040)
 * [book: Use xtask to install data](https://github.com/gtk-rs/gtk4-rs/pull/1035)
 * [book: Fix application window comment](https://github.com/gtk-rs/gtk4-rs/pull/1009)
 * [book: Update xtask](https://github.com/gtk-rs/gtk4-rs/pull/1044)
 * [book: Rename variables in preparation of upcoming chapter](https://github.com/gtk-rs/gtk4-rs/pull/1002)
 * [gtk4: Use `Key` in `accelerator\_` function bindings](https://github.com/gtk-rs/gtk4-rs/pull/1047)
 * [gdk4-x11: Fix broken initialized test to be no-op; fix argument for `X11Display::set\_program\_class`](https://github.com/gtk-rs/gtk4-rs/pull/1048)
 * [gtk4: Mark `gtk::GestureClick::unpaired-release` sequence parameter as nullable](https://github.com/gtk-rs/gtk4-rs/pull/1050)
 * [book: Fixes link in list widgets chapter](https://github.com/gtk-rs/gtk4-rs/pull/1059)
 * [Book: Improved grammar and readability](https://github.com/gtk-rs/gtk4-rs/pull/1060)
 * [book: Stop using hyphens in app ids](https://github.com/gtk-rs/gtk4-rs/pull/1061)
 * [book: Update appid in book](https://github.com/gtk-rs/gtk4-rs/pull/1065)
 * [book: Add Todo App 6 using Adwaita](https://github.com/gtk-rs/gtk4-rs/pull/1008)
 * [book: Use param spec builders](https://github.com/gtk-rs/gtk4-rs/pull/1070)
 * [book: Rename `current\_tasks` to `tasks`](https://github.com/gtk-rs/gtk4-rs/pull/1071)
 * [dialog: Use present instead of show in run manuals](https://github.com/gtk-rs/gtk4-rs/pull/1072)
 * [book: Add Todo5](https://github.com/gtk-rs/gtk4-rs/pull/1073)
 * [book: Add chapter about the Adwaita library](https://github.com/gtk-rs/gtk4-rs/pull/1074)
 * [gtk4: Add an `unsafe-assume-initialized` feature](https://github.com/gtk-rs/gtk4-rs/pull/1069)
 * [book: Add Todo5](https://github.com/gtk-rs/gtk4-rs/pull/1077)
 * [book: Remove AdwWindowTitle](https://github.com/gtk-rs/gtk4-rs/pull/1082)
 * [book: Add tooltips to main menu](https://github.com/gtk-rs/gtk4-rs/pull/1083)
 * [Update per glib::SignalBuilder changes](https://github.com/gtk-rs/gtk4-rs/pull/1084)
 * [book: Replace usage of gtk preludes with adwaita ones](https://github.com/gtk-rs/gtk4-rs/pull/1081)
 * [TextNode::new doesn't need to take glyphstring as mut](https://github.com/gtk-rs/gtk4-rs/pull/1085)
 * [book: Remove unused `menu\_button` reference](https://github.com/gtk-rs/gtk4-rs/pull/1088)
 * [gtk: Implement ParamSpecBuilderExt for ParamSpecExpression](https://github.com/gtk-rs/gtk4-rs/pull/1093)
 * [gtk: Make xml validation optional](https://github.com/gtk-rs/gtk4-rs/pull/1094)
 * [gtk: Add a WidgetClassSubclassExt::install\_action\_async](https://github.com/gtk-rs/gtk4-rs/pull/1098)
 * [book: Address Alexander's review comments](https://github.com/gtk-rs/gtk4-rs/pull/1099)
 * [book: Remove frame style from TodoTaskRow](https://github.com/gtk-rs/gtk4-rs/pull/1101)
 * [examples: Use ParamSpec builder pattern](https://github.com/gtk-rs/gtk4-rs/pull/1117)
 * [gtk: Simplify types passed to ClosureExpression](https://github.com/gtk-rs/gtk4-rs/pull/1118)
 * [book: Fix wrong references](https://github.com/gtk-rs/gtk4-rs/pull/1119)
 * [Add gtk::ColumnView "data grid" example](https://github.com/gtk-rs/gtk4-rs/pull/1111)
 * [Add confetti\_snapshot\_animation example](https://github.com/gtk-rs/gtk4-rs/pull/1020)
 * [Fixes #1114 by passing a null ptr when `colors` is empty](https://github.com/gtk-rs/gtk4-rs/pull/1120)
 * [book: Remove `remove-current-collection` action](https://github.com/gtk-rs/gtk4-rs/pull/1121)
 * [book: Second libadwaita section](https://github.com/gtk-rs/gtk4-rs/pull/1112)
 * [Remove fold threshold policy](https://github.com/gtk-rs/gtk4-rs/pull/1129)
 * [Update for glib::Object::new() API changes](https://github.com/gtk-rs/gtk4-rs/pull/1136)
 * [book: use `cargo add` when adding dependencies](https://github.com/gtk-rs/gtk4-rs/pull/1134)
 * [book: Fix and complete recent `cargo add` changes](https://github.com/gtk-rs/gtk4-rs/pull/1138)
 * [gsk: Add a ColorStopBuilder](https://github.com/gtk-rs/gtk4-rs/pull/1139)
 * [gtk: Make use of the new move configuration](https://github.com/gtk-rs/gtk4-rs/pull/1097)
 * [Update for new trait impls in gtk-rs-core](https://github.com/gtk-rs/gtk4-rs/pull/1137)
 * [gsk: Handle nullable Transform](https://github.com/gtk-rs/gtk4-rs/pull/1140)
 * [examples: Add a GIF paintable](https://github.com/gtk-rs/gtk4-rs/pull/1131)
 * [subclass: Drop Self::Type usage](https://github.com/gtk-rs/gtk4-rs/pull/1141)
 * [gdk4-wayland: Update wayland crate to 0.30](https://github.com/gtk-rs/gtk4-rs/pull/1146)
 * [examples: Update to glium 0.32](https://github.com/gtk-rs/gtk4-rs/pull/1144)
 * [gtk/gdk: mark Snapshot as not final and implement necessary traits](https://github.com/gtk-rs/gtk4-rs/pull/803)
 * [gtk: Manually implement FileChooser::set\_current\_folder](https://github.com/gtk-rs/gtk4-rs/pull/1147)
 * [Fix dox features](https://github.com/gtk-rs/gtk4-rs/pull/1151)

All this was possible thanks to the [gtk-rs/gir](https://github.com/gtk-rs/gir) project as well:

 * [sys: run ABI tests only under linux](https://github.com/gtk-rs/gir/pull/1311)
 * [Don't require `Send` closures for GIO-style async functions](https://github.com/gtk-rs/gir/pull/1312)
 * [Mention Default impls for objects with Builders](https://github.com/gtk-rs/gir/pull/1317)
 * [docs: Handle gi-docgen namespaces when looking for types to link](https://github.com/gtk-rs/gir/pull/1318)
 * [Parse and codegen `doc-deprecated` for enum members](https://github.com/gtk-rs/gir/pull/1320)
 * [book: Pass output path to gir in console examples](https://github.com/gtk-rs/gir/pull/1321)
 * [add GitHub urls to book](https://github.com/gtk-rs/gir/pull/1323)
 * [Add "default\_value" parameter](https://github.com/gtk-rs/gir/pull/1325)
 * [If an async function is marked unsafe, mark unsafe also the \_future variant](https://github.com/gtk-rs/gir/pull/1328)
 * [codegen: Use GString::as\_str instead of `Option<GString>::as_deref`](https://github.com/gtk-rs/gir/pull/1327)
 * [docs: Never use ExtManual trait with GObject](https://github.com/gtk-rs/gir/pull/1332)
 * [suppress insertion of assertion for result of throw function to return void](https://github.com/gtk-rs/gir/pull/1333)
 * [trampoline\_from\_glib: Replace broken deref with as\_ref](https://github.com/gtk-rs/gir/pull/1335)
 * [Fix error message for constant parsing](https://github.com/gtk-rs/gir/pull/1342)
 * [Add generate\_doc](https://github.com/gtk-rs/gir/pull/1341)
 * [Remove `SendUnique` code generation](https://github.com/gtk-rs/gir/pull/1344)
 * [Fix finding the deps for the sys crate](https://github.com/gtk-rs/gir/pull/1352)
 * [Fix UB and clippy::let-and-return in function out variables handling](https://github.com/gtk-rs/gir/pull/1357)
 * [docs: don't generate implements links for fundamental types](https://github.com/gtk-rs/gir/pull/1358)
 * [add non unix fallback for creating PathBuf from `Vec<u8>`](https://github.com/gtk-rs/gir/pull/1361)
 * [Remove is\_windows\_utf8 function](https://github.com/gtk-rs/gir/pull/1345)
 * [Fix `BoolError` import when being used from glib directly](https://github.com/gtk-rs/gir/pull/1364)
 * [Remove leading '&gt;' from tutorial](https://github.com/gtk-rs/gir/pull/1365)
 * [book: Unbreak syntax highlighting on `console` codeblocks, address concerns consistently](https://github.com/gtk-rs/gir/pull/1366)
 * [analysis: Call extra to\_glib functions in array len transformation](https://github.com/gtk-rs/gir/pull/1367)
 * [don't assume GObject.Object is always available](https://github.com/gtk-rs/gir/pull/1368)
 * [codegen/sys/tests: Don't trim whitespace on C constant output](https://github.com/gtk-rs/gir/pull/1362)
 * [analysis: Don't generate duplicate getter/notify/setter from parent type ](https://github.com/gtk-rs/gir/pull/1371)
 * [analysis: Fix logic when analysing a function](https://github.com/gtk-rs/gir/pull/1375)
 * [config: Add a move configuration for functions parameters](https://github.com/gtk-rs/gir/pull/1376)
 * [Update for `Object::new()` panicking instead of returning a `Result`](https://github.com/gtk-rs/gir/pull/1380)
 * [Remove parsing and storage of unused and deprecated allow-none attribute](https://github.com/gtk-rs/gir/pull/1387)
 * [codegen/sys: Properly generate dox features for external libraries](https://github.com/gtk-rs/gir/pull/1388)

Thanks to all of our contributors for their (awesome!) work on this release:

 * [@A6GibKm](https://github.com/A6GibKm)
 * [@AaronErhardt](https://github.com/AaronErhardt)
 * [@abergmeier](https://github.com/abergmeier)
 * [@alatiera](https://github.com/alatiera)
 * [@andy128k](https://github.com/andy128k)
 * [@anlumo](https://github.com/anlumo)
 * [@arcnmx](https://github.com/arcnmx)
 * [@BiagioFesta](https://github.com/BiagioFesta)
 * [@bilelmoussaoui](https://github.com/bilelmoussaoui)
 * [@bvinc](https://github.com/bvinc)
 * [@cgwalters](https://github.com/cgwalters)
 * [@cmdcolin](https://github.com/cmdcolin)
 * [@Davidoc26](https://github.com/Davidoc26)
 * [@ebanDev](https://github.com/ebanDev)
 * [@euclio](https://github.com/euclio)
 * [@fengalin](https://github.com/fengalin)
 * [@filnet](https://github.com/filnet)
 * [@FineFindus](https://github.com/FineFindus)
 * [@gdesmott](https://github.com/gdesmott)
 * [@GuillaumeGomez](https://github.com/GuillaumeGomez)
 * [@gwutz](https://github.com/gwutz)
 * [@heftig](https://github.com/heftig)
 * [@Hofer-Julian](https://github.com/Hofer-Julian)
 * [@ids1024](https://github.com/ids1024)
 * [@Jaakkonen](https://github.com/Jaakkonen)
 * [@Jedsek](https://github.com/Jedsek)
 * [@jf2048](https://github.com/jf2048)
 * [@jim4067](https://github.com/jim4067)
 * [@JoelMon](https://github.com/JoelMon)
 * [@jsparber](https://github.com/jsparber)
 * [@kelnos](https://github.com/kelnos)
 * [@khrj](https://github.com/khrj)
 * [@kianmeng](https://github.com/kianmeng)
 * [@lucab](https://github.com/lucab)
 * [@lucastarche](https://github.com/lucastarche)
 * [@MarijnS95](https://github.com/MarijnS95)
 * [@mbiggio](https://github.com/mbiggio)
 * [@pbor](https://github.com/pbor)
 * [@pentamassiv](https://github.com/pentamassiv)
 * [@philn](https://github.com/philn)
 * [@ranfdev](https://github.com/ranfdev)
 * [@RealKC](https://github.com/RealKC)
 * [@rodrigorc](https://github.com/rodrigorc)
 * [@saethlin](https://github.com/saethlin)
 * [@sdroege](https://github.com/sdroege)
 * [@SeaDve](https://github.com/SeaDve)
 * [@songww](https://github.com/songww)
 * [@takaswie](https://github.com/takaswie)
 * [@Ungedummt](https://github.com/Ungedummt)
 * [@zecakeh](https://github.com/zecakeh)
 * [@zhangyuannie](https://github.com/zhangyuannie)

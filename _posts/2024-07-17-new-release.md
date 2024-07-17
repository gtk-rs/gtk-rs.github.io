---
layout: post
author: gtk-rs developers
title: New Release
categories: [front, crates]
date: 2024-07-17 09:00:00 +0000
---

gtk4-rs `0.9` and gtk-rs-core `0.20` were just freshly released, just in time
for also being included in the GNOME 47 release.

This release is again relatively small, mostly providing bindings to new APIs
and improvements to the `glib::clone!` and `glib::closure!` macros to work
better with `cargo fmt` and rust-analyzer.

As usual, at the same time gstreamer-rs `0.23` and gst-plugins-rs `0.13`,
libadwaita `0.7` and other related crates got a new release compatible with
the new gtk4-rs and gtk-rs-core releases and their own set of changes.

### gtk-rs-core

#### New syntax for `glib::clone!` and `glib::closure!`

The syntax for the `clone!` and `closure!` macros was updated to look more
like valid Rust code, and as a side effect it is also handled correctly by
`cargo fmt`, rust-analyzer and other tooling now.

The old syntax is still supported but will give a deprecation warning.

To get an idea of the change, what previously looked like:

```rust
clone!(@strong self as obj, @weak v => @default-return false, move |x| {
    println!("obj: {}, v: {}, x: {}", obj, v, x);
    true
})
```

would now look like this:

```rust
clone!(
    #[strong(rename_to = obj)]
    self,
    #[weak]
    v,
    #[upgrade_or]
    false,
    move |x| {
        println!("obj: {}, v: {}, x: {}", obj, v, x);
        true
    },
);
```

Check the [documentation](https://gtk-rs.org/gtk-rs-core/stable/0.20/docs/glib/macro.clone.html) for more details about the new syntax.

#### GLib 2.82 APIs

New GLib and GIO 2.82 APIs are supported with this release. GLib 2.56 is still
the minimum version supported by the bindings.

#### Trait re-organization for defining new GObject interfaces

The traits for defining new GObject interfaces were slightly re-organized to
make them more similar with the ones for defining new GObjects.

Previously one would write:

```rust
#[derive(Clone, Copy)]
#[repr(C)]
pub struct MyStaticInterface {
    parent: glib::gobject_ffi::GTypeInterface,
}

#[glib::object_interface]
unsafe impl ObjectInterface for MyStaticInterface {
    const NAME: &'static str = "MyStaticInterface";
}
```

This would now become:

```rust
#[derive(Clone, Copy)]
#[repr(C)]
pub struct MyStaticInterfaceClass {
    parent: glib::gobject_ffi::GTypeInterface,
}

unsafe impl InterfaceStruct for MyStaticInterfaceClass {
    type Type = MyStaticInterface;
}

pub enum MyStaticInterface {}

#[glib::object_interface]
impl ObjectInterface for MyStaticInterface {
    const NAME: &'static str = "MyStaticInterface";

    type Interface = MyStaticInterfaceClass;
}
```

While it is a bit more code, this is almost the same as for GObjects now.

#### Safer borrowing of GObjects and other types from FFI code

It is possible to directly borrow GObjects and other types in FFI code without
additional refcounting or copying. In previous releases the API for that was
completely based on pointers, which allowed to accidentally create dangling
pointers without the compiler being able to help.

```rust
let obj = {
    let mut ptr: *mut glib::ffi::GObject = ...;
    let obj: &glib::Object = glib::Object::from_glib_ptr_borrow(&mut ptr);
    obj
};
// At this point `obj` is pointing at a stack frame that does not exist anymore
```

Starting with this release, a reference to a pointer is used instead to avoid
this from happening. The above code would not compile anymore. Previously the
lifetime of the returned object would be arbitrary, now it is bound strictly
to the lifetime of the pointer.

Code using this API likely does not need any changes unless the code was
previously wrong.

### gtk4-rs

#### GTK 4.16 APIs

New GTK 4.16 APIs are supported with this release. GTK 4.0 is still the
minimum version supported by the bindings.

### Changes

For the interested ones, here is the list of the merged pull requests:

[gtk4-rs](https://github.com/gtk-rs/gtk4-rs):

 * [Update to new clone! macro syntax](https://github.com/gtk-rs/gtk4-rs/pull/1773)
 * [book: Fix typo](https://github.com/gtk-rs/gtk4-rs/pull/1769)
 * [Remove unnecessary upcast from examples/squeezer\_bin/main.rs](https://github.com/gtk-rs/gtk4-rs/pull/1763)
 * [typos: Ignore versions.txt file](https://github.com/gtk-rs/gtk4-rs/pull/1762)
 * [examples/squeezer\_bin: Mark properties as writable](https://github.com/gtk-rs/gtk4-rs/pull/1761)
 * [Fix `SqueezerBin::size\_allocate()` in example](https://github.com/gtk-rs/gtk4-rs/pull/1760)
 * [Stop renaming ffi crates](https://github.com/gtk-rs/gtk4-rs/pull/1758)
 * [custom\_orientable: Fix interface property override](https://github.com/gtk-rs/gtk4-rs/pull/1755)
 * [gtk: Implement Downgrade for TemplateChild&lt;T&gt;](https://github.com/gtk-rs/gtk4-rs/pull/1750)
 * [Update list\_widgets.md](https://github.com/gtk-rs/gtk4-rs/pull/1742)
 * [examples: Support GL &gt;= 3.1 and GLES &gt;= 3.0 in the glium example](https://github.com/gtk-rs/gtk4-rs/pull/1733)
 * [Update link for Cogitri/Health to World/Health](https://github.com/gtk-rs/gtk4-rs/pull/1725)
 * [Simplify reading file contents to a String](https://github.com/gtk-rs/gtk4-rs/pull/1719)
 * [macros: Drop anyhow dependency](https://github.com/gtk-rs/gtk4-rs/pull/1708)
 * [Fix typo in todo\_1.md](https://github.com/gtk-rs/gtk4-rs/pull/1707)
 * [gtk4: Manually implement `GraphicsOffload` constructor for now](https://github.com/gtk-rs/gtk4-rs/pull/1705)
 * [gtk4: Require GDK 4.14 when enabling the `v4\_14` feature](https://github.com/gtk-rs/gtk4-rs/pull/1704)
 * [macros: Drop macro-proc-error and upgrade syn to 2.0](https://github.com/gtk-rs/gtk4-rs/pull/1688)
 * [dockerfile: Update libadwaita to 1.5](https://github.com/gtk-rs/gtk4-rs/pull/1687)
 * [docs: fix `Path` setting on windows](https://github.com/gtk-rs/gtk4-rs/pull/1675)
 * [Correctly handle `NULL` `GError\*\*` out parameters](https://github.com/gtk-rs/gtk4-rs/pull/1672)
 * [Replace simple `impl Debug` with derived `Debug` in tokio example](https://github.com/gtk-rs/gtk4-rs/pull/1663)
 * [Simplify library configuration step for Windows](https://github.com/gtk-rs/gtk4-rs/pull/1644)

[gtk-rs-core](https://github.com/gtk-rs/gtk-rs-core):

 * [docs: Run on our container image](https://github.com/gtk-rs/gtk-rs-core/pull/1455)
 * [gio: Add a method to get a stream of incoming connections to SocketListener](https://github.com/gtk-rs/gtk-rs-core/pull/1454)
 * [glib: Add support for registering GTypes with name conflicts](https://github.com/gtk-rs/gtk-rs-core/pull/1451)
 * [glib: Make `TypeData` struct fields private](https://github.com/gtk-rs/gtk-rs-core/pull/1449)
 * [glib-macros: Don't produce unnecessary braces in `clone!(async move { x })`](https://github.com/gtk-rs/gtk-rs-core/pull/1443)
 * [Update to system-deps 7](https://github.com/gtk-rs/gtk-rs-core/pull/1440)
 * [glib-macros: Fix unit return in `closure!()` macro](https://github.com/gtk-rs/gtk-rs-core/pull/1438)
 * [strv: add From implementation from a String array](https://github.com/gtk-rs/gtk-rs-core/pull/1432)
 * [Derive TransparentPtrType trait for Boxed](https://github.com/gtk-rs/gtk-rs-core/pull/1431)
 * [gio: Properly export Win32InputStream / Win32OutputStream traits](https://github.com/gtk-rs/gtk-rs-core/pull/1429)
 * [Update `clone!` and `closure!` macro to new syntax](https://github.com/gtk-rs/gtk-rs-core/pull/1424)
 * [Stop renaming ffi crates](https://github.com/gtk-rs/gtk-rs-core/pull/1423)
 * [gio: remove Send + Sync requirements from DBusConnection::register\_ob…](https://github.com/gtk-rs/gtk-rs-core/pull/1422)
 * [spell fix](https://github.com/gtk-rs/gtk-rs-core/pull/1419)
 * [gio: make DBusConnection::register\_object take optional clousures](https://github.com/gtk-rs/gtk-rs-core/pull/1417)
 * [glib: Add unsafe `Value::into\_send\_value()`](https://github.com/gtk-rs/gtk-rs-core/pull/1413)
 * [glib: Improve `ValueArray` API, add tests and assertions for invalid …](https://github.com/gtk-rs/gtk-rs-core/pull/1411)
 * [glib: Fix `MatchInfo::next()` handling of returning `FALSE`](https://github.com/gtk-rs/gtk-rs-core/pull/1410)
 * [glib/functions: add compute\_checksum\_for\_string](https://github.com/gtk-rs/gtk-rs-core/pull/1406)
 * [glib: Add bindings for `g\_value\_set\_static\_string()`](https://github.com/gtk-rs/gtk-rs-core/pull/1400)
 * [docs: Fix broken links / cleanup README](https://github.com/gtk-rs/gtk-rs-core/pull/1395)
 * [glib: Implement Sync for ThreadGuard](https://github.com/gtk-rs/gtk-rs-core/pull/1388)
 * [glib: Only implement Send on JoinHandle if the result is Send](https://github.com/gtk-rs/gtk-rs-core/pull/1387)
 * [glib: Decouple ObjectInterface impl from interface class struct](https://github.com/gtk-rs/gtk-rs-core/pull/1384)
 * [glib: Add missing Send bound to the output type of the `spawn\_from\_within()` future](https://github.com/gtk-rs/gtk-rs-core/pull/1383)
 * [glib-macros: Refactor parsing code of object\_subclass/object\_interface](https://github.com/gtk-rs/gtk-rs-core/pull/1379)
 * [examples: Add example for custom class structs and virtual methods](https://github.com/gtk-rs/gtk-rs-core/pull/1378)
 * [ObjectBuilder: add property\_if(), property\_if\_some(), property\_from\_iter() \& property\_if\_not\_empty()](https://github.com/gtk-rs/gtk-rs-core/pull/1377)
 * [glib: Don't use `g\_object\_list\_properties()` for setting properties](https://github.com/gtk-rs/gtk-rs-core/pull/1376)
 * [glib: Use a reference to a pointer of correct mutability for from\_glib\_ptr\_borrow()](https://github.com/gtk-rs/gtk-rs-core/pull/1375)
 * [glib: Re-add and rename manual Win32 API additions](https://github.com/gtk-rs/gtk-rs-core/pull/1372)
 * [glib-macros/properties: Allow structs with no properties](https://github.com/gtk-rs/gtk-rs-core/pull/1370)
 * [glib::wrapper: Add docs for impls generated by the wrapper macro](https://github.com/gtk-rs/gtk-rs-core/pull/1369)
 * [glib-sys: Add missing includes in `manual.h`](https://github.com/gtk-rs/gtk-rs-core/pull/1361)
 * [glib-sys: fix struct size mismatches](https://github.com/gtk-rs/gtk-rs-core/pull/1360)
 * [glib: Freeze property notifications while setting multiple properties](https://github.com/gtk-rs/gtk-rs-core/pull/1355)
 * [glib-macros: Improve error message when `Properties` struct doesn't have at least one `#\[property(…)\]`](https://github.com/gtk-rs/gtk-rs-core/pull/1352)
 * [docs: `construct` attribute for `glib::Properties`](https://github.com/gtk-rs/gtk-rs-core/pull/1344)
 * [glib: fix UB in VariantStrIter::impl\_get](https://github.com/gtk-rs/gtk-rs-core/pull/1343)
 * [glib: Don't misuse `slice::get\_unchecked()`](https://github.com/gtk-rs/gtk-rs-core/pull/1337)
 * [gio: correctly free argument list items](https://github.com/gtk-rs/gtk-rs-core/pull/1331)
 * [glib: Optimize string collation bindings a bit](https://github.com/gtk-rs/gtk-rs-core/pull/1329)
 * [glib: Drop the main context future return value sender on finalize](https://github.com/gtk-rs/gtk-rs-core/pull/1328)
 * [pango: add some missing AttrInt constructors.](https://github.com/gtk-rs/gtk-rs-core/pull/1325)
 * [glib: Embed docs for ParamSpec types](https://github.com/gtk-rs/gtk-rs-core/pull/1323)
 * [glib: Requires Upgrade on Downgrade::Weak type](https://github.com/gtk-rs/gtk-rs-core/pull/1321)
 * [macros: allow to specify #\[default\] for glib::flags](https://github.com/gtk-rs/gtk-rs-core/pull/1316)
 * [glib: Add `Quark::from\_static\_str()`](https://github.com/gtk-rs/gtk-rs-core/pull/1312)
 * [docs: Move metadata back to packages](https://github.com/gtk-rs/gtk-rs-core/pull/1311)
 * [cairo: Fix version of the v1\_18 feature](https://github.com/gtk-rs/gtk-rs-core/pull/1310)
 * [Document values of Continue and Break](https://github.com/gtk-rs/gtk-rs-core/pull/1304)

All this was possible thanks to the [gtk-rs/gir](https://github.com/gtk-rs/gir) project as well:

 * [Minor cleanup to use `is\_some\_and(...)` instead of `map\_or(false, ...)`](https://github.com/gtk-rs/gir/pull/1584)
 * [Update to system-deps 7](https://github.com/gtk-rs/gir/pull/1583)
 * [More docs improvements](https://github.com/gtk-rs/gir/pull/1576)
 * [codegen: Handle mangled types names](https://github.com/gtk-rs/gir/pull/1575)
 * [members: drop useless alias config](https://github.com/gtk-rs/gir/pull/1574)
 * [Various properties fixes](https://github.com/gtk-rs/gir/pull/1573)
 * [codegen: Avoid double alias on badly annotated fn](https://github.com/gtk-rs/gir/pull/1572)
 * [Use getter and setter annotations](https://github.com/gtk-rs/gir/pull/1571)
 * [Support finish-func annotation](https://github.com/gtk-rs/gir/pull/1570)
 * [codegen: Stop renaming ffi crate](https://github.com/gtk-rs/gir/pull/1569)
 * [Use final annotation](https://github.com/gtk-rs/gir/pull/1568)
 * [Add support for `libc::time\_t` and related types](https://github.com/gtk-rs/gir/pull/1562)
 * [Revert Automatically assume that win32\_ and unix\_ should use the related cfg](https://github.com/gtk-rs/gir/pull/1547)
 * [Correctly generate cfg condition for ABI tests](https://github.com/gtk-rs/gir/pull/1546)
 * [Generate cfgs with `update\_cfgs` on enums as well](https://github.com/gtk-rs/gir/pull/1545)

Thanks to all of our contributors for their (awesome!) work on this release:

 * [@A6GibKm](https://github.com/A6GibKm)
 * [@alatiera](https://github.com/alatiera)
 * [@amyspark](https://github.com/amyspark)
 * [@bilelmoussaoui](https://github.com/bilelmoussaoui)
 * [@carlosmn](https://github.com/carlosmn)
 * [@DaKnig](https://github.com/DaKnig)
 * [@decathorpe](https://github.com/decathorpe)
 * [@ellnix](https://github.com/ellnix)
 * [@enaut](https://github.com/enaut)
 * [@exi](https://github.com/exi)
 * [@felinira](https://github.com/felinira)
 * [@fengalin](https://github.com/fengalin)
 * [@GuillaumeGomez](https://github.com/GuillaumeGomez)
 * [@Hofer-Julian](https://github.com/Hofer-Julian)
 * [@liushuyu](https://github.com/liushuyu)
 * [@marcinjahn](https://github.com/marcinjahn)
 * [@misson20000](https://github.com/misson20000)
 * [@mjgarton](https://github.com/mjgarton)
 * [@mokurin000](https://github.com/mokurin000)
 * [@mtilda](https://github.com/mtilda)
 * [@nazar-pc](https://github.com/nazar-pc)
 * [@pbor](https://github.com/pbor)
 * [@pranjalkole](https://github.com/pranjalkole)
 * [@sdroege](https://github.com/sdroege)
 * [@vhakulinen](https://github.com/vhakulinen)
 * [@woelfman](https://github.com/woelfman)
 * [@ystreet](https://github.com/ystreet)
 * [@zecakeh](https://github.com/zecakeh)

---
layout: post
author: gtk-rs developers
title: New Release
categories: [front, crates]
date: 2024-06-01 13:00:00 +0000
---

Although this release happened a few months ago, we finally had time to finish this release blog post!

This is a smaller release than usual, bringing some nice quality of life improvements.

Enjoy!

### gtk-rs-core

#### Removal of glib channels

In this release the `glib::MainContext::channel()` function was removed, together with the corresponding sender/receiver types. In many cases this API has led to overly complicated code in applications because people tried to develop state machines via callbacks, instead of simply making use of async Rust for that purpose.

Instead of using the main context channel, the new way of passing values between other threads and the main thread is by using any of the many async channel implementations. Examples for this are the [async-channel](https://docs.rs/async-channel) crate, the MPSC channels from tokio or async-std, the task/thread join handles of both, the [flume](https://docs.rs/flume) crate, ...

For example, the following code:

```rust
let (sender, receiver) = glib::MainContext::channel(glib::Priority::DEFAULT);
receiver.attach(Some(&glib::MainContext::default()), move |msg| do_things(msg));

sender.send(MyMessage);
```

Could be rewritten like this with the `async-channel` crate:

```rust
let (sender, receiver) = async_channel::unbounded();
glib::MainContext::default().spawn_local(async move {
    while let Ok(msg) = receiver.recv().await {
        do_things(msg);
    }
});

sender.send_blocking(MyMessage).expect("Channel closed");
```

#### Removal of re-exported once_cell crate, use `std::cell::OnceCell` / `std::sync::OnceLock`

If you need lazy initialization then `once_cell::sync::Lazy` is still useful until `LazyCell` / `LazyLock` from `std` are finalized.

#### Re-organized traits in glib

If you get a compiler error because of missing traits, usually the solution would be to make sure that the prelude of the crates (e.g. `gtk::prelude::*`) is imported.

#### Dynamic types support

Let's say you want to create a plugin to add some features or to customize some application. `object_class_dynamic`, `object_interface_dynamic `, `enum_dynamic ` and `flags_dynamic ` are macro helper attributes to make your types dynamic.

```Rust
// My object types
#[derive(Default)]
pub struct MyType;

#[glib::object_subclass]
#[object_subclass_dynamic]
impl ObjectSubclass for MyType { ... }

// My interfaces
pub struct MyInterface {
    parent: glib::gobject_ffi::GTypeInterface,
}

#[glib::object_interface]
#[object_interface_dynamic]
unsafe impl ObjectInterface for MyInterface { ... }

// My enums
#[derive(Debug, Copy, Clone, PartialEq, Eq, glib::Enum)]
#[enum_type(name = "MyModuleEnum")]
#[enum_dynamic]
enum MyModuleEnum { ... }

// My flags
#[glib::flags(name = "MyFlags")]
#[flags_dynamic]
enum MyFlags { ... }
```

Your plugin code has to implement the `TypePlugin` interface or to extend the `TypeModule` type in order to register or unregister your dynamic types when the module (or plugin) is loaded or unloaded.

```Rust
#[derive(Default)]
pub struct MyModule;

#[glib::object_subclass]
impl ObjectSubclass for MyModule { ... }

impl ObjectImpl for MyModule {}

impl TypePluginImpl for MyModule {}

impl TypeModuleImpl for MyModule {
    fn load(&self) -> bool {
        // registers my plugin types as dynamic types.
        let my_module = self.obj();
        let type_module: &glib::TypeModule = my_module.upcast_ref();
        MyInterface::on_implementation_load(type_module)
            && MyType::on_implementation_load(type_module)
            && MyEnum::on_implementation_load(type_module)
            && MyFlags::on_implementation_load(type_module)
    }

    fn unload(&self) {
        // marks my plugin types as unregistered.
        let my_module = self.obj();
        let type_module: &glib::TypeModule = my_module.upcast_ref();
        MyFlags::on_implementation_unload(type_module);
        MyEnum::on_implementation_unload(type_module);
        MyType::on_implementation_unload(type_module);
        MyInterface::on_implementation_unload(type_module);
    }
}
```

By default dynamic types are registered when  the system loads your plugin. In some cases, it could be useful to postpone the registration of a dynamic type on the first use. This can be done by setting `lazy_registration = true`:

```Rust
// My object types
#[derive(Default)]
pub struct MyType;

#[glib::object_subclass]
#[object_subclass_dynamic(lazy_registration = true)]
impl ObjectSubclass for MyType { ... }
```

For more complex cases, see the documentation [glib::object_subclass](https://docs.rs/glib/latest/glib/attr.object_subclass.html), [glib::object_interface](https://docs.rs/glib/latest/glib/attr.object_interface.html), [glib::Enum](https://docs.rs/glib/latest/glib/derive.Enum.html), [glib::flags](https://docs.rs/glib/latest/glib/attr.flags.html), [glib::subclass::type_module::TypeModuleImpl](https://docs.rs/glib/latest/glib/subclass/type_module/trait.TypeModuleImpl.html) and [glib::subclass::type_plugin::TypePluginImpl](https://docs.rs/glib/latest/glib/subclass/type_plugin/trait.TypePluginImpl.html).

### gtk4-rs

* GTK 4.14 APIs support
* Support `TemplateChild<T>` usage with `glib::Properties` macro, allowing `TemplateChild<T>` to be used as properties

[gtk4-rs](https://github.com/gtk-rs/gtk4-rs):

 * [gtk: Don't propagate unused argument](https://github.com/gtk-rs/gtk4-rs/pull/1591)
 * [examples: Add example for About Dialog](https://github.com/gtk-rs/gtk4-rs/pull/1589)
 * [gtk::show\_about\_dialog: Set hide\_on\_close](https://github.com/gtk-rs/gtk4-rs/pull/1588)
 * [Regen with ffi workspacecs usage](https://github.com/gtk-rs/gtk4-rs/pull/1587)
 * [Add missing installation step for Windows](https://github.com/gtk-rs/gtk4-rs/pull/1584)
 * [book: Use const consistently](https://github.com/gtk-rs/gtk4-rs/pull/1582)
 * [book: Less usage of once\_cell](https://github.com/gtk-rs/gtk4-rs/pull/1581)
 * [Get rid of once\_cell](https://github.com/gtk-rs/gtk4-rs/pull/1580)
 * [Use cargo workspace features](https://github.com/gtk-rs/gtk4-rs/pull/1579)
 * [Examples: async request no blocking main thread](https://github.com/gtk-rs/gtk4-rs/pull/1578)
 * [CI: add a cargo deny job](https://github.com/gtk-rs/gtk4-rs/pull/1576)
 * [Revert "book: Go back to 4\_8 for now"](https://github.com/gtk-rs/gtk4-rs/pull/1571)
 * [examples: Add a menubar one](https://github.com/gtk-rs/gtk4-rs/pull/1570)
 * [examples: Add a gtk::Scale](https://github.com/gtk-rs/gtk4-rs/pull/1569)
 * [Various fixes](https://github.com/gtk-rs/gtk4-rs/pull/1568)
 * [image: Use modern way of publishing the container](https://github.com/gtk-rs/gtk4-rs/pull/1566)
 * [print\_job: fix send() closure](https://github.com/gtk-rs/gtk4-rs/pull/1563)
 * [book: Fix link to GVariant docs](https://github.com/gtk-rs/gtk4-rs/pull/1559)
 * [docs: fix composite template internal\_child -&gt; internal](https://github.com/gtk-rs/gtk4-rs/pull/1550)
 * [Add clarification around creating tokio runtime](https://github.com/gtk-rs/gtk4-rs/pull/1546)
 * [book: Move to libadwaita 1.4](https://github.com/gtk-rs/gtk4-rs/pull/1536)
 * [book: Add setuptools installation](https://github.com/gtk-rs/gtk4-rs/pull/1534)
 * [book: Use new API spawn\_future\_local](https://github.com/gtk-rs/gtk4-rs/pull/1533)
 * [docker: Move to libadwaita 1.4](https://github.com/gtk-rs/gtk4-rs/pull/1531)
 * [book: Move to `install_action`](https://github.com/gtk-rs/gtk4-rs/pull/1529)
 * [Migrate listings to action group](https://github.com/gtk-rs/gtk4-rs/pull/1525)
 * [book: Use bounded channels instead of unbounded](https://github.com/gtk-rs/gtk4-rs/pull/1522)
 * [book: Move to async-channel](https://github.com/gtk-rs/gtk4-rs/pull/1521)
 * [book: Disable playground globally](https://github.com/gtk-rs/gtk4-rs/pull/1518)
 * [book: Split book workflow in two](https://github.com/gtk-rs/gtk4-rs/pull/1517)
 * [examples: various cleanups ](https://github.com/gtk-rs/gtk4-rs/pull/1515)
 * [Examples: Dialog's response signal handling](https://github.com/gtk-rs/gtk4-rs/pull/1514)
 * [examples: Clean up, modernize and simplify virtual methods example](https://github.com/gtk-rs/gtk4-rs/pull/1513)
 * [ gtk: Use glib enums instead of bools where it makes sense ](https://github.com/gtk-rs/gtk4-rs/pull/1512)
 * [book: Extend main loop chapter with async section](https://github.com/gtk-rs/gtk4-rs/pull/1511)
 * [book: Rename action to correct name](https://github.com/gtk-rs/gtk4-rs/pull/1510)
 * [examples: Only require GTK 4.10 for the examples](https://github.com/gtk-rs/gtk4-rs/pull/1509)
 * [book: Fix typo in memory management chapter](https://github.com/gtk-rs/gtk4-rs/pull/1504)
 * [book: Run separate jobs for check and deploy](https://github.com/gtk-rs/gtk4-rs/pull/1501)
 * [book: Check links with lychee](https://github.com/gtk-rs/gtk4-rs/pull/1499)
 * [gtk: Implement HasParamSpec for TemplateChild&lt;T&gt;](https://github.com/gtk-rs/gtk4-rs/pull/1495)
 * [Regenerate with latest gir](https://github.com/gtk-rs/gtk4-rs/pull/1492)
 * [book: Add missing steps for installation in windows](https://github.com/gtk-rs/gtk4-rs/pull/1486)
 * [gdk: Simplify RGBA builder code](https://github.com/gtk-rs/gtk4-rs/pull/1483)
 * [gsk: Add builder for Stroke](https://github.com/gtk-rs/gtk4-rs/pull/1482)
 * [gdk: Rename `GdkCairoContextExt::set_source_{rgba =&gt; color}`](https://github.com/gtk-rs/gtk4-rs/pull/1476)
 * [book: Add missing snippet for `new_task`](https://github.com/gtk-rs/gtk4-rs/pull/1472)
 * [book: Move to `std::cell::OnceCell`](https://github.com/gtk-rs/gtk4-rs/pull/1470)
 * [gdk: Make RGBA::new const and add with\_\* constructors](https://github.com/gtk-rs/gtk4-rs/pull/1468)
 * [Add new Path APIs](https://github.com/gtk-rs/gtk4-rs/pull/1463)
 * [book: Extend memory management chapter](https://github.com/gtk-rs/gtk4-rs/pull/1459)
 * [Untangle docsrs attribute from features](https://github.com/gtk-rs/gtk4-rs/pull/1454)
 * [Impl Write on text buffers](https://github.com/gtk-rs/gtk4-rs/pull/1452)
 * [gdk: Add missing Clipboard::set](https://github.com/gtk-rs/gtk4-rs/pull/1450)
 * [Use `derived_properties` macro](https://github.com/gtk-rs/gtk4-rs/pull/1434)
 * [ Use `gio::spawn_blocking` instead of thread::spawn ](https://github.com/gtk-rs/gtk4-rs/pull/1433)
 * [gtk: Add a GNOME 45 feature](https://github.com/gtk-rs/gtk4-rs/pull/1431)

[gtk-rs-core](https://github.com/gtk-rs/gtk-rs-core):

 * [Use workspace features for ffi types](https://github.com/gtk-rs/gtk-rs-core/pull/1297)
 * [Use cargo workspace features](https://github.com/gtk-rs/gtk-rs-core/pull/1296)
 * [Replace `once_cell` usage with std::sync::OnceLock](https://github.com/gtk-rs/gtk-rs-core/pull/1289)
 * [Replace usage of macro `proc_macro_error` with explicit propagation of  `syn::Result`](https://github.com/gtk-rs/gtk-rs-core/pull/1288)
 * [glib: Mark panicky `BoxedAnyObject` methods as `track_caller`](https://github.com/gtk-rs/gtk-rs-core/pull/1279)
 * [add support of flags registered as dynamic types](https://github.com/gtk-rs/gtk-rs-core/pull/1271)
 * [Fix concurrency issues](https://github.com/gtk-rs/gtk-rs-core/pull/1256)
 * [Refactor macros to register dynamic types](https://github.com/gtk-rs/gtk-rs-core/pull/1255)
 * [macros: generate GlibPtrDefault when deriving Boxed and SharedBoxed](https://github.com/gtk-rs/gtk-rs-core/pull/1241)
 * [gio: return NULL from spawn\_blocking's underlying gtask](https://github.com/gtk-rs/gtk-rs-core/pull/1239)
 * [gio: Don't wrongly cast DataInputStream byte arrays to a const pointer](https://github.com/gtk-rs/gtk-rs-core/pull/1238)
 * [Simplify pointer casts](https://github.com/gtk-rs/gtk-rs-core/pull/1233)
 * [glib: Remove deprecated paramspec constructors](https://github.com/gtk-rs/gtk-rs-core/pull/1230)
 * [Windows-specific API bindings that use Windows types were migrated from the unmaintained `winapi` crate to `window-sys`. This might need changes for users of these APIs and require them to migrate too.](https://github.com/gtk-rs/gtk-rs-core/pull/1226)
 * [Matchinfo lifetime](https://github.com/gtk-rs/gtk-rs-core/pull/1225)
 * [Add `Cargo.lock` to git tracking](https://github.com/gtk-rs/gtk-rs-core/pull/1221)
 * [Add support of enums as dynamic types](https://github.com/gtk-rs/gtk-rs-core/pull/1220)
 * [gio: fix UnixSocketAddress constructor with a path](https://github.com/gtk-rs/gtk-rs-core/pull/1218)
 * [glib: Remove `MainContext::channel()`](https://github.com/gtk-rs/gtk-rs-core/pull/1216)
 * [glib: Allow variable expansion in format strings passed to bool\_error & result\_from\_gboolean](https://github.com/gtk-rs/gtk-rs-core/pull/1210)
 * [gio: Use weak reference to ActionMap when adding action entries](https://github.com/gtk-rs/gtk-rs-core/pull/1208)
 * [Add \_full and \_local\_full methods for idle and timeout callbacks that take priority](https://github.com/gtk-rs/gtk-rs-core/pull/1207)
 * [Implement ext trait on IsA&lt;T&gt;, don't generate overridden methods](https://github.com/gtk-rs/gtk-rs-core/pull/1204)
 * [glib: Implement object class methods via a trait](https://github.com/gtk-rs/gtk-rs-core/pull/1203)
 * [New `glib::spawn_future()` and `glib::spawn_future_local()` convenience functions that directly spawn a future on the current thread default's main context, without first having to retrieve it](https://github.com/gtk-rs/gtk-rs-core/pull/1201)
 * [glib-macros: Remove unused imports from Properties doc test](https://github.com/gtk-rs/gtk-rs-core/pull/1193)
 * [glib-macros: Mark property getters as #\[must\_use\]](https://github.com/gtk-rs/gtk-rs-core/pull/1192)
 * [fix glyph string analysis methods that don't need &mut](https://github.com/gtk-rs/gtk-rs-core/pull/1188)
 * [cairo: Make it docs.rs friendly](https://github.com/gtk-rs/gtk-rs-core/pull/1182)
 * [glib/GStringPtr: Add `as_str()` and `Deref&lt;Target=&str&gt;`](https://github.com/gtk-rs/gtk-rs-core/pull/1181)
 * [CI: add a cargo deny job](https://github.com/gtk-rs/gtk-rs-core/pull/1179)
 * [glib: Remove `#[doc(hidden)]` from `once_cell` and `bitflags` re-export](https://github.com/gtk-rs/gtk-rs-core/pull/1177)
 * [Use associated type in memory managers](https://github.com/gtk-rs/gtk-rs-core/pull/1171)
 * [add support of module types](https://github.com/gtk-rs/gtk-rs-core/pull/1169)
 * [image: Switch to latest fedora stable](https://github.com/gtk-rs/gtk-rs-core/pull/1163)
 * [gio: Fix panics in `PollableInputStream` / `PollableOutputStream`](https://github.com/gtk-rs/gtk-rs-core/pull/1159)
 * [Added bindings for Gio.DBusObjectManager, Gio.DBusObjectManagerClientFlags](https://github.com/gtk-rs/gtk-rs-core/pull/1156)
 * [Disentangle docsrs and features](https://github.com/gtk-rs/gtk-rs-core/pull/1154)
 * [Add typos workflow](https://github.com/gtk-rs/gtk-rs-core/pull/1153)
 * [gio: Set missing annotations for new FileInfo apis](https://github.com/gtk-rs/gtk-rs-core/pull/1151)
 * [Add support for ext\_trait in properties macro](https://github.com/gtk-rs/gtk-rs-core/pull/1149)
 * [glib: Bind `g_unichar` APIs](https://github.com/gtk-rs/gtk-rs-core/pull/1146)
 * [Add object\_subclass example](https://github.com/gtk-rs/gtk-rs-core/pull/1145)
 * [Fix docs of `glib::derived_properties`](https://github.com/gtk-rs/gtk-rs-core/pull/1143)
 * [Fix panic in gio InputStream](https://github.com/gtk-rs/gtk-rs-core/pull/1140)
 * [Don't generate unit tuple in clone macro as default-return value](https://github.com/gtk-rs/gtk-rs-core/pull/1138)
 * [glib: prelude cleanup](https://github.com/gtk-rs/gtk-rs-core/pull/1095)
 * [glib: Implement Regex](https://github.com/gtk-rs/gtk-rs-core/pull/947)

All this was possible thanks to the [gtk-rs/gir](https://github.com/gtk-rs/gir) project as well:

 * [codegen/sys: Don't expect the crates are renamed](https://github.com/gtk-rs/gir/pull/1542)
 * [CI/tests: Remove gtk3 related bits](https://github.com/gtk-rs/gir/pull/1539)
 * [Replace once\_cell crate with std::sync::OnceLock in a generated code](https://github.com/gtk-rs/gir/pull/1537)
 * [Replace `once_cell` crate with `std::sync::OnceLock`](https://github.com/gtk-rs/gir/pull/1532)
 * [parser: Don't error out for forever scope](https://github.com/gtk-rs/gir/pull/1531)
 * [record: Differentiate disguised vs pointer types](https://github.com/gtk-rs/gir/pull/1530)
 * [Remove unnecessary casts of function pointers through usize](https://github.com/gtk-rs/gir/pull/1528)
 * [codegen: Generate a doc alias for aliases](https://github.com/gtk-rs/gir/pull/1520)
 * [parser: Don't require name/type for record types](https://github.com/gtk-rs/gir/pull/1512)
 * [Fix various typos](https://github.com/gtk-rs/gir/pull/1507)
 * [Make auto builders/traits/functions `pub(crate)`](https://github.com/gtk-rs/gir/pull/1505)
 * [config/codegen: Stop generating useless Display impls](https://github.com/gtk-rs/gir/pull/1502)
 * [Generated sys tests: Better command error handling](https://github.com/gtk-rs/gir/pull/1499)
 * [Fix inserting all-features in Cargo.toml for docs.rs](https://github.com/gtk-rs/gir/pull/1490)
 * [Add trait\_name to API docs](https://github.com/gtk-rs/gir/pull/1489)
 * [Fix docsrs](https://github.com/gtk-rs/gir/pull/1487)
 * [codegen: Replace ControlFlow with Propagation](https://github.com/gtk-rs/gir/pull/1485)
 * [codegen: generate doc\_alias for static\_type](https://github.com/gtk-rs/gir/pull/1143)

Thanks to all of our contributors for their (awesome!) work on this release:

 * [@AaronErhardt](https://github.com/AaronErhardt)
 * [@andy128k](https://github.com/andy128k)
 * [@awused](https://github.com/awused)
 * [@bilelmoussaoui](https://github.com/bilelmoussaoui)
 * [@bvinc](https://github.com/bvinc)
 * [@cgwalters](https://github.com/cgwalters)
 * [@Claudio-code](https://github.com/Claudio-code)
 * [@davidmhewitt](https://github.com/davidmhewitt)
 * [@erwinschrodinger1](https://github.com/erwinschrodinger1)
 * [@evaporei](https://github.com/evaporei)
 * [@fbrouille](https://github.com/fbrouille)
 * [@felinira](https://github.com/felinira)
 * [@GuillaumeGomez](https://github.com/GuillaumeGomez)
 * [@Hofer-Julian](https://github.com/Hofer-Julian)
 * [@JakeStanger](https://github.com/JakeStanger)
 * [@jf2048](https://github.com/jf2048)
 * [@jobale](https://github.com/jobale)
 * [@nicopap](https://github.com/nicopap)
 * [@ocrete](https://github.com/ocrete)
 * [@pbor](https://github.com/pbor)
 * [@pentamassiv](https://github.com/pentamassiv)
 * [@pieterdd](https://github.com/pieterdd)
 * [@ranfdev](https://github.com/ranfdev)
 * [@RealKC](https://github.com/RealKC)
 * [@redvimo](https://github.com/redvimo)
 * [@sdroege](https://github.com/sdroege)
 * [@SeaDve](https://github.com/SeaDve)
 * [@vhakulinen](https://github.com/vhakulinen)
 * [@wroyca](https://github.com/wroyca)
 * [@zachs18](https://github.com/zachs18)
 * [@ZanderBrown](https://github.com/ZanderBrown)
 * [@zecakeh](https://github.com/zecakeh)

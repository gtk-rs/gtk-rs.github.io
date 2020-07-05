---
layout: post
author: GuillaumeGomez
title: New crates, better APIs
categories: [front, crates]
date: 2020-07-04 17:30:00 +0000
---

Hi everyone, time for a new release!

Today, it's all about improving APIs and providing the GdkX11 bindings.
Let's see it more in details!

#### Change of minimum supported Rust version

The minimum supported Rust version is now 1.40. All the enums provided by the
gtk-rs crates now make use of the `#[non_exhaustive]` attribute to indicate
that there might be more values being added in the future.

#### Updated library versions

All the crates were updated to the latest library versions, that is, APIs that
are newly available since GNOME 3.36 are provided by the bindings.

### No more `new_from_...()` and `new_with_...()`

In GLib-based APIs, a common pattern for constructors is to call them
`new_from_...()` or `new_with_...()`. In Rust the `new_` prefix is usually
omitted, so all bindings were changed according to that too.

There might still be a few `new_...()` functions in the bindings. If you find
one and think a different name would be better, please create an
[issue](https://github.com/gtk-rs/glib/issues/new).

#### `glib-macros`

There's a new crate `glib-macros` now, which is re-exported by the `glib`
crate and provides a couple of proc-macros

  * `#[derive(GBoxed)` for easily deriving a boxed type for any Rust type
    the implements the `Clone` trait. This can be used to store values of that
    type in e.g. in `glib::Value`.
  * `#[derive(GEnum)]` for integer representation Rust enums, which registers
    GLib type for them and allows to use them e.g. in a `glib::Value`.
  * `#[gflags]`, which registers a GLib type for bitflags and wraps around the
    `bitflags` crate. Same as above this can then be used e.g. in a
    `glib::Value`.

Check the [documentation](https://gtk-rs.org/docs/glib_macros/index.html) for
details about the above.

#### GdkX11

GTK and its companion library GDK provide various API for interoperability
with platform interfaces, like X11 or Wayland or the equivalent APIs on
Windows and macOS.

With this release a crate for the X11 integration API for GDK is included.

### `glib::ThreadPool`

GLib provides a thread-pool API, which is now included in the bindings. There
are many crates that provide similar functionality but nothing that is part of
`std` yet, as such the addition seemed useful unlike adding bindings for the
threading primitives in GLib.

The `ThreadPool` bindings allow to create shared or exclusive thread pools,
where the shared thread pools are sharing their threads with other shared
ones. The maximum number of threads and various other parameters can be
configured on each thread pool, see
the [docs](https://gtk-rs.org/docs/glib/struct.ThreadPool.html).

After creation, new tasks can be pushed on the thread pool as a closure.
Optionally a `Future` can be returned to get notified about the completion of
the task.

```rust
let pool = ThreadPool::new_exclusive(1)?;

// Runs `do_something()` on the thread pool and doesn't wait
pool.push(|| {
    do_something();
});

// Runs `do_something_else()` on the thread pool and returns its
// return value via a `Future`
let fut = pool.push_future(|| {
    let res = do_something_else();
    res
});

// Asynchronously await the result of `do_something_else()`
let res = fut.await;
```

### Storage of arbitrary data in `glib::Object`s

In C, GObject provides the ability to store arbitrary data on any object.
Until this release this was not provided by the bindings as it generally is
used as a workaround for a suboptimal architecture, and most importantly
because all type information for the stored data is lost.

In this release `unsafe` API for making use of this is provided but it's the
caller's responsibility to ensure that the types are matching.

```rust
let button = gtk::Button::with_label("test");

unsafe {
    button.set_data("my-data", String::new("my-data-value"));
    let my_data = button.get_data("my-data");
}
```

Before using this please make sure there is no better solution for what you're
trying to achieve.

### `cairo::Error` instead of `cairo::Status`

Previously all `cairo` functions that could fail were returning a `Status`
enum in one way or another. This lead to unidiomatic error handling in Rust
applications.

In this release the `Status` enum was replaced by an `Error` enum that only
includes errors cases and is returned as part of the error case of `Result`s.
This allows doing normal Rust error handling via the `?` operator, for
example.

### cairo features

The `FreeType` and `script` features of the `cairo` bindings are now optional with
this release. It was already possible to compile the cairo C library without
them but the bindings assumed these features to always exist.

If you make use of these features you now need to enable them when depending
on the `cairo` crate.

### GDBus

GLib comes with its own
[DBus](https://www.freedesktop.org/wiki/Software/dbus/) IPC implementation.
Starting with this release big parts of the API are included in the bindings
and it is for example possible to create DBus services or use existing DBus
services.

The API is very close to the C API and as such not very convenient to use yet,
but more convenient APIs can be built on top of this in external crates or
maybe in future versions of the bindings. More to see later!

### No more `Widget::destroy()`

The `gtk::Widget::destroy()` function is marked as `unsafe` starting from this
release. Calling it on arbitrary widgets can cause all kinds of negative
side-effects and should be prevented.

Most usages of `destroy()` were related to dialogs or other windows. Instead
of `destroy()` the safer `close()` can be used now, which also allows the
window to handle the event.

### More subclassing support in `gtk`

This new release features subclassing support for many additional types:
IconView, CellRenderers (Pixbuf, Text, Spinner, Progress, Toggle, Accel,
Combo, Spin), DrawingArea, Plug, Socket and Fixed.

Together with all the ones that existed in previous releases, the most
commonly used types in GTK where subclassing is useful should be covered.
If some are missing, please open issues so we can add them.

### Conclusion

This release took us a lot of time but as you can see, it was definitely
worth it. We expect to provide even more tools to make gtk-rs development
as fun as possible and to continue to improve the bindings. More to come
soon!

### Changes

For the interested ones, here is the list of the merged pull requests:

[sys](https://github.com/gtk-rs/sys):

 * [Fix fixed size arrays](https://github.com/gtk-rs/sys/pull/158)
 * [Add gdkx11 lib](https://github.com/gtk-rs/sys/pull/161)
 * [Put back missing information](https://github.com/gtk-rs/sys/pull/162)
 * [Changes from new eoans gir-files](https://github.com/gtk-rs/sys/pull/163)
 * [Remove special case for gdkx11-sys](https://github.com/gtk-rs/sys/pull/165)
 * [Use options.split\_build\_rs](https://github.com/gtk-rs/sys/pull/168)
 * [Fix build\_version.rs](https://github.com/gtk-rs/sys/pull/169)
 * [Restore missing library versions in build.rs](https://github.com/gtk-rs/sys/pull/170)
 * [gdk/gdk: build: Compute and export GDK backends](https://github.com/gtk-rs/sys/pull/167)
 * [GIR files focal update](https://github.com/gtk-rs/sys/pull/164)
 * [Add correct versions for get\_type functions](https://github.com/gtk-rs/sys/pull/171)
 * [Depend on cairo-sys when selectin v3\_24\_2 feature](https://github.com/gtk-rs/sys/pull/173)
 * [Use eprintln](https://github.com/gtk-rs/sys/pull/175)

[glib](https://github.com/gtk-rs/glib):

 * [types: fix crashes on Type::Invalid API](https://github.com/gtk-rs/glib/pull/570)
 * [add genum-derive crate](https://github.com/gtk-rs/glib/pull/568)
 * [Add PtrArray and related trait implementations](https://github.com/gtk-rs/glib/pull/559)
 * [0.9.1 bugfix release](https://github.com/gtk-rs/glib/pull/571)
 * [Add more checks for clone macro](https://github.com/gtk-rs/glib/pull/563)
 * [Allow to specify type for closure arguments](https://github.com/gtk-rs/glib/pull/576)
 * [Derive fmt::Debug for a few more types](https://github.com/gtk-rs/glib/pull/577)
 * [Add glib::ThreadPool bindings](https://github.com/gtk-rs/glib/pull/578)
 * [Implements FromGlibPtrFull&lt;\*const T&gt; for boxed types.](https://github.com/gtk-rs/glib/pull/579)
 * [Bind API to convert from/to bytes to/from Variant](https://github.com/gtk-rs/glib/pull/588)
 * [Don't pass an owned string to g\_quark\_from\_static\_string()](https://github.com/gtk-rs/glib/pull/590)
 * [Replace unwrap calls with expect in tests](https://github.com/gtk-rs/glib/pull/593)
 * [Don't store subclass impl/private data in an Option&lt;T&gt;](https://github.com/gtk-rs/glib/pull/589)
 * [translate: Clarify the purpose and the effect of translation traits](https://github.com/gtk-rs/glib/pull/587)
 * [Add manual traits check](https://github.com/gtk-rs/glib/pull/600)
 * [Various container translation cleanups/fixes](https://github.com/gtk-rs/glib/pull/601)
 * [Don't require too strict bounds for ObjectSubclass::from\_instance()](https://github.com/gtk-rs/glib/pull/604)
 * [Remove some unneeded mem::forget() calls and Option wrappers](https://github.com/gtk-rs/glib/pull/606)
 * [More clone fixes](https://github.com/gtk-rs/glib/pull/607)
 * [Add clone test case for "async"](https://github.com/gtk-rs/glib/pull/609)
 * [glib-macros: add GBoxed derive](https://github.com/gtk-rs/glib/pull/603)
 * [Return a bool instead of a Result from Object::has\_property()](https://github.com/gtk-rs/glib/pull/614)
 * [Add logs API](https://github.com/gtk-rs/glib/pull/611)
 * [Clean up log functions](https://github.com/gtk-rs/glib/pull/617)
 * [Improve clone! error messages](https://github.com/gtk-rs/glib/pull/618)
 * [Improve log macros](https://github.com/gtk-rs/glib/pull/619)
 * [Add print in case an upgrade failed](https://github.com/gtk-rs/glib/pull/596)
 * [glib-macros: add gflags attribute macro](https://github.com/gtk-rs/glib/pull/620)
 * [Add @weak-allow-none for clone macro](https://github.com/gtk-rs/glib/pull/621)
 * [Add translate::Borrowed wrapper struct for from\_glib\_borrow()](https://github.com/gtk-rs/glib/pull/605)
 * [glib-macros: Update itertools to 0.9](https://github.com/gtk-rs/glib/pull/623)
 * [Use mem::ManuallyDrop instead of mem::forget() everywhere](https://github.com/gtk-rs/glib/pull/624)
 * [Remove unnecessary transmute calls](https://github.com/gtk-rs/glib/pull/625)
 * [Fix variant PartialOrd](https://github.com/gtk-rs/glib/pull/626)
 * [Remove deprecated Error::description impl](https://github.com/gtk-rs/glib/pull/627)
 * [Fix transmute mess](https://github.com/gtk-rs/glib/pull/628)
 * [Add test for callbacks validity](https://github.com/gtk-rs/glib/pull/632)
 * [Return a string of any lifetime from Quark::to\_string()](https://github.com/gtk-rs/glib/pull/633)
 * [VariantDict support](https://github.com/gtk-rs/glib/pull/634)
 * [Clippy cleanliness and CI enforcement](https://github.com/gtk-rs/glib/pull/635)
 * [Only derive SetValueOptional for nullable GBoxed types](https://github.com/gtk-rs/glib/pull/638)
 * [Unset return nullable for uuid\_string\_random()](https://github.com/gtk-rs/glib/pull/639)
 * [Disable GTK4 from the Travis CI](https://github.com/gtk-rs/glib/pull/645)
 * [Add unsafe generic qdata API to ObjectExt](https://github.com/gtk-rs/glib/pull/644)
 * [Various improvements to property handling](https://github.com/gtk-rs/glib/pull/646)
 * [Update glib-macros to proc-macro-error 1.0](https://github.com/gtk-rs/glib/pull/647)
 * [Don't require users of the glib proc macros to have gobject\_sys in scope](https://github.com/gtk-rs/glib/pull/648)
 * [Ignore g\_variant\_get\_gtype()](https://github.com/gtk-rs/glib/pull/652)
 * [Update to new gir and various related fixes](https://github.com/gtk-rs/glib/pull/656)
 * [Use g\_type\_register\_static\_simple() instead of g\_type\_register\_static…](https://github.com/gtk-rs/glib/pull/657)

[cairo](https://github.com/gtk-rs/cairo):

 * [Remove deprecated Error::description](https://github.com/gtk-rs/cairo/pull/303)
 * [Clean up travis script](https://github.com/gtk-rs/cairo/pull/310)
 * [Add missing Surface::get\_device method](https://github.com/gtk-rs/cairo/pull/313)
 * [Replace bad code](https://github.com/gtk-rs/cairo/pull/314)
 * [Update for new from\_glib\_borrow signature](https://github.com/gtk-rs/cairo/pull/315)
 * [Add missing fn](https://github.com/gtk-rs/cairo/pull/317)
 * [Don't include LGPL docs in the docs if both embed-lgpl-docs and purge…](https://github.com/gtk-rs/cairo/pull/319)
 * [errors: create an Error type and use that instead of Status](https://github.com/gtk-rs/cairo/pull/322)
 * [Work around crash when trying to access data of an image surface afte…](https://github.com/gtk-rs/cairo/pull/324)
 * [add a freetype feature](https://github.com/gtk-rs/cairo/pull/326)
 * [mark all the enums as non exhaustive](https://github.com/gtk-rs/cairo/pull/327)
 * [add a script feature](https://github.com/gtk-rs/cairo/pull/328)
 * [Add an ImageSurface::with\_data method.](https://github.com/gtk-rs/cairo/pull/330)
 * [Use system-deps crate instead of pkg-config directly](https://github.com/gtk-rs/cairo/pull/331)

[sourceview](https://github.com/gtk-rs/sourceview):

 * [SearchContext::replace\_all returns the number of replaced matches](https://github.com/gtk-rs/sourceview/pull/123)
 * [Fix transmute mess](https://github.com/gtk-rs/sourceview/pull/127)
 * [Remove the unused dependency on fragile](https://github.com/gtk-rs/sourceview/pull/128)
 * [Add async I/O to FileLoader and FileSaver](https://github.com/gtk-rs/sourceview/pull/129)
 * [README: it's actually sourceview](https://github.com/gtk-rs/sourceview/pull/133)

[atk](https://github.com/gtk-rs/atk):

 * [Update for new from\_glib\_borrow signature](https://github.com/gtk-rs/atk/pull/58)
 * [Fix transmute mess](https://github.com/gtk-rs/atk/pull/60)
 * [Don't include LGPL docs in the docs if both embed-lgpl-docs and purge…](https://github.com/gtk-rs/atk/pull/61)

[gio](https://github.com/gtk-rs/gio):

 * [Fix/extend DataInputStream code](https://github.com/gtk-rs/gio/pull/281)
 * [Add manual trait doc check](https://github.com/gtk-rs/gio/pull/283)
 * [Credentials::get\_unix\_user returns user id](https://github.com/gtk-rs/gio/pull/284)
 * [Update for new from\_glib\_borrow signature](https://github.com/gtk-rs/gio/pull/286)
 * [Use mem::ManuallyDrop instead of mem::forget() everywhere](https://github.com/gtk-rs/gio/pull/287)
 * [Remove unneeded transmute calls](https://github.com/gtk-rs/gio/pull/288)
 * [Fix transmute mess](https://github.com/gtk-rs/gio/pull/290)
 * [Add callback check](https://github.com/gtk-rs/gio/pull/289)
 * [Support various things which needed glib::VariantDict](https://github.com/gtk-rs/gio/pull/294)
 * [Clippy-clean plus CI](https://github.com/gtk-rs/gio/pull/295)
 * [SubProcess::communicate\_utf8\_async() is nullable for the returned std…](https://github.com/gtk-rs/gio/pull/292)
 * [Don't include LGPL docs in the docs if both embed-lgpl-docs and purge…](https://github.com/gtk-rs/gio/pull/297)
 * [input\_stream: add AsyncBufRead adapter](https://github.com/gtk-rs/gio/pull/298)
 * [Increase reference count of the stored streams in the IOStream when s…](https://github.com/gtk-rs/gio/pull/299)
 * [Mark the source\_object argument to the ThreadedSocketService::run as …](https://github.com/gtk-rs/gio/pull/301)
 * [Improve ThreadedSocketService::new](https://github.com/gtk-rs/gio/pull/302)
 * [Generate D-Bus classes](https://github.com/gtk-rs/gio/pull/303)

[pango](https://github.com/gtk-rs/pango):

 * [Update for new from\_glib\_borrow signature](https://github.com/gtk-rs/pango/pull/182)
 * [remove clippy lint about transmute cast](https://github.com/gtk-rs/pango/pull/183)
 * [Don't include LGPL docs in the docs if both embed-lgpl-docs and purge…](https://github.com/gtk-rs/pango/pull/187)
 * [Fix memory unsafety in `FontDescription::set\_family\_static`](https://github.com/gtk-rs/pango/pull/186)

[gdk-pixbuf](https://github.com/gtk-rs/gdk-pixbuf):

 * [Update for new from\_glib\_borrow signature](https://github.com/gtk-rs/gdk-pixbuf/pull/146)
 * [Fix transmute mess](https://github.com/gtk-rs/gdk-pixbuf/pull/150)
 * [Fix arithmetic overflow in Pixbuf::put\_pixel](https://github.com/gtk-rs/gdk-pixbuf/pull/148)
 * [Don't include LGPL docs in the docs if both embed-lgpl-docs and purge…](https://github.com/gtk-rs/gdk-pixbuf/pull/151)

[gdk](https://github.com/gtk-rs/gdk):

 * [Ignore thread\_add and threads\_add\_timeout in favor of glibs analog](https://github.com/gtk-rs/gdk/pull/333)
 * [Delete check\_init\_asserts](https://github.com/gtk-rs/gdk/pull/335)
 * [Update for new from\_glib\_borrow signature](https://github.com/gtk-rs/gdk/pull/340)
 * [window: store event\_mask using EventMask](https://github.com/gtk-rs/gdk/pull/342)
 * [Fix transmute mess](https://github.com/gtk-rs/gdk/pull/344)
 * [Don't include LGPL docs in the docs if both embed-lgpl-docs and purge…](https://github.com/gtk-rs/gdk/pull/347)
 * [Nicer bindings for Key(val) related functions](https://github.com/gtk-rs/gdk/pull/346)

[gtk](https://github.com/gtk-rs/gtk):

 * [Delete LGPL docs](https://github.com/gtk-rs/gtk/pull/927)
 * [Fix osx CI build](https://github.com/gtk-rs/gtk/pull/930)
 * [Switch from lazy\_static to once\_cell](https://github.com/gtk-rs/gtk/pull/929)
 * [Add subclass for IconView](https://github.com/gtk-rs/gtk/pull/931)
 * [Add subclass for CellRenderer and CellRendererPixbuf (Closes #936)](https://github.com/gtk-rs/gtk/pull/937)
 * [Added vfunc to IconView](https://github.com/gtk-rs/gtk/pull/940)
 * [Added more CellRenderer subclasses: Text, Spinner, Progress, Toggle, Accel, Combo, Spin](https://github.com/gtk-rs/gtk/pull/939)
 * [Fix an ownership issue](https://github.com/gtk-rs/gtk/pull/932)
 * [Implement size vfunc for Widget](https://github.com/gtk-rs/gtk/pull/942)
 * [Added subclassing for DrawingArea](https://github.com/gtk-rs/gtk/pull/941)
 * [Macos no Plug and Socket](https://github.com/gtk-rs/gtk/pull/944)
 * [Update Copyright Year](https://github.com/gtk-rs/gtk/pull/950)
 * [InfoBar::get\_content\_area return Box](https://github.com/gtk-rs/gtk/pull/948)
 * [Add StyleContext::get\_font, deignore Value getters](https://github.com/gtk-rs/gtk/pull/953)
 * [Add subclass support for Fixed](https://github.com/gtk-rs/gtk/pull/955)
 * [Mark Widget::destroy as unsafe](https://github.com/gtk-rs/gtk/pull/958)
 * [Simplify travis file](https://github.com/gtk-rs/gtk/pull/962)
 * [Fix doc link](https://github.com/gtk-rs/gtk/pull/970)
 * [Add vfuncs to WidgetImpl](https://github.com/gtk-rs/gtk/pull/972)
 * [Add ImplExt traits to subclass prelude](https://github.com/gtk-rs/gtk/pull/974)
 * [add basic subclassing functionality for treeview](https://github.com/gtk-rs/gtk/pull/975)
 * [Add size\_allocate vfunc to gtk::Widget](https://github.com/gtk-rs/gtk/pull/961)
 * [CellRenderer: fix null dereference for activate](https://github.com/gtk-rs/gtk/pull/943)
 * [Add scroll\_event vfunc to WidgetImpl](https://github.com/gtk-rs/gtk/pull/978)
 * [Update for new from\_glib\_borrow signature](https://github.com/gtk-rs/gtk/pull/980)
 * [The TreeSortable functions are called on the underlying model](https://github.com/gtk-rs/gtk/pull/982)
 * [Fix transmute mess](https://github.com/gtk-rs/gtk/pull/987)
 * [Workaround for GtkWindow::set-focus parameter nullability](https://github.com/gtk-rs/gtk/pull/986)
 * [Add gtk::Socket and gtk::Plug subclassing support](https://github.com/gtk-rs/gtk/pull/994)
 * [Clippy fixes](https://github.com/gtk-rs/gtk/pull/993)
 * [Application initialization](https://github.com/gtk-rs/gtk/pull/996)
 * [gdk\_backend config flags](https://github.com/gtk-rs/gtk/pull/995)
 * [Change some get\_ functions to return non-nullable](https://github.com/gtk-rs/gtk/pull/999)
 * [Fix more non-nullable returns](https://github.com/gtk-rs/gtk/pull/1001)
 * [Don't include LGPL docs in the docs if both embed-lgpl-docs and purge…](https://github.com/gtk-rs/gtk/pull/1007)
 * [Let Widget::hide\_on\_delete return Inhibit](https://github.com/gtk-rs/gtk/pull/1009)
 * [bind `Image.surface` and `CellRendererPixbuf.surface` properties](https://github.com/gtk-rs/gtk/pull/1011)
 * [Fix TextBuffer signals that can invalidate/modify TextIters](https://github.com/gtk-rs/gtk/pull/1015)
 * [generate missing builders](https://github.com/gtk-rs/gtk/pull/1019)
 * [generate missing Gtk.EventController\*](https://github.com/gtk-rs/gtk/pull/1022)
 * [generate missing Shortcut\* objects](https://github.com/gtk-rs/gtk/pull/1020)
 * [Generate GtkGestureStylus](https://github.com/gtk-rs/gtk/pull/1024)
 * [Ignore some builders](https://github.com/gtk-rs/gtk/pull/1021)

[pangocairo](https://github.com/gtk-rs/pangocairo):

 * [Clean up travis](https://github.com/gtk-rs/pangocairo/pull/69)
 * [Update for new from\_glib\_borrow signature](https://github.com/gtk-rs/pangocairo/pull/71)
 * [remove clippy lint about transmute cast](https://github.com/gtk-rs/pangocairo/pull/72)
 * [Don't include LGPL docs in the docs if both embed-lgpl-docs and purge…](https://github.com/gtk-rs/pangocairo/pull/73)

[gtk-test](https://github.com/gtk-rs/gtk-test):

 * [Update to last versions](https://github.com/gtk-rs/gtk-test/pull/30)
 * [Add missing crate](https://github.com/gtk-rs/gtk-test/pull/31)
 * [Update enigo to 0.0.14](https://github.com/gtk-rs/gtk-test/pull/36)

All this was possible thanks to the [gtk-rs/gir](https://github.com/gtk-rs/gir) project as well:

 * [Fix signal doc](https://github.com/gtk-rs/gir/pull/879)
 * [Remove unused variable](https://github.com/gtk-rs/gir/pull/882)
 * [Fix fields with fixed size array type](https://github.com/gtk-rs/gir/pull/881)
 * [Add new nullable\_return\_is\_error configuration for return types](https://github.com/gtk-rs/gir/pull/883)
 * [Use once\_cell::sync::Lazy instead of lazy\_static](https://github.com/gtk-rs/gir/pull/886)
 * [Fix returning array from async trampolines](https://github.com/gtk-rs/gir/pull/887)
 * [Add support for PtrArray](https://github.com/gtk-rs/gir/pull/888)
 * [Run rustfmt on generated code](https://github.com/gtk-rs/gir/pull/890)
 * [Allow to override use-return-for-result in function configuration.](https://github.com/gtk-rs/gir/pull/891)
 * [Check gir file](https://github.com/gtk-rs/gir/pull/893)
 * [git: check return value from 'git' command](https://github.com/gtk-rs/gir/pull/894)
 * [Generate code for new from\_glib\_borrow signature](https://github.com/gtk-rs/gir/pull/895)
 * [use #\[non\_exhaustive\] for generated enums](https://github.com/gtk-rs/gir/pull/897)
 * [Simplify chunk::Assert\* and fix missing init check for async\_future methods](https://github.com/gtk-rs/gir/pull/900)
 * [Add a check to avoid unforeseen failures](https://github.com/gtk-rs/gir/pull/904)
 * [Show more not generated types](https://github.com/gtk-rs/gir/pull/907)
 * [Builder postprocess](https://github.com/gtk-rs/gir/pull/912)
 * [Generate duplicated enum values in the -sys crate](https://github.com/gtk-rs/gir/pull/911)
 * [Consider nullability for async function return values](https://github.com/gtk-rs/gir/pull/914)
 * [Initial conversion to github actions](https://github.com/gtk-rs/gir/pull/913)
 * [Add options.split\_build\_rs](https://github.com/gtk-rs/gir/pull/915)
 * [Add static lifetime to generated build\_version.rs](https://github.com/gtk-rs/gir/pull/917)
 * [tests: use split\_build\_rs in gdk gir test](https://github.com/gtk-rs/gir/pull/918)
 * [Add options.extra\_versions and lib\_version\_overrides configurations](https://github.com/gtk-rs/gir/pull/920)
 * [Allow overriding safety assertions for functions](https://github.com/gtk-rs/gir/pull/922)
 * [Fix some code generation issues](https://github.com/gtk-rs/gir/pull/923)
 * [Fix wrongly written `object.function.return`](https://github.com/gtk-rs/gir/pull/924)
 * [Fix and ignore clippy warnings](https://github.com/gtk-rs/gir/pull/926)
 * [Add ImportsWithDefaults](https://github.com/gtk-rs/gir/pull/925)
 * [Correctly get function configuration and make use of it for get\_type(…](https://github.com/gtk-rs/gir/pull/928)
 * [functions: rename constructors](https://github.com/gtk-rs/gir/pull/929)
 * [Handle version configuration on get\_type functions in non-sys mode](https://github.com/gtk-rs/gir/pull/930)
 * [Generate version conditions for functions in sys mode no lower than t…](https://github.com/gtk-rs/gir/pull/931)
 * [Give preference to configured function versions over versions automat…](https://github.com/gtk-rs/gir/pull/932)
 * [Allow to ignore builders](https://github.com/gtk-rs/gir/pull/933)
 * [Update builder documentation](https://github.com/gtk-rs/gir/pull/934)
 * [cargo\_toml: set feature-versions for all versions](https://github.com/gtk-rs/gir/pull/939)
 * [cargo\_toml: use lib\_version\_overrides when defining feature versions](https://github.com/gtk-rs/gir/pull/940)
 * [Remove deleting pkg\_config](https://github.com/gtk-rs/gir/pull/941)
 * [Use system-deps](https://github.com/gtk-rs/gir/pull/937)
 * [Use `eprintln` for writing to stderr](https://github.com/gtk-rs/gir/pull/942)
 * [Generate docs for bitfields too](https://github.com/gtk-rs/gir/pull/943)
 * [Correctly generate doc elements for bitfields](https://github.com/gtk-rs/gir/pull/944)
 * [Fix variant doc generation](https://github.com/gtk-rs/gir/pull/945)
 * [Update dependencies](https://github.com/gtk-rs/gir/pull/946)

Thanks to all of our contributors for their (awesome!) work on this release:

 * [@andy128k](https://github.com/andy128k)
 * [@ArekPiekarz](https://github.com/ArekPiekarz)
 * [@bilelmoussaoui](https://github.com/bilelmoussaoui)
 * [@brackleian](https://github.com/brackleian)
 * [@cuviper](https://github.com/cuviper)
 * [@danigm](https://github.com/danigm)
 * [@dcz-purism](https://github.com/dcz-purism)
 * [@de-vri-es](https://github.com/de-vri-es)
 * [@dhonx](https://github.com/dhonx)
 * [@EPashkin](https://github.com/EPashkin)
 * [@federicomenaquintero](https://github.com/federicomenaquintero)
 * [@fengalin](https://github.com/fengalin)
 * [@gdesmott](https://github.com/gdesmott)
 * [@GuillaumeGomez](https://github.com/GuillaumeGomez)
 * [@hfiguiere](https://github.com/hfiguiere)
 * [@jneem](https://github.com/jneem)
 * [@jplatte](https://github.com/jplatte)
 * [@kinnison](https://github.com/kinnison)
 * [@luukvanderduim](https://github.com/luukvanderduim)
 * [@majorz](https://github.com/majorz)
 * [@misson20000](https://github.com/misson20000)
 * [@myfreeweb](https://github.com/myfreeweb)
 * [@nt8r](https://github.com/nt8r)
 * [@sdroege](https://github.com/sdroege)
 * [@sophie-h](https://github.com/sophie-h)
 * [@tsahyt](https://github.com/tsahyt)
 * [@vhdirk](https://github.com/vhdirk)
 * [@yvt](https://github.com/yvt)
 * [@zeenix](https://github.com/zeenix)

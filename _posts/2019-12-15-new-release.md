---
layout: post
author: GuillaumeGomez
title: Simplification and more of everything
categories: [front, crates]
date: 2019-12-15 19:00:00 +0000
---

Hello everyone, time for a new release!

This time, this is mostly about stabilization and simplification. It means that `gtk-rs` is now
simpler to use and more complete than ever. Let's take a tour of what's new(er)!

### Macro to make gtk-rs usage far simpler

A big productivity killer when using `gtk-rs` in the past was the requirement to pass cloned
references to objects, or even worse, weak references into signal handler closures. This is still
required but to make it more ergonomic, a new `clone!` macro is provided as part of `glib`.

See the [documentation](https://docs.rs/glib/0.9.0/glib/macro.clone.html) for various examples on
how to use it. The big advantage of the macro is that you don't have to manually declare new local
variables with a different name that are then moved into the closure, but simply have to provide the
name of the variable you want to make available in the closure and whether it should be passed as a
strong or weak reference. Inside the closure it can then be used as-is and for example upgrading any
weak references manually is not necessary. In case of failure of upgrading a weak reference, an
optional default return value for the closure can be provided or the closure can be configured to
panic.

The macro works on any `glib::Object` as well as on any `Arc` and `Rc`.

As a side-note, it is important to know the difference between strong and weak references and not
simply clone (strong reference) everything. By using strong references everywhere, many GTK
applications (not only in Rust) currently create reference cycles and therefore have memory leaks.
If, for example, you want to pass a reference to your `Window` into a `Button`'s `clicked` signal,
you would create a reference cycle between the window, button, signal handler and again the window.
This would lead to the whole cycle to be kept alive forever and leaked. The solution to this is to
make one of the references a weak reference, in this case the reference to the window that is
passed into the `clicked` signal handler. See also the `Rc` documentation about
[reference cycles](https://doc.rust-lang.org/std/rc/index.html).

### Subclass

The "subclass" cargo feature was removed from all crates and is instead enabled by default with
this release. The GObject subclassing support matured a lot over the last months and is ready for
wider usage. A basic example for subclassing `gtk::Application` and `gtk::ApplicationWindow` can
be found [here](https://github.com/gtk-rs/examples/blob/main/src/bin/basic_subclass.rs), another
example using custom `glib::Object` subclasses as part of a `gtk::ListBox` model can be found
[here](https://github.com/gtk-rs/examples/blob/main/src/bin/listbox_model.rs) and various examples
for creating GStreamer elements [here](https://gitlab.freedesktop.org/gstreamer/gst-plugins-rs).

While there are still subclassing bindings missing for many types, various basic types in the `gio`,
`gtk` and `gstreamer` crates are covered already. If something is missing for you, please let us
know with an issue or, even better, a pull request.

Thanks to subclassing being a first-class citizen of the bindings, there is also an adapter
available for making any `std::io::Read` available as `gio::InputStream` and any `std::io::Write`
as `gio::OutputStream`: `gio::ReadInputStream` and `gio::WriteOutputStream`. Adapters in the other
direction are available as `gio::InputStream::into_read()` and `gio::OutputStream::into_write()`.

### Futures

The futures support was ported to `std` `Future`s and `futures` 0.3, and as `async/await` is
stabilized now it was also enabled by default. The "futures" feature is not needed anymore.

With the futures support in `gio` and other modules it is now possible to write applications making
use of asynchronous I/O with `async/await`, which allows writing asynchronous code in a much simpler
way that looks close to the equivalent synchronous code. Check
[async/await stable](https://blog.rust-lang.org/2019/11/07/Async-await-stable.html) on the official
Rust blog for more details.

An example making use of this with `gio`'s asynchronous file reading support can be found
[here](https://github.com/gtk-rs/examples/blob/main/src/bin/gio_futures_await.rs). While it is
not as streamlined as with native Rust crates like [async-std](https://async.rs) or
[tokio](https://tokio.rs) because of how the `gio` API works, it nonetheless much more convenient
to work with than the previous (but still available) callback-based approach.

Another example that shows integration of `gio` with generic Rust futures crates can be found
[here](https://github.com/gtk-rs/examples/blob/pending/src/bin/gio_async_tls.rs) . Each
`gio::PollableInputStream` and `gio::PollableOutputStream` can be converted into an `AsyncRead` /
`AsyncWrite`, and by this allows integration with the wider Rust async ecosystem. In this case a
`gio` TCP connection is wrapped in a TLS connection provided by the `async-tls` crate, which uses
`rustls` as underlying TLS implementation.

### GTK4

We have initial GTK4 bindings now, which are the result of [@sfanxiang][@sfanxiang]'s
GSoC project this year. While not part of this release because GTK4 itself is still not API stable,
you can also try it from git. The GTK4 bindings can be found [here](https://github.com/gtk-rs/gtk4).
Once there are release candidates of GTK4 we will also do alpha releases of the bindings.

### Cairo improvements

The `cairo` bindings now consistently return `Result`s for various functions instead of sometimes
`Option`s, sometimes silently failing. Many `cairo` operations return an actual `Surface` in an
error state if something goes wrong, and this surface will then (usually silently) fail any future
operations on it. Instead of returning the surface, an `Err` is returned now as it should.

### GTK Builder improvements

In `gtk::Builder` UI description files it is possible to declare signal handlers for the widgets.
While it's not possible to connect them automatically to functions in Rust in a safe way, it is now
possible for applications to implement the connection logic themselves based on the information from
the UI description. `gtk::Builder::connect_signals_full()` allows to provide closures for each
signal handler name that is given in the UI description.

### `glib::Value::get` improvements

`glib::Value::get()` was changed to allow distinguishing between the value containing a `None` and
trying to get a value of the wrong type out of it. This means that it now returns a `Result`, and
also that for types that can't possibly be `None` (e.g. integer types), `Value::get_some()` is
provided as a helper to not require unwrapping the returned `Option` from the normal `Value::get()`.

That's it for biggest changes. A lot of other small ones are in as well. So enjoy!

### Changes

For the interested ones, here is the list of the merged pull requests:

[sys](https://github.com/gtk-rs/sys):

 * [Update with eoan's gir-files](https://github.com/gtk-rs/sys/pull/138)
 * [Add gtk4 files](https://github.com/gtk-rs/sys/pull/145)
 * [Remove graphene](https://github.com/gtk-rs/sys/pull/149)
 * [Update minimum rust version to 1.39](https://github.com/gtk-rs/sys/pull/155)
 * [Use tempfile in tests](https://github.com/gtk-rs/sys/pull/154)

[glib](https://github.com/gtk-rs/glib):

 * [New version](https://github.com/gtk-rs/glib/pull/502)
 * [Zeroed](https://github.com/gtk-rs/glib/pull/505)
 * [Fix handling of GValues containing a floating GObject](https://github.com/gtk-rs/glib/pull/506)
 * [Implement FromGlib and ToGlib traits on Pid type](https://github.com/gtk-rs/glib/pull/508)
 * [Mark ByteArray::set_size() as unsafe](https://github.com/gtk-rs/glib/pull/512)
 * [Value::get: return a Result to account for type mismatch...](https://github.com/gtk-rs/glib/pull/513)
 * [Remove tests which panic in signals](https://github.com/gtk-rs/glib/pull/519)
 * [value::GetError: add a constructor and make fields public](https://github.com/gtk-rs/glib/pull/517)
 * [Improve docs.rs documentation](https://github.com/gtk-rs/glib/pull/511)
 * [Remove subclass feature](https://github.com/gtk-rs/glib/pull/521)
 * [Fully qualify inner macros for exported macros...](https://github.com/gtk-rs/glib/pull/522)
 * [Fix invalid cargo key for docs.rs](https://github.com/gtk-rs/glib/pull/524)
 * [Implement Value::transform()](https://github.com/gtk-rs/glib/pull/525)
 * [remove not needed anymore libffi fix](https://github.com/gtk-rs/glib/pull/528)
 * [Use MainContext::with_thread_default() instead of pushing/popping man…](https://github.com/gtk-rs/glib/pull/529)
 * [Update to futures 0.3](https://github.com/gtk-rs/glib/pull/531)
 * [Add clone macro](https://github.com/gtk-rs/glib/pull/527)
 * [Extend clone macro](https://github.com/gtk-rs/glib/pull/534)
 * [Support downgrade on references as well](https://github.com/gtk-rs/glib/pull/535)
 * [Don't leak missing Safety doc clippy warnings (#538)](https://github.com/gtk-rs/glib/pull/539)
 * [Remove unneeded `allow(clippy::missing_safety_doc)` attributes (538)](https://github.com/gtk-rs/glib/pull/540)
 * [Add renaming support](https://github.com/gtk-rs/glib/pull/536)
 * [API additions for connecting non-Send closures and thread-safety fixes to the main context channel and futures](https://github.com/gtk-rs/glib/pull/541)
 * [Remove Send bound from SourceFuture/SourceStream](https://github.com/gtk-rs/glib/pull/542)
 * [KeyFile::get_string() can return a string in error case that still ha…](https://github.com/gtk-rs/glib/pull/544)
 * [Remove glib_floating_reference_guard!() macro](https://github.com/gtk-rs/glib/pull/548)
 * [Manually implement FFI code for GObject instead of using glib_shared_wrapper!](https://github.com/gtk-rs/glib/pull/547)

[cairo](https://github.com/gtk-rs/cairo):

 * [Fix warnings](https://github.com/gtk-rs/cairo/pull/271)
 * [Reexport the Gradient type too.](https://github.com/gtk-rs/cairo/pull/273)
 * [Replace mem::uninitialized calls](https://github.com/gtk-rs/cairo/pull/276)
 * [Make winapi optional.](https://github.com/gtk-rs/cairo/pull/280)
 * [cairo-sys: align win32-surface feature gates with those in cairo](https://github.com/gtk-rs/cairo/pull/281)
 * [Improve docs.rs documentation](https://github.com/gtk-rs/cairo/pull/283)
 * [Fix invalid cargo key for docs.rs](https://github.com/gtk-rs/cairo/pull/284)
 * [Improve cairo library documentation](https://github.com/gtk-rs/cairo/pull/288)
 * [Include crate features in docs](https://github.com/gtk-rs/cairo/pull/286)
 * [Add lib.rs to ignore purge files](https://github.com/gtk-rs/cairo/pull/289)
 * [Add cargo fmt check](https://github.com/gtk-rs/cairo/pull/291)
 * [remove not needed anymore libffi fix](https://github.com/gtk-rs/cairo/pull/292)
 * [(#251): Surface::create_similar() and friends should return a Result](https://github.com/gtk-rs/cairo/pull/287)
 * [SvgSurface: make filename param optional](https://github.com/gtk-rs/cairo/pull/294)

[sourceview](https://github.com/gtk-rs/sourceview):

 * [Fix boxing in async func](https://github.com/gtk-rs/sourceview/pull/107)
 * [Improve docs.rs documentation](https://github.com/gtk-rs/sourceview/pull/105)
 * [better handling of dox feature](https://github.com/gtk-rs/sourceview/pull/108)
 * [Use IsA for property setters](https://github.com/gtk-rs/sourceview/pull/110)
 * [Generate builders](https://github.com/gtk-rs/sourceview/pull/111)
 * [Builder use implemented interfaces properties](https://github.com/gtk-rs/sourceview/pull/112)
 * [Fix invalid cargo key for docs.rs](https://github.com/gtk-rs/sourceview/pull/113)
 * [Use tempfile in tests](https://github.com/gtk-rs/sourceview/pull/115)
 * [Derive Default, Clone for builders](https://github.com/gtk-rs/sourceview/pull/116)
 * [Regen](https://github.com/gtk-rs/sourceview/pull/117)

[atk](https://github.com/gtk-rs/atk):

 * [Improve docs.rs documentation](https://github.com/gtk-rs/atk/pull/35)
 * [Update for new `Value::get` signature](https://github.com/gtk-rs/atk/pull/36)
 * [better handling of docs.rs features](https://github.com/gtk-rs/atk/pull/37)
 * [Use IsA for property setters](https://github.com/gtk-rs/atk/pull/38)
 * [Fix invalid cargo key for docs.rs](https://github.com/gtk-rs/atk/pull/39)
 * [remove not needed anymore libffi fix](https://github.com/gtk-rs/atk/pull/40)
 * [Update minimum required rust version](https://github.com/gtk-rs/atk/pull/44)

[gio](https://github.com/gtk-rs/gio):

 * [Fix docs for manual functions \[ci skip\]](https://github.com/gtk-rs/gio/pull/224)
 * [New version](https://github.com/gtk-rs/gio/pull/227)
 * [Generate FileEnumerator](https://github.com/gtk-rs/gio/pull/229)
 * [Improve docs.rs documentation](https://github.com/gtk-rs/gio/pull/231)
 * [Update for new `Value::get` signature](https://github.com/gtk-rs/gio/pull/233)
 * [settings: add SettingsExtManual Trait for get::&lt;T&gt;/set::&lt;T&gt; fn](https://github.com/gtk-rs/gio/pull/226)
 * [Fix boxing in async func](https://github.com/gtk-rs/gio/pull/232)
 * [Ignore AppInfo::launch_uris_async](https://github.com/gtk-rs/gio/pull/237)
 * [Add support for subclassing Input/OutputStream](https://github.com/gtk-rs/gio/pull/238)
 * [Remove subclass feature](https://github.com/gtk-rs/gio/pull/239)
 * [Use IsA for property setters](https://github.com/gtk-rs/gio/pull/240)
 * [Remove ignoring not generated property](https://github.com/gtk-rs/gio/pull/241)
 * [Fix invalid cargo key for docs.rs](https://github.com/gtk-rs/gio/pull/243)
 * [IsA&lt;Cancellable&gt; generic instead of concrete Option&lt;&Cancellable&gt;](https://github.com/gtk-rs/gio/pull/242)
 * [Fix/silence various clippy warnings and errors](https://github.com/gtk-rs/gio/pull/244)
 * [Change UnixMountPoint getters to not require &mut self](https://github.com/gtk-rs/gio/pull/246)
 * [remove not needed anymore libffi fix](https://github.com/gtk-rs/gio/pull/248)
 * [Don't re-export glib types](https://github.com/gtk-rs/gio/pull/249)
 * [Regen and prelude fixes](https://github.com/gtk-rs/gio/pull/250)
 * [Update to stabilized futures](https://github.com/gtk-rs/gio/pull/252)
 * [More types](https://github.com/gtk-rs/gio/pull/251)
 * [Don't reexport prelude content](https://github.com/gtk-rs/gio/pull/253)
 * [Fix use statements in the tests](https://github.com/gtk-rs/gio/pull/254)
 * [Some updates to the I/O streams](https://github.com/gtk-rs/gio/pull/256)
 * [Update GioFuture to not require fragile crate usage by all users anymore](https://github.com/gtk-rs/gio/pull/258)
 * [Derive Default, Clone for builders](https://github.com/gtk-rs/gio/pull/259)
 * [Remove usage of glib_floating_reference_guard!()](https://github.com/gtk-rs/gio/pull/260)
 * [Fix some clippy warnings by removing unused lifetime parameters](https://github.com/gtk-rs/gio/pull/261)

[pango](https://github.com/gtk-rs/pango):

 * [Improve docs.rs documentation](https://github.com/gtk-rs/pango/pull/157)
 * [(#156): Manual implementations of PangoGravity functions](https://github.com/gtk-rs/pango/pull/158)
 * [Improve docs.rs handling](https://github.com/gtk-rs/pango/pull/159)
 * [Fix invalid cargo key for docs.rs](https://github.com/gtk-rs/pango/pull/162)
 * [Add pango-glyph interfaces ](https://github.com/gtk-rs/pango/pull/163)
 * [remove not needed anymore libffi fix](https://github.com/gtk-rs/pango/pull/164)
 * [Add PangoAttrSize](https://github.com/gtk-rs/pango/pull/166)

[gdk-pixbuf](https://github.com/gtk-rs/gdk-pixbuf):

 * [Update for new `Value::get` signature](https://github.com/gtk-rs/gdk-pixbuf/pull/128)
 * [Improve docs.rs documentation](https://github.com/gtk-rs/gdk-pixbuf/pull/129)
 * [Improve docs.rs handling](https://github.com/gtk-rs/gdk-pixbuf/pull/130)
 * [Fix invalid cargo key for docs.rs](https://github.com/gtk-rs/gdk-pixbuf/pull/131)
 * [remove not needed anymore libffi fix](https://github.com/gtk-rs/gdk-pixbuf/pull/132)

[gdk](https://github.com/gtk-rs/gdk):

 * [Fix docs for manual functions \[ci skip\]](https://github.com/gtk-rs/gdk/pull/299)
 * [Fix build after #299](https://github.com/gtk-rs/gdk/pull/302)
 * [Improve docs.rs documentation](https://github.com/gtk-rs/gdk/pull/305)
 * [Update for new `Value::get` signature](https://github.com/gtk-rs/gdk/pull/307)
 * [Cairo interactions: auto load Pixbuf & Surface Exts](https://github.com/gtk-rs/gdk/pull/309)
 * [Fix boxing in async func](https://github.com/gtk-rs/gdk/pull/306)
 * [Fix up cairo interaction extension traits](https://github.com/gtk-rs/gdk/pull/312)
 * [better handling of docs.rs features](https://github.com/gtk-rs/gdk/pull/313)
 * [Time coord](https://github.com/gtk-rs/gdk/pull/314)
 * [Improve get_device_history api](https://github.com/gtk-rs/gdk/pull/315)
 * [Fix invalid cargo key for docs.rs](https://github.com/gtk-rs/gdk/pull/316)
 * [remove not needed anymore libffi fix](https://github.com/gtk-rs/gdk/pull/317)
 * [Generate Keymap bindings](https://github.com/gtk-rs/gdk/pull/311)
 * [Don't reexport prelude content](https://github.com/gtk-rs/gdk/pull/319)

[gtk](https://github.com/gtk-rs/gtk):

 * [Fix docs for manual functions \[ci skip\]](https://github.com/gtk-rs/gtk/pull/832)
 * [PadController is disguised so trait don't needed](https://github.com/gtk-rs/gtk/pull/839)
 * [Make PadController::set_action_entries() public so it can actually be…](https://github.com/gtk-rs/gtk/pull/841)
 * [Implement Builder::connect_signals_full](https://github.com/gtk-rs/gtk/pull/852)
 * [Generate GtkWindowExt::set_geometry_hints](https://github.com/gtk-rs/gtk/pull/857)
 * [subclass: Get started on subclassing GtkWidget](https://github.com/gtk-rs/gtk/pull/861)
 * [Add support for overriding Widget::draw() virtual method](https://github.com/gtk-rs/gtk/pull/863)
 * [subclass: Add subclassing for GtkContainer](https://github.com/gtk-rs/gtk/pull/865)
 * [subclass: Add ContainerImpl to prelude](https://github.com/gtk-rs/gtk/pull/868)
 * [Add support for subclassing GtkBin and GtkEventBox](https://github.com/gtk-rs/gtk/pull/869)
 * [subclass/widget: Add vfuncs between child_notify and draw](https://github.com/gtk-rs/gtk/pull/864)
 * [Value get result](https://github.com/gtk-rs/gtk/pull/870)
 * [Add support for subclassing GtkWindow and GtkApplicationWindow](https://github.com/gtk-rs/gtk/pull/873)
 * [subclass: Add support for subclassing GtkBox](https://github.com/gtk-rs/gtk/pull/871)
 * [subclass/application_window: Remove unused imports](https://github.com/gtk-rs/gtk/pull/877)
 * [subclass: Add support for subclassing GtkHeaderBar](https://github.com/gtk-rs/gtk/pull/878)
 * [subclass: Add support for subclassing GtkDialog](https://github.com/gtk-rs/gtk/pull/880)
 * [Fix boxing in async func](https://github.com/gtk-rs/gtk/pull/866)
 * [Fix tests for 32bit windows](https://github.com/gtk-rs/gtk/pull/882)
 * [Improve docs.rs documentation](https://github.com/gtk-rs/gtk/pull/883)
 * [ShortcutLabel](https://github.com/gtk-rs/gtk/pull/885)
 * [Remove subclass feature](https://github.com/gtk-rs/gtk/pull/888)
 * [Use IsA for property setters](https://github.com/gtk-rs/gtk/pull/889)
 * [Builder use implemented interfaces properties](https://github.com/gtk-rs/gtk/pull/894)
 * [Fix invalid cargo key for docs.rs](https://github.com/gtk-rs/gtk/pull/896)
 * [Get rid of Uninitialized impl for TargetEntry](https://github.com/gtk-rs/gtk/pull/899)
 * [subclass: Implement subclassing for GtkStack](https://github.com/gtk-rs/gtk/pull/879)
 * [NativeDialog: have run return ResponseType](https://github.com/gtk-rs/gtk/pull/900)
 * [Warn on macos when initializing from non_main_thread](https://github.com/gtk-rs/gtk/pull/901)
 * [Fix format issue](https://github.com/gtk-rs/gtk/pull/903)
 * [remove not needed anymore libffi fix](https://github.com/gtk-rs/gtk/pull/904)
 * [subclass: Always allow to override the vfuns of classes](https://github.com/gtk-rs/gtk/pull/908)
 * [Fix various imports to fix the build](https://github.com/gtk-rs/gtk/pull/911)
 * [Make AccelGroup::connect() and ::connect_by_path() more usable](https://github.com/gtk-rs/gtk/pull/915)
 * [Add renaming for WidgetExt::set_name and BuildableExt::set_name](https://github.com/gtk-rs/gtk/pull/917)
 * [Derive Default for builders](https://github.com/gtk-rs/gtk/pull/919)
 * [subclass/container: widget in set_focus_child should be Nullable](https://github.com/gtk-rs/gtk/pull/922)
 * [subclass/widget: Implement default handling for parent events](https://github.com/gtk-rs/gtk/pull/921)

[pangocairo](https://github.com/gtk-rs/pangocairo):

 * [Fix docs for manual functions \[ci skip\]](https://github.com/gtk-rs/pangocairo/pull/53)
 * [Improve docs.rs documentation](https://github.com/gtk-rs/pangocairo/pull/54)
 * [Fix invalid cargo key for docs.rs](https://github.com/gtk-rs/pangocairo/pull/55)
 * [remove not needed anymore libffi fix](https://github.com/gtk-rs/pangocairo/pull/57)
 * [Fix build and reexports](https://github.com/gtk-rs/pangocairo/pull/59)
 * [Make FontMap::set_default() a static function and allow passing None …](https://github.com/gtk-rs/pangocairo/pull/62)

[gtk-test](https://github.com/gtk-rs/gtk-test):

 * [Update to last versions](https://github.com/gtk-rs/gtk-test/pull/32)


All this was possible thanks to the [gtk-rs/gir](https://github.com/gtk-rs/gir) project as well:

 * [Add overriding for function trait for manual implemented functions](https://github.com/gtk-rs/gir/pull/798)
 * [Don't derive Copy, Clone for truncated in sys mode](https://github.com/gtk-rs/gir/pull/802)
 * [Parse "doc-deprecated" tag in alias](https://github.com/gtk-rs/gir/pull/804)
 * [Use new mem::uninitialized API](https://github.com/gtk-rs/gir/pull/806)
 * [Parse "doc-deprecated" tag in class and interface](https://github.com/gtk-rs/gir/pull/810)
 * [Prevent invalid function parameter order on async callback by not enforcing it](https://github.com/gtk-rs/gir/pull/814)
 * [Handle glib::Pid conversions specifically](https://github.com/gtk-rs/gir/pull/817)
 * [Handle doc generation for docs.rs](https://github.com/gtk-rs/gir/pull/820)
 * [Use dox instead of creating new feature](https://github.com/gtk-rs/gir/pull/822)
 * [Migrate property getters to new signature for `Value::get`](https://github.com/gtk-rs/gir/pull/825)
 * [Refactor Imports](https://github.com/gtk-rs/gir/pull/826)
 * [Add flag to disable future generation](https://github.com/gtk-rs/gir/pull/830)
 * [Add link to gir reference](https://github.com/gtk-rs/gir/pull/833)
 * [Add link to schema for .gir files](https://github.com/gtk-rs/gir/pull/837)
 * [Fall back for "type-name" for objects](https://github.com/gtk-rs/gir/pull/836)
 * [Use IsA for property setters for non-final objects](https://github.com/gtk-rs/gir/pull/838)
 * [Correctly detect not generated builders](https://github.com/gtk-rs/gir/pull/842)
 * [Class builder includes properties of  implemented interfaces](https://github.com/gtk-rs/gir/pull/843)
 * [Docs rs](https://github.com/gtk-rs/gir/pull/846)
 * [Use Box&lt;dyn Error&gt; instead of Box&lt;Error&gt;](https://github.com/gtk-rs/gir/pull/848)
 * [Remove some duplicate clone calls](https://github.com/gtk-rs/gir/pull/852)
 * [Fix merge conflict](https://github.com/gtk-rs/gir/pull/854)
 * [Allow nullable callbacks](https://github.com/gtk-rs/gir/pull/816)
 * [Add generic parameters to builder methods](https://github.com/gtk-rs/gir/pull/853)
 * [Fix invalid import add](https://github.com/gtk-rs/gir/pull/858)
 * [Remove dependencies](https://github.com/gtk-rs/gir/pull/855)
 * [Extend gpointer to void\*](https://github.com/gtk-rs/gir/pull/860)
 * [Fix missing parenthesis on return types](https://github.com/gtk-rs/gir/pull/861)
 * [Add missing from_glib conversion for Pid](https://github.com/gtk-rs/gir/pull/864)
 * [Correctly generate glib::Error import](https://github.com/gtk-rs/gir/pull/863)
 * [Provide the full path to the Inhibit type for signals](https://github.com/gtk-rs/gir/pull/866)
 * [Ignore function-macro tag to prevent warnings](https://github.com/gtk-rs/gir/pull/868)
 * [Generate pinned box futures and use the stabilized futures](https://github.com/gtk-rs/gir/pull/869)
 * [Format](https://github.com/gtk-rs/gir/pull/871)
 * [Migrate to `tempfile` from deprecated `temdir`](https://github.com/gtk-rs/gir/pull/870)
 * [Rename](https://github.com/gtk-rs/gir/pull/873)
 * [Generate GIO futures code a bit more simple and without requiring all…](https://github.com/gtk-rs/gir/pull/875)
 * [Add deriving Default, Clone to builders](https://github.com/gtk-rs/gir/pull/876)
 * [Fix off-by-one line numbers in xmlparser::ErrorEmitter](https://github.com/gtk-rs/gir/pull/877)
 * [generate imports in the same order as rustfmt](https://github.com/gtk-rs/gir/pull/878)

Thanks to all of our contributors for their (awesome!) work on this release:

 * [@alatiera](https://github.com/alatiera)
 * [@alex179ohm](https://github.com/alex179ohm)
 * [@antoyo](https://github.com/antoyo)
 * [@bilelmoussaoui](https://github.com/bilelmoussaoui)
 * [@BrainBlasted](https://github.com/BrainBlasted)
 * [@Cogitri](https://github.com/Cogitri)
 * [@EPashkin](https://github.com/EPashkin)
 * [@federicomenaquintero](https://github.com/federicomenaquintero)
 * [@fengalin](https://github.com/fengalin)
 * [@GuillaumeGomez](https://github.com/GuillaumeGomez)
 * [@Hofer-Julian](https://github.com/Hofer-Julian)
 * [@jangernert](https://github.com/jangernert)
 * [@nipunn1313](https://github.com/nipunn1313)
 * [@RazrFalcon](https://github.com/RazrFalcon)
 * [@sdroege](https://github.com/sdroege)
 * [@sfanxiang][@sfanxiang]
 * [@silwol](https://github.com/silwol)
 * [@timbodeit](https://github.com/timbodeit)
 * [@velyan](https://github.com/velyan)
 * [@sfanxiang]: https://github.com/sfanxiang

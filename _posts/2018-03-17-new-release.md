---
layout: post
author: GuillaumeGomez
title: New release, gio focused
categories: [front, crates]
date: 2018-03-17 18:00:00 +0000
---

Hi everyone!

Now is the time for a new __Gtk-rs__ release! As said in the title, this time we focused our efforts on gio. A lot of types were missing, but thanks to this release, we made great improvements!

Of course, this isn't all we worked on in this release. For instance, we added support for the newer libraries' version, made a few things better and fixed some others.

We hope this new release will make your usage of __Gtk-rs__ even better. Have fun !

### Changes

For the interested ones, here is the list of the (major) changes:

[sys](https://github.com/gtk-rs/sys):

 * [Fixed links in the README](https://github.com/gtk-rs/sys/pull/75)
 * [all around: disable print_system_libs in calls to pkg-config](https://github.com/gtk-rs/sys/pull/80)
 * [Generate GtkAtom and GIConv as disguised types](https://github.com/gtk-rs/sys/pull/79)
 * [Generate unions](https://github.com/gtk-rs/sys/pull/78)
 * [include LICENSE to sub-crates](https://github.com/gtk-rs/sys/pull/74)
 * [Regen with custom modules](https://github.com/gtk-rs/sys/pull/77)
 * [Generate more functions](https://github.com/gtk-rs/sys/pull/76)

[cairo](https://github.com/gtk-rs/cairo):

 * [Add MIT license file to sys crate](https://github.com/gtk-rs/cairo/pull/174)
 * [deps: don't restrict c_vec version](https://github.com/gtk-rs/cairo/pull/173)
 * [Use winapi 0.3.2 on windows](https://github.com/gtk-rs/cairo/pull/169)

[sourceview](https://github.com/gtk-rs/sourceview):

 * [Revert "Remove callback_guard"](https://github.com/gtk-rs/sourceview/pull/43)
 * [Remove gir-files from crate](https://github.com/gtk-rs/sourceview/pull/41)
 * [Generate unions in sourceview-sys](https://github.com/gtk-rs/sourceview/pull/40)
 * [Remove unnecessary properties](https://github.com/gtk-rs/sourceview/pull/39)
 * [Make CI test sourceview, not examples](https://github.com/gtk-rs/sourceview/pull/37)
 * [Add MIT license file to sys crate](https://github.com/gtk-rs/sourceview/pull/34)
 * [Fix docs feature dependence](https://github.com/gtk-rs/sourceview/pull/29)
 * [Typed properties](https://github.com/gtk-rs/sourceview/pull/28)

[glib](https://github.com/gtk-rs/glib):

 * [Implement StaticType for Type](https://github.com/gtk-rs/glib/pull/297)
 * [Revert "Deprecate CallbackGuard"](https://github.com/gtk-rs/glib/pull/295)
 * [Deprecate CallbackGuard](https://github.com/gtk-rs/glib/pull/293)
 * [boxed, shared, object: impl FromGlibPtrNone for const](https://github.com/gtk-rs/glib/pull/291)
 * [Add GIOCondition](https://github.com/gtk-rs/glib/pull/290)
 * [Remove Default impl for SourceId](https://github.com/gtk-rs/glib/pull/288)
 * [Simplify KeyFile::to_data](https://github.com/gtk-rs/glib/pull/287)
 * [Unignore markup_escape_text](https://github.com/gtk-rs/glib/pull/286)
 * [Fix Char tests on platforms where c_char is u8 instead of i8](https://github.com/gtk-rs/glib/pull/285)
 * [Const override](https://github.com/gtk-rs/glib/pull/278)
 * [Char wrapper 2](https://github.com/gtk-rs/glib/pull/274)
 * [Allow FnOnce for MainContext::invoke()](https://github.com/gtk-rs/glib/pull/277)
 * [Allow creating Bytes from any AsRef&lt;[u8]&gt; by copying or taking ownership of it](https://github.com/gtk-rs/glib/pull/276)
 * [Add bindings for g_file_test() and make use of it in the Path transla…](https://github.com/gtk-rs/glib/pull/273)
 * [Add Char wrapper; implement KeyFile::set_list_separator() with it](https://github.com/gtk-rs/glib/pull/248)
 * [Don't call g_value_unset() on zeroed GValues](https://github.com/gtk-rs/glib/pull/272)
 * [Fix ToGlibContainerFromSlice impls for strings, boxed/object/shared s…](https://github.com/gtk-rs/glib/pull/270)
 * [Don't leak the GList/GSList in the from_glib_full_as_vec() impls for …](https://github.com/gtk-rs/glib/pull/271)
 * [Various Path FFI improvements](https://github.com/gtk-rs/glib/pull/269)
 * [bump lazy_static to 1.0](https://github.com/gtk-rs/glib/pull/268)
 * [Add Value::from_type() to initialize an empty value from a Type](https://github.com/gtk-rs/glib/pull/266)
 * [Implement Value traits for Vec&lt;String&gt; more consistently](https://github.com/gtk-rs/glib/pull/264)
 * [Add ToGlibContainerFromSlice impls for *const GList / GSList](https://github.com/gtk-rs/glib/pull/261)

[gio](https://github.com/gtk-rs/gio):

 * [Use single_version_file option](https://github.com/gtk-rs/gio/pull/92)
 * [bind IOErrorEnum](https://github.com/gtk-rs/gio/pull/91)
 * [Restore callback guard](https://github.com/gtk-rs/gio/pull/90)
 * [Bind TlsFileDatabase](https://github.com/gtk-rs/gio/pull/89)
 * [More Tls bindings: missing files](https://github.com/gtk-rs/gio/pull/87)
 * [Generate Seekable](https://github.com/gtk-rs/gio/pull/88)
 * [More tls bindings](https://github.com/gtk-rs/gio/pull/83)
 * [Generate File{Input,Output,IO}Stream automatically](https://github.com/gtk-rs/gio/pull/86)
 * [Async callbacks](https://github.com/gtk-rs/gio/pull/85)
 * [Remove callback_guard](https://github.com/gtk-rs/gio/pull/84)
 * [Make stub traits under feature="dox" public to include in doc](https://github.com/gtk-rs/gio/pull/81)
 * [Fix doc build](https://github.com/gtk-rs/gio/pull/80)
 * [Fix-up Socket::create_source() implementation](https://github.com/gtk-rs/gio/pull/79)
 * [Add lots of Socket related bindings](https://github.com/gtk-rs/gio/pull/78)
 * [Remove unnecessary parentheses and properties](https://github.com/gtk-rs/gio/pull/77)
 * [trivial: GLib -> Gio in description](https://github.com/gtk-rs/gio/pull/73)
 * [Generate streams](https://github.com/gtk-rs/gio/pull/69)
 * [New types](https://github.com/gtk-rs/gio/pull/70)
 * [Typed properties](https://github.com/gtk-rs/gio/pull/66)
 * [Async code generation](https://github.com/gtk-rs/gio/pull/63)

[pango](https://github.com/gtk-rs/pango):

 * [Remove manual FromGlibPtrNone&lt;*const&gt; implementations](https://github.com/gtk-rs/pango/pull/101)

[gdk-pixbuf](https://github.com/gtk-rs/gdk-pixbuf):

 * [Revert "Remove callback_guard"](https://github.com/gtk-rs/gdk-pixbuf/pull/67)
 * [Remove missed callback_guard](https://github.com/gtk-rs/gdk-pixbuf/pull/66)
 * [Remove gir-files from crate](https://github.com/gtk-rs/gdk-pixbuf/pull/64)
 * [Regen for Gdk-Pixbuf v2.36.8](https://github.com/gtk-rs/gdk-pixbuf/pull/61)
 * [Fix Pixbuf::put_pixel when alpha channel disabled](https://github.com/gtk-rs/gdk-pixbuf/pull/60)
 * [Fix PixbufFormat, regen Pixbuf](https://github.com/gtk-rs/gdk-pixbuf/pull/57)

[gdk](https://github.com/gtk-rs/gdk):

 * [Revert missed file for "Remove callback_guard"](https://github.com/gtk-rs/gdk/pull/209)
 * [Revert "Remove callback_guard"](https://github.com/gtk-rs/gdk/pull/208)
 * [Remove unnecessary properties](https://github.com/gtk-rs/gdk/pull/203)
 * [Typed properties](https://github.com/gtk-rs/gdk/pull/199)

[gtk](https://github.com/gtk-rs/gtk):

 * [Generate WidgetPath](https://github.com/gtk-rs/gtk/pull/630)
 * [Restore callback guard](https://github.com/gtk-rs/gtk/pull/631)
 * [Change version for Gtk.PadActionType](https://github.com/gtk-rs/gtk/pull/629)
 * [Fix TargetList::new implementation](https://github.com/gtk-rs/gtk/pull/622)
 * [Expose gtk_clipboard_set_with_data.](https://github.com/gtk-rs/gtk/pull/617)
 * [Regen for Gtk 3.22.26](https://github.com/gtk-rs/gtk/pull/620)
 * [Remove unnecessary parentheses and add missed properties](https://github.com/gtk-rs/gtk/pull/619)
 * [Add signal Overlay::get-child-position](https://github.com/gtk-rs/gtk/pull/613)
 * [Add WidgetExt::add_tick_callback binding](https://github.com/gtk-rs/gtk/pull/611)
 * [Add support for file chooser buttons](https://github.com/gtk-rs/gtk/pull/602)
 * [Generate new types](https://github.com/gtk-rs/gtk/pull/604)
 * [Change version for Gtk.StyleContextPrintFlags](https://github.com/gtk-rs/gtk/pull/603)
 * [Fix button role version](https://github.com/gtk-rs/gtk/pull/601)
 * [Typed properties](https://github.com/gtk-rs/gtk/pull/599)
 * [Print operation](https://github.com/gtk-rs/gtk/pull/596)

All this was possible thanks to the [gtk-rs/gir](https://github.com/gtk-rs//gir) project as well:
 * [Sort types and constants used in ABI tests by name at generation time.](https://github.com/gtk-rs/pangocairo/pull/570)
 * [ Support libraries with customized crate name when generating tests.](https://github.com/gtk-rs/pangocairo/pull/569)
 * [Include constants from enums and bitfields in ABI validation.](https://github.com/gtk-rs/pangocairo/pull/568)
 * [Cross validate constants in XML with those from C.](https://github.com/gtk-rs/pangocairo/pull/565)
 * [Cross validate Rust ABI with C ABI.](https://github.com/gtk-rs/pangocairo/pull/558)
 * [Cleanup redundant field names in struct initialization.](https://github.com/gtk-rs/pangocairo/pull/564)
 * [Use GObject status when generating types](https://github.com/gtk-rs/pangocairo/pull/563)
 * [Add single_version_file option](https://github.com/gtk-rs/pangocairo/pull/561)
 * [Use info instead of println in codegen.](https://github.com/gtk-rs/pangocairo/pull/560)
 * [Revert "Remove adding callback_guard"](https://github.com/gtk-rs/pangocairo/pull/559)
 * [Add support for string constants](https://github.com/gtk-rs/pangocairo/pull/557)
 * [codegen/build.rs: disable print_system_libs in calls to pkg-config](https://github.com/gtk-rs/pangocairo/pull/553)
 * [Prioritize RecordType::Refcounted over other record types](https://github.com/gtk-rs/pangocairo/pull/552)
 * [Fix panic on generating gdk-pixbuf-sys](https://github.com/gtk-rs/pangocairo/pull/551)
 * [Add glib::Priority as custom type, replace priorities in async functi…](https://github.com/gtk-rs/pangocairo/pull/550)
 * [Add support for async functions that have a non-trivial ..](https://github.com/gtk-rs/pangocairo/pull/548)
 * [Remove adding callback_guard](https://github.com/gtk-rs/pangocairo/pull/547)
 * [Alternative of General support for disguised types](https://github.com/gtk-rs/pangocairo/pull/546)
 * [General support for disguised types, but enabled only for GdkAtom and…](https://github.com/gtk-rs/pangocairo/pull/544)
 * [Allow generate record with g_boxed_copy and g_boxed_free](https://github.com/gtk-rs/pangocairo/pull/545)
 * [Add repositories urls in head comment](https://github.com/gtk-rs/pangocairo/pull/541)
 * [Update readme](https://github.com/gtk-rs/pangocairo/pull/540)
 * [doc: allow specifying a separate target path](https://github.com/gtk-rs/pangocairo/pull/539)
 * [Refactor imports.](https://github.com/gtk-rs/pangocairo/pull/538)
 * [Cleanup unused and commented out code.](https://github.com/gtk-rs/pangocairo/pull/536)
 * [Fix use declarations when generating code for glib.](https://github.com/gtk-rs/pangocairo/pull/537)
 * [Fix clippy warnings](https://github.com/gtk-rs/pangocairo/pull/532)
 * [Higher level API for XML parsing.](https://github.com/gtk-rs/pangocairo/pull/533)
 * [Include default value in to_bool function.](https://github.com/gtk-rs/pangocairo/pull/531)
 * [Allow non_snake_case to silence warnings in generated code.](https://github.com/gtk-rs/pangocairo/pull/530)
 * [Unions: Remove feature-gate for stable rustc](https://github.com/gtk-rs/pangocairo/pull/415)
 * [Union, Clone and Copy](https://github.com/gtk-rs/pangocairo/pull/527)
 * [Update dependencies](https://github.com/gtk-rs/pangocairo/pull/528)
 * [ Fill missing c:type in fields in postprocessing phase.](https://github.com/gtk-rs/pangocairo/pull/526)
 * [Fix property parent check](https://github.com/gtk-rs/pangocairo/pull/524)
 * [Remove unnecessary parentheses in async trampoline result](https://github.com/gtk-rs/pangocairo/pull/525)
 * [Avoid to generate variable names which are keywords](https://github.com/gtk-rs/pangocairo/pull/521)
 * [Fix async for boxed ](https://github.com/gtk-rs/pangocairo/pull/522)
 * [Generate deprecated attribute on deprecated functions](https://github.com/gtk-rs/pangocairo/pull/518)
 * [Generate const_override for objects trait functions that have const p…](https://github.com/gtk-rs/pangocairo/pull/515)
 * [Add detecting and including custom modules on sys mode](https://github.com/gtk-rs/pangocairo/pull/514)
 * [Various async function improvements](https://github.com/gtk-rs/pangocairo/pull/509)
 * [Fix renamed trait docs](https://github.com/gtk-rs/pangocairo/pull/501)
 * [Add generation `Char` and `UChar` parameters](https://github.com/gtk-rs/pangocairo/pull/489)
 * [Add new mode to see not bound type](https://github.com/gtk-rs/pangocairo/pull/505)
 * [Add version override for enums and flags](https://github.com/gtk-rs/pangocairo/pull/503)
 * [Use new Value::from_type() function for property getters](https://github.com/gtk-rs/pangocairo/pull/498)
 * [Get rid of some unneeded transmutes and other special cases for enum/…](https://github.com/gtk-rs/pangocairo/pull/496)
 * [Fix invalid [c_void] debug implementation](https://github.com/gtk-rs/pangocairo/pull/497)
 * [Add callback_guard to async trampolines](https://github.com/gtk-rs/pangocairo/pull/494)
 * [Add async method code generation](https://github.com/gtk-rs/pangocairo/pull/490)
 * [Add `use gio_ffi` if needed](https://github.com/gtk-rs/pangocairo/pull/493)
 * [Spelling correction in README.md](https://github.com/gtk-rs/pangocairo/pull/492)

Thanks to all of our contributors for their (awesome!) work for this release:

 * [@RazrFalcon](https://github.com/RazrFalcon)
 * [@EPashkin](https://github.com/EPashkin)
 * [@MathieuDuponchelle](https://github.com/MathieuDuponchelle)
 * [@ignatenkobrain](https://github.com/ignatenkobrain)
 * [@GuillaumeGomez](https://github.com/GuillaumeGomez)
 * [@sdroege](https://github.com/sdroege)
 * [@talklittle](https://github.com/talklittle)
 * [@tmiasko](https://github.com/tmiasko)
 * [@federicomenaquintero](https://github.com/federicomenaquintero)
 * [@ystreet](https://github.com/ystreet)
 * [@antoyo](https://github.com/antoyo)
 * [@cai-lw](https://github.com/cai-lw)
 * [@fengalin](https://github.com/fengalin)
 * [@demurgos](https://github.com/demurgos)
 * [@gbip](https://github.com/gbip)
 * [@Luke-Nukem](https://github.com/Luke-Nukem)
 * [@her001](https://github.com/her001)

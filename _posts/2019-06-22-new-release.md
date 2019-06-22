---
layout: post
author: Guillaume Gomez
title: New release: more complete, safer
categories: [front, crates]
date: 2019-06-22 14:00:00 +0000
---

* Write intro here *

### Changes

For the interested ones, here is the list of the merged pull requests:

[sys](https://github.com/gtk-rs/sys):

 * [Print some additional output on macOS if pkg-config fails](https://github.com/gtk-rs/sys/pull/141)
 * [Update minimum rust stable version](https://github.com/gtk-rs/sys/pull/140)
 * [Format code with rustfmt](https://github.com/gtk-rs/sys/pull/139)
 * [Use disguised flag](https://github.com/gtk-rs/sys/pull/137)

[glib](https://github.com/gtk-rs/glib):

 * [Update minimum rust stable version](https://github.com/gtk-rs/glib/pull/499)
 * [Move trampolines](https://github.com/gtk-rs/glib/pull/493)
 * [Implement futures-0.3 `Spawn` for `&MainContext`](https://github.com/gtk-rs/glib/pull/498)
 * [Add init/clear function for boxed types](https://github.com/gtk-rs/glib/pull/496)
 * [Format code with rustfmt](https://github.com/gtk-rs/glib/pull/497)
 * [Manually implement Clone for Sender/SyncSender](https://github.com/gtk-rs/glib/pull/495)
 * [Fix dyn and import warnings](https://github.com/gtk-rs/glib/pull/491)
 * [subclass: panic with error message when registering existing type](https://github.com/gtk-rs/glib/pull/488)
 * [Generate SpawnFlags](https://github.com/gtk-rs/glib/pull/487)
 * [Add missing traits](https://github.com/gtk-rs/glib/pull/486)
 * [Add ByteArray binding](https://github.com/gtk-rs/glib/pull/480)
 * [Always ref-sink after g_object_new() if the type inherits from GIniti…](https://github.com/gtk-rs/glib/pull/484)
 * [Run futures code and tests when building with nightly](https://github.com/gtk-rs/glib/pull/477)
 * [Port to futures 0.3](https://github.com/gtk-rs/glib/pull/476)
 * [Fix travis build](https://github.com/gtk-rs/glib/pull/475)
 * [add doc rule](https://github.com/gtk-rs/glib/pull/473)
 * [gbytes: Impl AsRef&lt;[u8]&gt;](https://github.com/gtk-rs/glib/pull/472)
 * [Remove xx_sys to xx_ffi renaming](https://github.com/gtk-rs/glib/pull/470)
 * [Add missing #[doc(hidden)]](https://github.com/gtk-rs/glib/pull/471)
 * [Fix some clippy warnings](https://github.com/gtk-rs/glib/pull/468)
 * [Regen](https://github.com/gtk-rs/glib/pull/464)
 * [Small release](https://github.com/gtk-rs/glib/pull/465)
 * [Filename from uri fix](https://github.com/gtk-rs/glib/pull/463)
 * [Don't use deprecated ATOMIC_USIZE_INIT](https://github.com/gtk-rs/glib/pull/461)
 * [gstring: Implement Hash trait](https://github.com/gtk-rs/glib/pull/462)
 * [For setting properties and the return value of signal handlers relax …](https://github.com/gtk-rs/glib/pull/457)

[cairo](https://github.com/gtk-rs/cairo):

 * [Update minimum rust stable version](https://github.com/gtk-rs/cairo/pull/268)
 * [Run everything through rustfmt](https://github.com/gtk-rs/cairo/pull/267)
 * [Rework type hierarchies](https://github.com/gtk-rs/cairo/pull/260)
 * [Run everything through rustfmt](https://github.com/gtk-rs/cairo/pull/265)
 * [Add a safe API for user data](https://github.com/gtk-rs/cairo/pull/257)
 * [Fix travis build](https://github.com/gtk-rs/cairo/pull/254)
 * [Export SurfaceExt from the private surface module](https://github.com/gtk-rs/cairo/pull/253)
 * [Fix warning](https://github.com/gtk-rs/cairo/pull/249)

[sourceview](https://github.com/gtk-rs/sourceview):

 * [Update minimum rust stable version](https://github.com/gtk-rs/sourceview/pull/99)
 * [Format code with rustfmt](https://github.com/gtk-rs/sourceview/pull/98)
 * [Move trampolines](https://github.com/gtk-rs/sourceview/pull/97)
 * [Remove traits for disguised types without children](https://github.com/gtk-rs/sourceview/pull/95)
 * [Add missing feature v3_14](https://github.com/gtk-rs/sourceview/pull/93)
 * [Port to futures 0.3](https://github.com/gtk-rs/sourceview/pull/91)
 * [Remove xx_sys to xx_ffi renaming](https://github.com/gtk-rs/sourceview/pull/90)
 * [Regen](https://github.com/gtk-rs/sourceview/pull/89)
 * [Regen with Ubuntu Discos gir-files](https://github.com/gtk-rs/sourceview/pull/86)
 * [Remove versions from git dependencies](https://github.com/gtk-rs/sourceview/pull/88)
 * [Add missing version for gtk-rs-lgpl-docs](https://github.com/gtk-rs/sourceview/pull/85)
 * [Add dist xenial and libmount-dev dependency](https://github.com/gtk-rs/sourceview/pull/84)
 * [Fix stable version for travis](https://github.com/gtk-rs/sourceview/pull/83)

[atk](https://github.com/gtk-rs/atk):

 * [Update minimum rust stable version](https://github.com/gtk-rs/atk/pull/30)
 * [Format code with rustfmt](https://github.com/gtk-rs/atk/pull/29)
 * [Move trampolines](https://github.com/gtk-rs/atk/pull/28)
 * [Fix travis build](https://github.com/gtk-rs/atk/pull/27)
 * [Fix build docs](https://github.com/gtk-rs/atk/pull/26)
 * [add doc rule](https://github.com/gtk-rs/atk/pull/25)
 * [Remove xx_sys to xx_ffi renaming](https://github.com/gtk-rs/atk/pull/24)
 * [Regen](https://github.com/gtk-rs/atk/pull/23)

[gio](https://github.com/gtk-rs/gio):

 * [Two Option-related fixes](https://github.com/gtk-rs/gio/pull/221)
 * [Update minimum rust stable version](https://github.com/gtk-rs/gio/pull/220)
 * [Format code with rustfmt](https://github.com/gtk-rs/gio/pull/219)
 * [Move trampolines](https://github.com/gtk-rs/gio/pull/218)
 * [Fix dyn warnings](https://github.com/gtk-rs/gio/pull/217)
 * [Generate new types](https://github.com/gtk-rs/gio/pull/213)
 * [Regenerate](https://github.com/gtk-rs/gio/pull/215)
 * [Add new type](https://github.com/gtk-rs/gio/pull/212)
 * [Remove traits for disguised types without children](https://github.com/gtk-rs/gio/pull/210)
 * [Fix generating docs for UnixXXXStream](https://github.com/gtk-rs/gio/pull/211)
 * [ Add Gir config for Unix{Input,Output}Stream](https://github.com/gtk-rs/gio/pull/208)
 * [Add support for subclassing gio::Application](https://github.com/gtk-rs/gio/pull/209)
 * [Port to futures 0.3](https://github.com/gtk-rs/gio/pull/206)
 * [Fix travis build](https://github.com/gtk-rs/gio/pull/205)
 * [add doc rule](https://github.com/gtk-rs/gio/pull/204)
 * [Remove xx_sys to xx_ffi renaming](https://github.com/gtk-rs/gio/pull/200)
 * [inet_address: add new_from_bytes constructor](https://github.com/gtk-rs/gio/pull/201)
 * [Fix failing test compilation](https://github.com/gtk-rs/gio/pull/202)
 * [Regen](https://github.com/gtk-rs/gio/pull/199)

[pango](https://github.com/gtk-rs/pango):

 * [Update minimum rust stable version](https://github.com/gtk-rs/pango/pull/152)
 * [Format code with rustfmt](https://github.com/gtk-rs/pango/pull/151)
 * [Remove traits for disguised types without children](https://github.com/gtk-rs/pango/pull/150)
 * [Fix pango_language_get_sample_string SIGSEGV](https://github.com/gtk-rs/pango/pull/149)
 * [Drop v1_36_7 feature](https://github.com/gtk-rs/pango/pull/147)
 * [Fix travis build](https://github.com/gtk-rs/pango/pull/146)
 * [add doc rule](https://github.com/gtk-rs/pango/pull/145)
 * [Remove xx_sys to xx_ffi renaming](https://github.com/gtk-rs/pango/pull/144)
 * [Regen](https://github.com/gtk-rs/pango/pull/143)
 * [Remove git dependency](https://github.com/gtk-rs/pango/pull/142)

[gdk-pixbuf](https://github.com/gtk-rs/gdk-pixbuf):

 * [Update minimum rust stable version](https://github.com/gtk-rs/gdk-pixbuf/pull/124)
 * [Format code with rustfmt](https://github.com/gtk-rs/gdk-pixbuf/pull/123)
 * [Move trampolines](https://github.com/gtk-rs/gdk-pixbuf/pull/122)
 * [Remove dyn warnings](https://github.com/gtk-rs/gdk-pixbuf/pull/121)
 * [Remove traits for disguised types without children](https://github.com/gtk-rs/gdk-pixbuf/pull/120)
 * [Port to futures 0.3](https://github.com/gtk-rs/gdk-pixbuf/pull/119)
 * [Fix travis build](https://github.com/gtk-rs/gdk-pixbuf/pull/118)
 * [add doc rule](https://github.com/gtk-rs/gdk-pixbuf/pull/117)
 * [Remove xx_sys to xx_ffi renaming](https://github.com/gtk-rs/gdk-pixbuf/pull/116)
 * [Regen](https://github.com/gtk-rs/gdk-pixbuf/pull/115)

[gdk](https://github.com/gtk-rs/gdk):

 * [Update minimum rust stable version](https://github.com/gtk-rs/gdk/pull/296)
 * [Update to last cairo version](https://github.com/gtk-rs/gdk/pull/295)
 * [Format code with rustfmt](https://github.com/gtk-rs/gdk/pull/294)
 * [Move trampolines](https://github.com/gtk-rs/gdk/pull/292)
 * [Remove traits for disguised types without children](https://github.com/gtk-rs/gdk/pull/293)
 * [Remove traits for disguised types without children](https://github.com/gtk-rs/gdk/pull/291)
 * [Fix travis build](https://github.com/gtk-rs/gdk/pull/289)
 * [Fix nullable trampolines](https://github.com/gtk-rs/gdk/pull/288)
 * [add doc rule](https://github.com/gtk-rs/gdk/pull/286)
 * [Fields have been generated so we can uncommented those methods](https://github.com/gtk-rs/gdk/pull/285)
 * [Remove xx_sys to xx_ffi renaming](https://github.com/gtk-rs/gdk/pull/284)
 * [Regen](https://github.com/gtk-rs/gdk/pull/282)

[gtk](https://github.com/gtk-rs/gtk):

 * [Update minimum rust stable version](https://github.com/gtk-rs/gtk/pull/829)
 * [Format code with rustfmt](https://github.com/gtk-rs/gtk/pull/827)
 * [Fix compilation](https://github.com/gtk-rs/gtk/pull/828)
 * [pad_action_entry: Fix dangling pointer](https://github.com/gtk-rs/gtk/pull/826)
 * [Generate init/clear functions for TreeIter, TextIter and Border](https://github.com/gtk-rs/gtk/pull/825)
 * [Move trampolines](https://github.com/gtk-rs/gtk/pull/824)
 * [Remove dyn warnings](https://github.com/gtk-rs/gtk/pull/823)
 * [Remove pre-init assertion to check for non-debug GTK builds](https://github.com/gtk-rs/gtk/pull/822)
 * [Get entry](https://github.com/gtk-rs/gtk/pull/819)
 * [Remove unneeded mutability for pango::TabArray](https://github.com/gtk-rs/gtk/pull/818)
 * [Regenerate](https://github.com/gtk-rs/gtk/pull/816)
 * [Remove traits for disguised types without children](https://github.com/gtk-rs/gtk/pull/812)
 * [Allow for GtkApplication to be subclasses](https://github.com/gtk-rs/gtk/pull/814)
 * [Remove manually implemented Gtk.Socket](https://github.com/gtk-rs/gtk/pull/810)
 * [Port to futures 0.3](https://github.com/gtk-rs/gtk/pull/809)
 * [remove osx image](https://github.com/gtk-rs/gtk/pull/807)
 * [Fix version for property FontChooser.level](https://github.com/gtk-rs/gtk/pull/804)
 * [try to fix osx build](https://github.com/gtk-rs/gtk/pull/805)
 * [Remove deprecated objects](https://github.com/gtk-rs/gtk/pull/801)
 * [add doc rule](https://github.com/gtk-rs/gtk/pull/800)
 * [regen](https://github.com/gtk-rs/gtk/pull/798)
 * [Remove xx_sys to xx_ffi renaming](https://github.com/gtk-rs/gtk/pull/795)
 * [builder: Move trait methods to traits](https://github.com/gtk-rs/gtk/pull/796)
 * [Overwrite return type](https://github.com/gtk-rs/gtk/pull/793)
 * [Add a special type for add_tick_callback's return value](https://github.com/gtk-rs/gtk/pull/792)
 * [[regen] No more into](https://github.com/gtk-rs/gtk/pull/791)
 * [Improve Dialog API](https://github.com/gtk-rs/gtk/pull/789)

[pangocairo](https://github.com/gtk-rs/pangocairo):

 * [Update minimum rust stable version](https://github.com/gtk-rs/pangocairo/pull/50)
 * [Format code with rustfmt](https://github.com/gtk-rs/pangocairo/pull/49)
 * [Use final types pango::Context, pango::Layout without IsA](https://github.com/gtk-rs/pangocairo/pull/48)
 * [Fix travis build](https://github.com/gtk-rs/pangocairo/pull/47)
 * [add doc rule](https://github.com/gtk-rs/pangocairo/pull/46)
 * [Remove xx_sys to xx_ffi renaming](https://github.com/gtk-rs/pangocairo/pull/45)
 * [Regen](https://github.com/gtk-rs/pangocairo/pull/44)

[gtk-test](https://github.com/gtk-rs/gtk-test):


All this was possible thanks to the [gtk-rs/gir](https://github.com/gtk-rs/gir) project as well:

 * [Add warning to gobject-sys's build script](https://github.com/gtk-rs/gir/pull/796)
 * [Add configuration for init/clear function expressions of boxed types](https://github.com/gtk-rs/gir/pull/793)
 * [Generate trampolines directly inside functions](https://github.com/gtk-rs/gir/pull/792)
 * [Fix missing callback parameter handling](https://github.com/gtk-rs/gir/pull/791)
 * [Fix trait object warning for futures](https://github.com/gtk-rs/gir/pull/790)
 * [Don't panic on ignored parameter in callback](https://github.com/gtk-rs/gir/pull/785)
 * [Fix gconstpointer fixup](https://github.com/gtk-rs/gir/pull/779)
 * [Use complete pointer type for trampoline return](https://github.com/gtk-rs/gir/pull/769)
 * [Use Option&lt;&T&gt; instead of &Option&lt;T&gt; for signal callback parameters](https://github.com/gtk-rs/gir/pull/780)
 * [Rename trait instead hiding, because your minimum version 1.31 don't …](https://github.com/gtk-rs/gir/pull/776)
 * [Don't bring trait ObjectType into scope](https://github.com/gtk-rs/gir/pull/775)
 * [Fix imports handling](https://github.com/gtk-rs/gir/pull/774)
 * [Builder setters accept references](https://github.com/gtk-rs/gir/pull/767)
 * [Add link to gir tutorial](https://github.com/gtk-rs/gir/pull/771)
 * [Improve gir errors a bit](https://github.com/gtk-rs/gir/pull/766)
 * [Ignore the &lt;attribute&gt; element in any other XML element](https://github.com/gtk-rs/gir/pull/768)
 * [Dont generate builders constraint and minor fixes](https://github.com/gtk-rs/gir/pull/765)
 * [Fix builders](https://github.com/gtk-rs/gir/pull/764)
 * [Use disguised in final types check](https://github.com/gtk-rs/gir/pull/762)
 * [Generate builder for widgets](https://github.com/gtk-rs/gir/pull/757)
 * [Rust 2018 and code formatting](https://github.com/gtk-rs/gir/pull/759)
 * [Fix callbacks](https://github.com/gtk-rs/gir/pull/761)
 * [More source position & rustfmt.toml](https://github.com/gtk-rs/gir/pull/756)
 * [Update sys cargo](https://github.com/gtk-rs/gir/pull/755)
 * [Port to futures 0.3](https://github.com/gtk-rs/gir/pull/753)
 * [Remove unneeded "mut"](https://github.com/gtk-rs/gir/pull/754)
 * [Force replacing '-' in crate name for `use`](https://github.com/gtk-rs/gir/pull/751)
 * [library_postprocessing: Don't expect c:type for FixedArray](https://github.com/gtk-rs/gir/pull/752)
 * [parser: ignore source-position](https://github.com/gtk-rs/gir/pull/750)
 * [Allow nullable trampolines with scope="call"](https://github.com/gtk-rs/gir/pull/747)
 * [Add crate name fix for webkit2xx](https://github.com/gtk-rs/gir/pull/745)
 * [Don't generate docs for totally deprecated items](https://github.com/gtk-rs/gir/pull/744)
 * [Handle nullable parameters for callbacks as well](https://github.com/gtk-rs/gir/pull/742)
 * [Fix some clippy warnings](https://github.com/gtk-rs/gir/pull/740)
 * [[ffi] Support alignment on objects](https://github.com/gtk-rs/gir/pull/739)
 * [Don't use "ffi" suffix for sys crates](https://github.com/gtk-rs/gir/pull/737)
 * [Recheck crate names usage](https://github.com/gtk-rs/gir/pull/734)
 * [Allow to overwrite returned type](https://github.com/gtk-rs/gir/pull/733)
 * [Fix use order](https://github.com/gtk-rs/gir/pull/732)
 * [Fixup](https://github.com/gtk-rs/gir/pull/728)
 * [Fix invalid crate name generation](https://github.com/gtk-rs/gir/pull/730)
 * [Remove Into trait generation](https://github.com/gtk-rs/gir/pull/724)
 * [Don't use transmute() for signal trampoline closures](https://github.com/gtk-rs/gir/pull/721)

Thanks to all of our contributors for their (awesome!) work on this release:

 * [@sdroege](https://github.com/sdroege)
 * [@GuillaumeGomez](https://github.com/GuillaumeGomez)
 * [@EPashkin](https://github.com/EPashkin)
 * [@njam](https://github.com/njam)
 * [@gdesmott](https://github.com/gdesmott)
 * [@elmarco](https://github.com/elmarco)
 * [@alatiera](https://github.com/alatiera)
 * [@philn](https://github.com/philn)
 * [@SimonSapin](https://github.com/SimonSapin)
 * [@federicomenaquintero](https://github.com/federicomenaquintero)
 * [@moggiesir](https://github.com/moggiesir)
 * [@abdulrehman-git](https://github.com/abdulrehman-git)
 * [@ignatenkobrain](https://github.com/ignatenkobrain)
 * [@sfanxiang](https://github.com/sfanxiang)
 * [@fkrull](https://github.com/fkrull)
 * [@antoyo](https://github.com/antoyo)
 * [@heftig](https://github.com/heftig)
 * [@BrainBlasted](https://github.com/BrainBlasted)

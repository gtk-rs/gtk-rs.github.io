---
layout: post
author: f
title: f
categories: [front, crates]
date: 2023-08-28 20:00:00 +0000
---

* Write intro here *

### Changes

For the interested ones, here is the list of the merged pull requests:

[gtk-rs-core](https://github.com/gtk-rs/gtk-rs-core):

 * [Don't generate unit tuple in clone macro as default-return value](https://github.com/gtk-rs/gtk-rs-core/pull/1138)
 * [Update gir-files submodule & regen](https://github.com/gtk-rs/gtk-rs-core/pull/1142)
 * [Fix docs of `glib::derived\_properties`](https://github.com/gtk-rs/gtk-rs-core/pull/1143)
 * [glib: Re-introduce an event propagation specific type](https://github.com/gtk-rs/gtk-rs-core/pull/1144)
 * [Regenerate with latest gir-files](https://github.com/gtk-rs/gtk-rs-core/pull/1150)
 * [gio: Set missing annotations for new FileInfo apis](https://github.com/gtk-rs/gtk-rs-core/pull/1151)
 * [Add typos workflow](https://github.com/gtk-rs/gtk-rs-core/pull/1153)
 * [Fix panic in gio InputStream](https://github.com/gtk-rs/gtk-rs-core/pull/1140)
 * [Added bindings for Gio.DBusObjectManager, Gio.DBusObjectManagerClientFlags](https://github.com/gtk-rs/gtk-rs-core/pull/1156)
 * [Disentangle docsrs and features](https://github.com/gtk-rs/gtk-rs-core/pull/1154)
 * [gio: Fix panics if `PollableInputStream` / `PollableOutputStream` ret…](https://github.com/gtk-rs/gtk-rs-core/pull/1159)
 * [CI: add dependabot for updating the actions](https://github.com/gtk-rs/gtk-rs-core/pull/1160)
 * [Switch to `resolver = "2"` for the workspace](https://github.com/gtk-rs/gtk-rs-core/pull/1162)
 * [image: Switch to latest fedora stable](https://github.com/gtk-rs/gtk-rs-core/pull/1163)
 * [dependabot: Enable cargo support](https://github.com/gtk-rs/gtk-rs-core/pull/1165)
 * [Add support for ext\_trait in properties macro](https://github.com/gtk-rs/gtk-rs-core/pull/1149)
 * [build(deps): update criterion requirement from 0.4.0 to 0.5.1](https://github.com/gtk-rs/gtk-rs-core/pull/1168)
 * [build(deps): update serial\_test requirement from 1 to 2](https://github.com/gtk-rs/gtk-rs-core/pull/1166)
 * [build(deps): update async-tls requirement from 0.11 to 0.12](https://github.com/gtk-rs/gtk-rs-core/pull/1167)
 * [Fix/silence various 1.72 clippy warnings](https://github.com/gtk-rs/gtk-rs-core/pull/1173)
 * [Use associated type in memory managers](https://github.com/gtk-rs/gtk-rs-core/pull/1171)

[gtk3-rs](https://github.com/gtk-rs/gtk3-rs):

 * [New 0.18 release](https://github.com/gtk-rs/gtk3-rs/pull/832)
 * [Backport #838](https://github.com/gtk-rs/gtk3-rs/pull/839)
 * [Regen](https://github.com/gtk-rs/gtk3-rs/pull/840)
 * [Backport #840](https://github.com/gtk-rs/gtk3-rs/pull/841)

[gtk4-rs](https://github.com/gtk-rs/gtk4-rs):

 * [gtk: Add a GNOME 45 feature](https://github.com/gtk-rs/gtk4-rs/pull/1431)
 * [Update gir-files submodule & regen](https://github.com/gtk-rs/gtk4-rs/pull/1432)
 * [book: Update to 0.7 release](https://github.com/gtk-rs/gtk4-rs/pull/1324)
 * [ Use gio::spawn\_blocking instead of thread::spawn ](https://github.com/gtk-rs/gtk4-rs/pull/1433)
 * [Use `derived\_properties` macro](https://github.com/gtk-rs/gtk4-rs/pull/1434)
 * [build(deps): bump actions/checkout from 2 to 3](https://github.com/gtk-rs/gtk4-rs/pull/1448)
 * [Add dependabot for github actions](https://github.com/gtk-rs/gtk4-rs/pull/1440)
 * [build(deps): bump actions/cache from 1 to 3](https://github.com/gtk-rs/gtk4-rs/pull/1445)
 * [Add typos CI workflow](https://github.com/gtk-rs/gtk4-rs/pull/1439)
 * [Regenerate with latest gir/gir-files](https://github.com/gtk-rs/gtk4-rs/pull/1444)
 * [book: Update for 0.7.1](https://github.com/gtk-rs/gtk4-rs/pull/1451)
 * [gdk: Add missing Clipboard::set](https://github.com/gtk-rs/gtk4-rs/pull/1450)
 * [Impl Write on text buffers](https://github.com/gtk-rs/gtk4-rs/pull/1452)
 * [gtk4-macro: Bump quick-xml to 0.30](https://github.com/gtk-rs/gtk4-rs/pull/1453)
 * [Untangle docsrs attribute from features](https://github.com/gtk-rs/gtk4-rs/pull/1454)
 * [Add new Path APIs](https://github.com/gtk-rs/gtk4-rs/pull/1463)
 * [Regenerate with latest gir/gir-files](https://github.com/gtk-rs/gtk4-rs/pull/1455)
 * [book: Update instructions to `v4\_12`](https://github.com/gtk-rs/gtk4-rs/pull/1465)
 * [Go back to 4\_8](https://github.com/gtk-rs/gtk4-rs/pull/1466)
 * [gdk: Make RGBA::new const and add with\_\* constructors](https://github.com/gtk-rs/gtk4-rs/pull/1468)
 * [book: Move to `std::cell::OnceCell`](https://github.com/gtk-rs/gtk4-rs/pull/1470)
 * [book: Extend memory management chapter](https://github.com/gtk-rs/gtk4-rs/pull/1459)
 * [book: Add missing snippet for `new\_task`](https://github.com/gtk-rs/gtk4-rs/pull/1472)
 * [Regenerate with latest gir/gir-files](https://github.com/gtk-rs/gtk4-rs/pull/1475)
 * [build(deps): update windows requirement from 0.48 to 0.51](https://github.com/gtk-rs/gtk4-rs/pull/1473)
 * [gdk: Rename `GdkCairoContextExt::set\_source\_{rgba =&gt; color}`](https://github.com/gtk-rs/gtk4-rs/pull/1476)
 * [Regenerate with updated gir/gir-files](https://github.com/gtk-rs/gtk4-rs/pull/1479)

All this was possible thanks to the [gtk-rs/gir](https://github.com/gtk-rs/gir) project as well:

 * [codegen: Replace ControlFlow with Propagation](https://github.com/gtk-rs/gir/pull/1485)
 * [Fix docsrs](https://github.com/gtk-rs/gir/pull/1487)
 * [Add trait\_name to API docs](https://github.com/gtk-rs/gir/pull/1489)
 * [Fix inserting all-features in Cargo.toml for docs.rs](https://github.com/gtk-rs/gir/pull/1490)
 * [build(deps): bump xml-rs from 0.8.15 to 0.8.16](https://github.com/gtk-rs/gir/pull/1492)
 * [build(deps): bump actions/cache from 1 to 3](https://github.com/gtk-rs/gir/pull/1494)
 * [build(deps): bump actions/checkout from 2 to 3](https://github.com/gtk-rs/gir/pull/1493)
 * [build(deps): bump bitflags from 2.3.1 to 2.3.3](https://github.com/gtk-rs/gir/pull/1495)
 * [build(deps): bump toml from 0.6.0 to 0.7.6](https://github.com/gtk-rs/gir/pull/1497)
 * [build(deps): bump regex from 1.8.4 to 1.9.3](https://github.com/gtk-rs/gir/pull/1496)
 * [Generated sys tests: Better command error handling](https://github.com/gtk-rs/gir/pull/1499)
 * [build(deps): bump log from 0.4.19 to 0.4.20](https://github.com/gtk-rs/gir/pull/1500)
 * [build(deps): bump bitflags from 2.3.3 to 2.4.0](https://github.com/gtk-rs/gir/pull/1501)
 * [config/codegen: Stop generating useless Display impls](https://github.com/gtk-rs/gir/pull/1502)
 * [Fix nightly clippy warnings](https://github.com/gtk-rs/gir/pull/1503)
 * [codgen: generate doc\_alias for static\_type](https://github.com/gtk-rs/gir/pull/1143)
 * [codegen: Fix PartialOrd clippy warning](https://github.com/gtk-rs/gir/pull/1504)
 * [Make auto builders/traits/functions `pub(crate)`](https://github.com/gtk-rs/gir/pull/1505)

Thanks to all of our contributors for their (awesome!) work on this release:

 * [@bilelmoussaoui](https://github.com/bilelmoussaoui)
 * [@dependabot[bot]](https://github.com/dependabot[bot])
 * [@GuillaumeGomez](https://github.com/GuillaumeGomez)
 * [@Hofer-Julian](https://github.com/Hofer-Julian)
 * [@jf2048](https://github.com/jf2048)
 * [@nicopap](https://github.com/nicopap)
 * [@pentamassiv](https://github.com/pentamassiv)
 * [@ranfdev](https://github.com/ranfdev)
 * [@RealKC](https://github.com/RealKC)
 * [@sdroege](https://github.com/sdroege)
 * [@SeaDve](https://github.com/SeaDve)

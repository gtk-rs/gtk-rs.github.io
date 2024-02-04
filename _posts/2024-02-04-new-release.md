---
layout: post
author: gtk-rs developers
title: New Release
categories: [front, crates]
date: 2024-02-04 20:00:00 +0000
---

* Write intro here *

### gtk-rs-core

* Removal of glib channels
* Removal of re-exported once_cell crate, use `std::cell::OnceCell` / `std::sync::OnceLock`
* Re-organized traits in glib
* Dynamic types support

### gtk4-rs

* GTK 4.14 APIs support
* Support `TemplateChild<T>` usage with `glib::Properties` macro

### Changes

For the interested ones, here is the list of the merged pull requests:

[gtk-rs-core](https://github.com/gtk-rs/gtk-rs-core):

* [glib: Mark panicky `BoxedAnyObject` methods as `track\_caller`](https://github.com/gtk-rs/gtk-rs-core/pull/1279)
* [add support of flags registered as dynamic types](https://github.com/gtk-rs/gtk-rs-core/pull/1271)
* [Replace usage of macro `proc\_macro\_error` with explicit propagation of  `syn::Result`](https://github.com/gtk-rs/gtk-rs-core/pull/1288)
* [Use cargo workspace features](https://github.com/gtk-rs/gtk-rs-core/pull/1296)
* [Replace `once\_cell` usage with std::sync::OnceLock](https://github.com/gtk-rs/gtk-rs-core/pull/1289)
* [Use workspace features for ffi types](https://github.com/gtk-rs/gtk-rs-core/pull/1297)
* [glib: prelude cleanup](https://github.com/gtk-rs/gtk-rs-core/pull/1095)

[gtk4-rs](https://github.com/gtk-rs/gtk4-rs):

* [gtk: Implement HasParamSpec for TemplateChild&lt;T&gt;](https://github.com/gtk-rs/gtk4-rs/pull/1495)
* [gtk4-macros: Update to proc-macro-crate 2](https://github.com/gtk-rs/gtk4-rs/pull/1506)
* [gtk: Use glib enums instead of bools where it makes sense](https://github.com/gtk-rs/gtk4-rs/pull/1512)
* [image: Use modern way of publishing the container](https://github.com/gtk-rs/gtk4-rs/pull/1566)
* [Use cargo workspace features](https://github.com/gtk-rs/gtk4-rs/pull/1579)
* [Get rid of once\_cell](https://github.com/gtk-rs/gtk4-rs/pull/1580)
* [print\_job: fix send() closure](https://github.com/gtk-rs/gtk4-rs/pull/1563)
* [examples: Add a gtk::Scale](https://github.com/gtk-rs/gtk4-rs/pull/1569)
* [examples: Add a menubar one](https://github.com/gtk-rs/gtk4-rs/pull/1570)
* [examples: Dialog's response signal handling](https://github.com/gtk-rs/gtk4-rs/pull/1514)
* [examples: async request no blocking main thread](https://github.com/gtk-rs/gtk4-rs/pull/1578)
* [examples: Add example for About Dialog](https://github.com/gtk-rs/gtk4-rs/pull/1589)
* [examples: Clean up, modernize and simplify virtual methods example](https://github.com/gtk-rs/gtk4-rs/pull/1513)
* [CI: add a cargo deny job](https://github.com/gtk-rs/gtk4-rs/pull/1576)
* [gtk::show\_about\_dialog: Set hide\_on\_close](https://github.com/gtk-rs/gtk4-rs/pull/1588)
* [gtk: Don't propagate unused argument](https://github.com/gtk-rs/gtk4-rs/pull/1591)
* [book: Extend main loop chapter with async section](https://github.com/gtk-rs/gtk4-rs/pull/1511)
* [book: Check links with lychee](https://github.com/gtk-rs/gtk4-rs/pull/1499)
* [book: Run separate jobs for check and deploy](https://github.com/gtk-rs/gtk4-rs/pull/1501)
* [book: Fix typo in memory management chapter](https://github.com/gtk-rs/gtk4-rs/pull/1504)
* [book: Rename action to correct name](https://github.com/gtk-rs/gtk4-rs/pull/1510)
* [book: Split book workflow in two](https://github.com/gtk-rs/gtk4-rs/pull/1517)
* [book: Disable playground globally](https://github.com/gtk-rs/gtk4-rs/pull/1518)
* [book: Use bounded channels instead of unbounded](https://github.com/gtk-rs/gtk4-rs/pull/1522)
* [book: Move to async-channel](https://github.com/gtk-rs/gtk4-rs/pull/1521)
* [book: Move to `install\_action`](https://github.com/gtk-rs/gtk4-rs/pull/1529)
* [book: Use new API spawn\_future\_local](https://github.com/gtk-rs/gtk4-rs/pull/1533)
* [book: Add setuptools installation](https://github.com/gtk-rs/gtk4-rs/pull/1534)
* [book: Move to libadwaita 1.4](https://github.com/gtk-rs/gtk4-rs/pull/1536)
* [book: Add clarification around creating tokio runtime](https://github.com/gtk-rs/gtk4-rs/pull/1546)
* [docs: fix composite template internal\_child -&gt; internal](https://github.com/gtk-rs/gtk4-rs/pull/1550)
* [book: Fix link to GVariant docs](https://github.com/gtk-rs/gtk4-rs/pull/1559)

All this was possible thanks to the [gtk-rs/gir](https://github.com/gtk-rs/gir) project as well:

* [codegen: Generate a doc alias for aliases](https://github.com/gtk-rs/gir/pull/1520)
* [Remove unnecessary casts of function pointers through usize](https://github.com/gtk-rs/gir/pull/1528)
* [record: Differentiate disguised vs pointer types](https://github.com/gtk-rs/gir/pull/1530)
* [parser: Don't error out for forever scope](https://github.com/gtk-rs/gir/pull/1531)
* [CI/tests: Remove gtk3 related bits](https://github.com/gtk-rs/gir/pull/1539)
* [Replace `once\_cell` crate with `std::sync::OnceLock`](https://github.com/gtk-rs/gir/pull/1532)
* [Replace once\_cell crate with std::sync::OnceLock in a generated code](https://github.com/gtk-rs/gir/pull/1537)
* [codegen/sys: Don't expect the crates are renamed](https://github.com/gtk-rs/gir/pull/1542)

Thanks to all of our contributors for their (awesome!) work on this release:

* [@andy128k](https://github.com/andy128k)
* [@bilelmoussaoui](https://github.com/bilelmoussaoui)
* [@Claudio-code](https://github.com/Claudio-code)
* [@dependabot[bot]](https://github.com/dependabot[bot])
* [@fbrouille](https://github.com/fbrouille)
* [@felinira](https://github.com/felinira)
* [@GuillaumeGomez](https://github.com/GuillaumeGomez)
* [@Hofer-Julian](https://github.com/Hofer-Julian)
* [@JakeStanger](https://github.com/JakeStanger)
* [@jobale](https://github.com/jobale)
* [@ocrete](https://github.com/ocrete)
* [@pbor](https://github.com/pbor)
* [@pieterdd](https://github.com/pieterdd)
* [@RealKC](https://github.com/RealKC)
* [@redvimo](https://github.com/redvimo)
* [@sdroege](https://github.com/sdroege)
* [@vhakulinen](https://github.com/vhakulinen)
* [@wroyca](https://github.com/wroyca)
* [@ZanderBrown](https://github.com/ZanderBrown)

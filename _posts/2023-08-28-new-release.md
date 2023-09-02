---
layout: post
author: gtk-rs developers
title: New Release
categories: [front, crates]
date: 2023-08-28 20:00:00 +0000
---


It is time again for a new gtk-rs release!

If you have been watching our crates on crates.io closely or if you have attended GUADEC you may already have noticed that we have released new versions of the gtk-rs crates.

The new versions contain less breaking changes than some of our previous releases, so updating will be easier. The release however does include some nice improvements that can simplify your application as well as support the latest API additions of the underlying libraries.

As anticipated in the previous release, this will likely be the last release of the gtk3-rs bindings and we recommend to everyone to upgrade to GTK4. If you require gtk3-rs to keep up with new versions of gtk-rs-core please consider volunteering to help with maintenance of the project.

## Increase of the minimum supported Rust version (MSRV)

With this release, Rust 1.70 is the minimum version required to compile and use the bindings.

## Supported versions

- glib/gio: from version 2.56 to 2.78
- cairo: 1.16
- pango/pangocairo: from version 1.40 to the to be released 1.52
- gdk-pixbuf: from version 2.36 to 2.42
- graphene: from version 1.10 to 1.12
- gtk4: from 4.0 to 4.12 with minimal support of the upcoming 4.14 release
- gtk3: from 3.22

## Documentation improvements

In this release, we also started a slow but steady path towards automatically generating subclassing traits. The first step is to parse the corresponding virtual methods data from the GIR file and embed the documentation for these functions to their corresponding Rust functions like we do for normal functions/methods/types.

See <https://gtk-rs.org/gtk4-rs/stable/latest/docs/gtk4/subclass/widget/trait.WidgetImpl.html#method.keynav_failed>

We also now embed the documentation for Class methods. See <https://gtk-rs.org/gtk4-rs/stable/latest/docs/gtk4/subclass/widget/trait.WidgetClassExt.html#method.install_property_action>

Last but not least, libraries depending on gtk-rs libraries can now have their documentation [published in docs.rs](https://docs.rs/glib/latest/glib/) by adding the following to your Cargo.toml.

```toml
[package.metadata.docs.rs]
all-features = true
rustc-args = ["--cfg", "docsrs"]
rustdoc-args = ["--cfg", "docsrs"]
features = []
```

## gtk-rs-core

## #Switch to bitflags 2.0

With this release we switched to version 2 of the  [bitflags](https://crates.io/crates/bitflags) crate. While we regularly update our dependencies to the latest version, this is of particular note since flag types are often used in glib and GTK API.

We also re-export `bitflags` and `once_cell` from the `glib` crate so you can use them without directly depending on them.

### New `glib::derived_properties` macro

With the `glib::Properties` derive macro added in the last release, you still had to write these blanket functions manually

```rust
impl ObjectImpl for T {
    fn properties() -> &'static [glib::ParamSpec] {
        Self::derived_properties()
    }
    fn set_property(&self, id: usize, value: &glib::Value, pspec: &glib::ParamSpec) {
        self.derived_set_property(id, value, pspec)
    }
    fn property(&self, id: usize, pspec: &glib::ParamSpec) -> glib::Value {
        self.derived_property(id, pspec)
    }
}
```

Now you can replace that code with

```rust
#[glib::derived_properties]
impl ObjectImpl for T {}
```

### Replacement of `glib::Continue` / `glib::Inhibit`

These two types were a bit difficult to understand, as you had to pass a boolean `glib::Continue(true)` /  `glib::Inhibit(false)`. We replaced them with new enums

```rust
glib::Continue(true) -> glib::ControlFlow::Continue
glib::Continue(false) -> glib::ControlFlow::Break
glib::Inhibit(true) -> glib::Propagation::Stop
glib::Inhibit(false) -> glib::Propagation::Proceed
```

Making the meaning of each value clearer to the developer. This should be the most annoying change you need to do during the update to this release.

### Typed constructors

In the past we had a bunch of constructors taking `glib::Type` as a parameter instead of `T: impl StaticType` / `T: impl IsA<O>`. For this release, we cleaned up several of those constructors.

```rust
let model = gio::ListStore::new(SomeObject::static_type()); // before
let model = gio::ListStore::new::<SomeObject>(); // after
let model = gio::ListStore::with_type(SomeObject::static_type()); // is available for specific use cases
```

Changed constructors:

- `glib::SignalGroup`
- `glib::FlagsClass`
- `glib::EnumClass`

### New `glib::ValueDelegate` macro

Let's say you want to create a wrapper around some type, but you want to retain `ToValue`, `FromValue`, and `HasParamSpec` implementations, which are especially necessary when you want to use a type as a property. This is where the `glib::ValueDelegate` macro comes in. Instead of having to manually implement the following:

```rust
pub struct Uid(String);

impl glib::types::StaticType for Uid {
    fn static_type() -> glib::types::Type {
        <String as glib::types::StaticType>::static_type()
    }
}

impl glib::value::ToValue for Uid {
    fn to_value(&self) -> glib::value::Value {
        glib::value::ToValue::to_value(&self.0)
    }

    fn value_type(&self) -> glib::types::Type {
        glib::value::ToValue::value_type(&self.0)
    }
}

impl From<Uid> for glib::value::Value {
    fn from(uid: Uid) -> Self {
        glib::value::Value::from(uid.0)
    }
}

unsafe impl<'a> glib::value::FromValue<'a> for Uid {
    type Checker = <String as glib::value::FromValue<'a>>::Checker;
    unsafe fn from_value(value: &'a glib::value::Value) -> Self {
        Uid(<String as glib::value::FromValue<'a>>::from_value(value))
    }
}

impl glib::HasParamSpec for Uid {
    type ParamSpec = <String as glib::HasParamSpec>::ParamSpec;
    type SetValue = Self;
    type BuilderFn = <String as glib::HasParamSpec>::BuilderFn;
    fn param_spec_builder() -> Self::BuilderFn {
        <String as glib::HasParamSpec>::param_spec_builder()
    }
}
```

you can simply use the macro as follows:

```rust
#[derive(glib::ValueDelegate)]
pub struct Uid(String);
```

For more complex cases, see the [documentation](https://docs.rs/glib/latest/glib/derive.ValueDelegate.html).

You could also achieve the same by using `glib::Boxed`, but `glib::ValueDelegate` provides a thinner wrapper as it only calls to the inner implementation instead of using [`GBoxed`](https://docs.gtk.org/gobject/boxed.html). Additionally, `glib::ValueDelegate` propagates the `GType` to the wrapper instead of creating a new `GType`.

## gtk4-rs

The bindings now support GTK 4.12 with `v4_12` feature flag. Other than that they didn't see many user facing changes. The development mainly focused on various cleanups and bug fixes.

### Blueprint support in `gtk::CompositeTemplate`

You can now use [blueprint](https://jwestman.pages.gitlab.gnome.org/blueprint-compiler/) with both `string` and `file` attributes of the `gtk::CompositeTemplate` macro. This requires having the `blueprint-compiler` binary installed.

```rust
use gtk::{glib, prelude::*, subclass::prelude::*};

mod imp {
    use super::*;

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

    #[glib::object_subclass]
    impl ObjectSubclass for MyWidget {
        const NAME: &'static str = "MyWidget";
        type Type = super::MyWidget;
        type ParentType = gtk::Widget;
        fn class_init(klass: &mut Self::Class) {
            klass.bind_template();
        }
        fn instance_init(obj: &glib::subclass::InitializingObject<Self>) {
            obj.init_template();
        }
    }

    impl ObjectImpl for MyWidget {
        fn dispose(&self) {
            while let Some(child) = self.obj().first_child() {
                child.unparent();
            }
        }
    }
    impl WidgetImpl for MyWidget {}
}

glib::wrapper! {
    pub struct MyWidget(ObjectSubclass<imp::MyWidget>) @extends gtk::Widget;
}
```

### Stop using deprecated StyleContext APIs

The `gtk::StyleContext::add_provider_for_display` / `gtk::StyleContext::remove_provider_for_display` functions were never supposed to be part of the `gtk::StyleContext` type. Since that type was deprecated upstream in GTK 4.10, the developers now annoyingly had to use `#[allow(deprecated)]`, even though those two functions were not deprecated at all.

We have added `gtk::style_context_add_provider_for_display` / `gtk::style_context_remove_provider_for_display` as a replacement for them.

## Detailed Changes

Here is the full list of the merged pull requests:

[gtk-rs-core](https://github.com/gtk-rs/gtk-rs-core):

- [glib-macros: Improve properties macro docs](https://github.com/gtk-rs/gtk-rs-core/pull/969)
- [glib: Implement `ValueArray` `Value` traits manually because of the c…](https://github.com/gtk-rs/gtk-rs-core/pull/973)
- [glib: add `strv::join()` method](https://github.com/gtk-rs/gtk-rs-core/pull/989)
- [glib-macros: Derive HasParamSpec for SharedBoxed](https://github.com/gtk-rs/gtk-rs-core/pull/999)
- [glib-macros: allow properties macro generated functions to be unused](https://github.com/gtk-rs/gtk-rs-core/pull/996)
- [properties: impl HasParamSpec for Vec&lt;String&gt; and StrV](https://github.com/gtk-rs/gtk-rs-core/pull/995)
- [glib-macros: slightly improve Properties macro docs](https://github.com/gtk-rs/gtk-rs-core/pull/994)
- [glib-macros: Improve conversion errors for setters](https://github.com/gtk-rs/gtk-rs-core/pull/986)
- [graphene: Implement Default trait for vectors](https://github.com/gtk-rs/gtk-rs-core/pull/979)
- [glib: Add various `IntoStrV` impls](https://github.com/gtk-rs/gtk-rs-core/pull/977)
- [glib: add `ParamSpecEnumBuilder::default_value()`](https://github.com/gtk-rs/gtk-rs-core/pull/974)
- [glib: object: improve downcasting docs](https://github.com/gtk-rs/gtk-rs-core/pull/1005)
- [glib: More strv fixes](https://github.com/gtk-rs/gtk-rs-core/pull/1007)
- [glib: implement WatchedObject for BorrowedObject](https://github.com/gtk-rs/gtk-rs-core/pull/1017)
- [gio: Don't pass `NULL` to `g\_list\_store\_find\_with\_equal\_func\_full()`](https://github.com/gtk-rs/gtk-rs-core/pull/1015)
- [glib: add missing ObjectImpl vfuncs overrides](https://github.com/gtk-rs/gtk-rs-core/pull/1003)
- [glib: Implement PartialEq for WeakRef](https://github.com/gtk-rs/gtk-rs-core/pull/1006)
- [glib: Make `WeakRef` and `SendWeakRef` useable with the `Properties` derive macro](https://github.com/gtk-rs/gtk-rs-core/pull/985)
- [glib: strv: when calling `g_strv` ffi method, use our `as_ptr` implementation](https://github.com/gtk-rs/gtk-rs-core/pull/1026)
- [glib: strv: when calling `g_strv` ffi method, use our `as_ptr` implementation](https://github.com/gtk-rs/gtk-rs-core/pull/1025)
- [glib: Add `connect_notify*` methods to `SignalGroup`](https://github.com/gtk-rs/gtk-rs-core/pull/1027)
- [gio: add `FileEnumerator::into_stream`](https://github.com/gtk-rs/gtk-rs-core/pull/1035)
- [cairo: `Surface::create_similar_image` should return an ImageSurface](https://github.com/gtk-rs/gtk-rs-core/pull/1036)
- [glib: Don't include the NULL terminator in the `IntoStrV` slice](https://github.com/gtk-rs/gtk-rs-core/pull/1037)
- [gio: Make ListStore::new() take a type parameter](https://github.com/gtk-rs/gtk-rs-core/pull/1032)
- [gio: Added subclassing support for gio::SocketControlMessage](https://github.com/gtk-rs/gtk-rs-core/pull/1039)
- [Fixed unit tests under macOS and possibly other \*nix flavors](https://github.com/gtk-rs/gtk-rs-core/pull/1038)
- [glib: Only optimize `IntoGStr` for `String` when capacity allows](https://github.com/gtk-rs/gtk-rs-core/pull/1034)
- [pangocairo-sys: fix package.description in Cargo.toml](https://github.com/gtk-rs/gtk-rs-core/pull/1031)
- [glib-macros: Add nullable attribute on properties macro](https://github.com/gtk-rs/gtk-rs-core/pull/1023)
- [glib-macros: impl HasParamSpec on glib::Variant](https://github.com/gtk-rs/gtk-rs-core/pull/1022)
- [glib: Optimize `IntoGStr` impl for `String` by simply appending a NUL-byte](https://github.com/gtk-rs/gtk-rs-core/pull/1016)
- [glib-macros: Add ValueDelegate macro](https://github.com/gtk-rs/gtk-rs-core/pull/1000)
- [glib: impl StaticType, FromValue, ToValue, HasParamSpec for Box&lt;str&gt;](https://github.com/gtk-rs/gtk-rs-core/pull/1044)
- [glib: implement From&lt;GStringPtr&gt; for GString](https://github.com/gtk-rs/gtk-rs-core/pull/1049)
- [glib: Switch Priority to associated constants](https://github.com/gtk-rs/gtk-rs-core/pull/1024)
- [glib-macros: Value delegate improvements](https://github.com/gtk-rs/gtk-rs-core/pull/1043)
- [glib: Implement bindings for g\_win32 functions](https://github.com/gtk-rs/gtk-rs-core/pull/1042)
- [glib-macros: generate "From&lt;Ident&gt; for Value" on ValueDelegate](https://github.com/gtk-rs/gtk-rs-core/pull/1055)
- [glib: Fix building for architectures without 64-bit atomics](https://github.com/gtk-rs/gtk-rs-core/pull/1057)
- [glib-macros: Don't assume edition=2021](https://github.com/gtk-rs/gtk-rs-core/pull/1056)
- [glib-macros: enable default features of syn](https://github.com/gtk-rs/gtk-rs-core/pull/1065)
- [glib-macros: Specify quoted types explicitly](https://github.com/gtk-rs/gtk-rs-core/pull/1068)
- [glib-macros: add docs on supported #\[property\] attributes](https://github.com/gtk-rs/gtk-rs-core/pull/1062)
- [glib: Allow using `Path` / `PathBuf` in `glib::Value`s](https://github.com/gtk-rs/gtk-rs-core/pull/1071)
- [glib-macros: Import ParamSpecBuilderExt inside the scope of DerivedObjectProperties::derived\_properties](https://github.com/gtk-rs/gtk-rs-core/pull/1074)
- [glib: Fix inverted boolean conditions when deciding whether to reserve new space](https://github.com/gtk-rs/gtk-rs-core/pull/1076)
- [glib-macros: Disambiguate TryFrom&lt;usize&gt;::Error for DerivedPropertiesEnum](https://github.com/gtk-rs/gtk-rs-core/pull/1077)
- [glib-macros: Strip raw identifier prefix from struct members for the Properties macro](https://github.com/gtk-rs/gtk-rs-core/pull/1079)
- [Split new/with\_type in a few more places](https://github.com/gtk-rs/gtk-rs-core/pull/1086)
- [Fix required features not shown in docs](https://github.com/gtk-rs/gtk-rs-core/pull/1092)
- [Update syn: v2.0](https://github.com/gtk-rs/gtk-rs-core/pull/1096)
- [glib: Enable various smallvec features](https://github.com/gtk-rs/gtk-rs-core/pull/1083)
- [glib-macros: Strip out r# prefix from property names inside the GObject](https://github.com/gtk-rs/gtk-rs-core/pull/1081)
- [glib: Do not use ptr::offset/offset\_from for private/impl offset](https://github.com/gtk-rs/gtk-rs-core/pull/1115)
- [glib: Fix heap buffer overflow due to operator precedence](https://github.com/gtk-rs/gtk-rs-core/pull/1111)
- [glib: strv: Implement From for constant GStr slices](https://github.com/gtk-rs/gtk-rs-core/pull/1114)
- [glib-macros: properties: Allow to omit set for construct\_only properties](https://github.com/gtk-rs/gtk-rs-core/pull/1089)
- [pango: Lower pkg-config version requirement for v1\_52](https://github.com/gtk-rs/gtk-rs-core/pull/1087)
- [glib: Add a std\_once\_cell feature](https://github.com/gtk-rs/gtk-rs-core/pull/1113)
- [Update to bitflags2](https://github.com/gtk-rs/gtk-rs-core/pull/1125)
- [glib: Replace Continue with ControlFlow](https://github.com/gtk-rs/gtk-rs-core/pull/1066)
- [glib: Remove Inhibit and replace it with ControlFlow](https://github.com/gtk-rs/gtk-rs-core/pull/1126)
- [pango: Mark manual impls as such](https://github.com/gtk-rs/gtk-rs-core/pull/1129)
- [glib: control flow: Fix logic in From implementation](https://github.com/gtk-rs/gtk-rs-core/pull/1128)
- [glib-macros: Implement `FromGlibPtrBorrow` on boxed and shared-boxed types](https://github.com/gtk-rs/gtk-rs-core/pull/1122)
- [Use `--generate-link-to-definition` option when generating documentation](https://github.com/gtk-rs/gtk-rs-core/pull/1131)
- [gio: Add retain method to `ListStore`](https://github.com/gtk-rs/gtk-rs-core/pull/1133)
- [glib: Add support for NonZeroT types](https://github.com/gtk-rs/gtk-rs-core/pull/1136)
- [glib-macros: Remove unused dependency](https://github.com/gtk-rs/gtk-rs-core/pull/1137)
- [glib-macros: Add `use_derived_properties` macro](https://github.com/gtk-rs/gtk-rs-core/pull/1127)
- [Don't generate unit tuple in clone macro as default-return value](https://github.com/gtk-rs/gtk-rs-core/pull/1138)
- [glib-macros: Fix docs of `glib::derived_properties`](https://github.com/gtk-rs/gtk-rs-core/pull/1143)
- [glib: Re-introduce an event propagation specific type](https://github.com/gtk-rs/gtk-rs-core/pull/1144)
- [gio: Set missing annotations for new FileInfo apis](https://github.com/gtk-rs/gtk-rs-core/pull/1151)
- [Add typos workflow](https://github.com/gtk-rs/gtk-rs-core/pull/1153)
- [glib: Fixed missing 512 flag, renamed 256 to `USER_0`](https://github.com/gtk-rs/gtk-rs-core/pull/1135)
- [gio: Fix panic in `InputStream`](https://github.com/gtk-rs/gtk-rs-core/pull/1140)
- [Disentangle docsrs and features](https://github.com/gtk-rs/gtk-rs-core/pull/1154)
- [gio: Fix panics if `PollableInputStream` / `PollableOutputStream` ret…](https://github.com/gtk-rs/gtk-rs-core/pull/1159)

[gtk3-rs](https://github.com/gtk-rs/gtk3-rs):

- [gdk: Implement Copy for `Key`](https://github.com/gtk-rs/gtk3-rs/pull/810)
- [examples: Fix menu bar example](https://github.com/gtk-rs/gtk3-rs/pull/813)
- [examples: Update per Priority changes](https://github.com/gtk-rs/gtk3-rs/pull/817)
- [Prepare for gir collections](https://github.com/gtk-rs/gtk3-rs/pull/814)
- [Update to bitflags 2.0](https://github.com/gtk-rs/gtk3-rs/pull/816)
- [gtk3-macros: enable default features of syn](https://github.com/gtk-rs/gtk3-rs/pull/818)
- [Shorten and seal subclass traits, ExtManual traits](https://github.com/gtk-rs/gtk3-rs/pull/821)
- [Adapt to inhibit removal](https://github.com/gtk-rs/gtk3-rs/pull/827)
- [Upgrade syn to 2.0](https://github.com/gtk-rs/gtk3-rs/pull/828)
- [Add `--generate-link-to-definition` option when building on docs.rs](https://github.com/gtk-rs/gtk3-rs/pull/829)
- [Remove `anyhow` dependency](https://github.com/gtk-rs/gtk3-rs/pull/830)
- [Adapt to addition of glib::Propagation](https://github.com/gtk-rs/gtk3-rs/pull/836)
- [More fixes for docsrs attribute](https://github.com/gtk-rs/gtk3-rs/pull/838)

[gtk4-rs](https://github.com/gtk-rs/gtk4-rs):

- [gtk4: Use correct length for the `StrV` when passing to C](https://github.com/gtk-rs/gtk4-rs/pull/1298)
- [gtk4: Add Accessible subclassing support](https://github.com/gtk-rs/gtk4-rs/pull/1312)
- [gtk4: Add SectionModel subclassing support](https://github.com/gtk-rs/gtk4-rs/pull/1417)
- [gtk4: Update for `IntoStrV` not including the NULL terminator in the …](https://github.com/gtk-rs/gtk4-rs/pull/1321)
- [gtk4: Implement convenience traits for StringObject](https://github.com/gtk-rs/gtk4-rs/pull/1361)
- [gtk4: Move provider related functions outside of StyleContext](https://github.com/gtk-rs/gtk4-rs/pull/1362)
- [gtk4: Remove manual overrides for GestureClick](https://github.com/gtk-rs/gtk4-rs/pull/1372)
- [gtk4: Impl Write on text buffers](https://github.com/gtk-rs/gtk4-rs/pull/1452)
- [gtk4: Add a GNOME 45 feature](https://github.com/gtk-rs/gtk4-rs/pull/1431)
- [gtk4: allow subclassing WindowGroup](https://github.com/gtk-rs/gtk4-rs/pull/1371)
- [gtk4-macros: Bump quick-xml to 0.30](https://github.com/gtk-rs/gtk4-rs/pull/1453)
- [gtk4-macros: enable default features of syn](https://github.com/gtk-rs/gtk4-rs/pull/1341)
- [gtk4-macros: Support blueprint files in CompositeTemplate](https://github.com/gtk-rs/gtk4-rs/pull/1348)
- [gdk4: rgba: Add TRANSPARENT const](https://github.com/gtk-rs/gtk4-rs/pull/1315)
- [gdk4: bind GLTextureBuilder::build](https://github.com/gtk-rs/gtk4-rs/pull/1426)
- [gdk4: More GLTextureBuilder tweaks](https://github.com/gtk-rs/gtk4-rs/pull/1427)
- [gdk4: Add 'gl' feature](https://github.com/gtk-rs/gtk4-rs/pull/1428)
- [gdk4: Add missing Clipboard::set](https://github.com/gtk-rs/gtk4-rs/pull/1450)
- [README: Document gnome\_44 feature](https://github.com/gtk-rs/gtk4-rs/pull/1338)
- [Prepare for gir collections](https://github.com/gtk-rs/gtk4-rs/pull/1320)
- [Generate trait signature once for manual code](https://github.com/gtk-rs/gtk4-rs/pull/1391)
- [Fix required features not shown in docs](https://github.com/gtk-rs/gtk4-rs/pull/1392)
- [Update to bitflags2](https://github.com/gtk-rs/gtk4-rs/pull/1413)
- [Adapt to glib::Inhibit removal](https://github.com/gtk-rs/gtk4-rs/pull/1414)
- [Add new Path APIs](https://github.com/gtk-rs/gtk4-rs/pull/1463)
- [docs: Untangle docsrs attribute from features](https://github.com/gtk-rs/gtk4-rs/pull/1454)
- [docs: Add `--generate-link-to-definition` option when building on docs.rs](https://github.com/gtk-rs/gtk4-rs/pull/1423)
- [examples: Update ListStore::new](https://github.com/gtk-rs/gtk4-rs/pull/1326)
- [examples: update for 4.10 deprecations](https://github.com/gtk-rs/gtk4-rs/pull/1385)
- [examples: Use `gtk::Application::builder`](https://github.com/gtk-rs/gtk4-rs/pull/1420)
- [book: Use `gio::spawn_blocking` instead of `thread::spawn`](https://github.com/gtk-rs/gtk4-rs/pull/1433)
- [book: Use `derived_properties` macro](https://github.com/gtk-rs/gtk4-rs/pull/1434)
- [book: Update for 0.7.1](https://github.com/gtk-rs/gtk4-rs/pull/1451)
- [book: Update instructions to `v4\_12`](https://github.com/gtk-rs/gtk4-rs/pull/1465)
- [book: Move to `std::cell::OnceCell`](https://github.com/gtk-rs/gtk4-rs/pull/1470)
- [book: Extend memory management chapter](https://github.com/gtk-rs/gtk4-rs/pull/1459)
- [book: Add missing snippet for `new\_task`](https://github.com/gtk-rs/gtk4-rs/pull/1472)
- [book: Add a note to the book](https://github.com/gtk-rs/gtk4-rs/pull/1331)
- [book: Fix typos and deprecations in the book for CSS chapter (14th).](https://github.com/gtk-rs/gtk4-rs/pull/1334)
- [book: Change xml code block to diff in "Adapt Todo App"](https://github.com/gtk-rs/gtk4-rs/pull/1336)
- [book: Remove mention of "clear\_button"](https://github.com/gtk-rs/gtk4-rs/pull/1333)
- [book: Add a note about finishing touches to "Set CSS Name and Use Exported Colors" section of 14th (CSS) chapter](https://github.com/gtk-rs/gtk4-rs/pull/1339)
- [book: Replace usage of deprecated gtk::Dialog with adw::MessageDialog](https://github.com/gtk-rs/gtk4-rs/pull/1343)
- [book: Add lock file for listings and update dirs](https://github.com/gtk-rs/gtk4-rs/pull/1345)
- [book: Move to property macro](https://github.com/gtk-rs/gtk4-rs/pull/1363)
- [book: Use generated wrapper method](https://github.com/gtk-rs/gtk4-rs/pull/1366)
- [book: Bind Settings to `active` instead of `state`](https://github.com/gtk-rs/gtk4-rs/pull/1370)
- [book: Use property docs of of gtk-rs](https://github.com/gtk-rs/gtk4-rs/pull/1396)
- [book: Use glib Priority enum](https://github.com/gtk-rs/gtk4-rs/pull/1359)
- [book: Use bind helper functions](https://github.com/gtk-rs/gtk4-rs/pull/1401)
- [book: Update librsvg in installation\_windows.md](https://github.com/gtk-rs/gtk4-rs/pull/1404)
- [book: Fix button sensitivity action](https://github.com/gtk-rs/gtk4-rs/pull/1406)
- [book: Use `iter` on `gio::ListModel`](https://github.com/gtk-rs/gtk4-rs/pull/1419)

All this was possible thanks to the [gtk-rs/gir](https://github.com/gtk-rs/gir) project as well:

- [Reworked the book/tutorial](https://github.com/gtk-rs/gir/pull/1379)
- [Fixes an overflow bug that may occasionally panic if gir is built in debug](https://github.com/gtk-rs/gir/pull/1427)
- [codegen: Avoid useless borrows for properties setters](https://github.com/gtk-rs/gir/pull/1451)
- [Update to bitflags 2.0](https://github.com/gtk-rs/gir/pull/1452)
- [Add external docs url config option](https://github.com/gtk-rs/gir/pull/1386)
- [Replace dox feature with docsrs attribute](https://github.com/gtk-rs/gir/pull/1455)
- [Make features independent from docsrs attribute](https://github.com/gtk-rs/gir/pull/1457)
- [Remove docsrs attr for conditional compilation](https://github.com/gtk-rs/gir/pull/1458)
- [codegen: Drop useless any on a single feature](https://github.com/gtk-rs/gir/pull/1459)
- [parser: ignore `boxed` elements](https://github.com/gtk-rs/gir/pull/1460)
- [codegen: only generate trait signatures once](https://github.com/gtk-rs/gir/pull/1461)
- [codegen: generate attributes on trait fns](https://github.com/gtk-rs/gir/pull/1462)
- [Implement basic virtual methods support](https://github.com/gtk-rs/gir/pull/1463)
- [analysis: Don't fill imports from virtual methods](https://github.com/gtk-rs/gir/pull/1465)
- [Fix docs for docsrs attribute](https://github.com/gtk-rs/gir/pull/1466)
- [parser: ignore source-position in virtual methods](https://github.com/gtk-rs/gir/pull/1468)
- [analysis: Avoid overflow when determining whether to emit a parameter](https://github.com/gtk-rs/gir/pull/1471)
- [codegen: seal Ext traits](https://github.com/gtk-rs/gir/pull/1467)
- [generate cfg conditions for aliases, enums, interfaces and disguised](https://github.com/gtk-rs/gir/pull/1453)
- [codegen: Only use any if scope constraints &gt; 1](https://github.com/gtk-rs/gir/pull/1476)
- [codegen: build tests on all unix platforms](https://github.com/gtk-rs/gir/pull/1478)
- [analysis: Prefer prelude/exported crates](https://github.com/gtk-rs/gir/pull/1469)
- [Update to bitflags 2.2](https://github.com/gtk-rs/gir/pull/1474)
- [codegen: Switch from Inhibit to ControlFlow](https://github.com/gtk-rs/gir/pull/1481)
- [codegen: Replace ControlFlow with Propagation](https://github.com/gtk-rs/gir/pull/1485)
- [Add trait\_name to API docs](https://github.com/gtk-rs/gir/pull/1489)
- [Fix inserting all-features in Cargo.toml for docs.rs](https://github.com/gtk-rs/gir/pull/1490)

Thanks to all of our contributors for their (awesome!) work on this release:

- [@A6GibKm](https://github.com/A6GibKm)
- [@AaronErhardt](https://github.com/AaronErhardt)
- [@andy128k](https://github.com/andy128k)
- [@arcnmx](https://github.com/arcnmx)
- [@Benjins-automation](https://github.com/Benjins-automation)
- [@bilelmoussaoui](https://github.com/bilelmoussaoui)
- [@BrainBlasted](https://github.com/BrainBlasted)
- [@decathorpe](https://github.com/decathorpe)
- [@dependabot[bot]](https://github.com/dependabot[bot])
- [@elmarco](https://github.com/elmarco)
- [@epilys](https://github.com/epilys)
- [@fbrouille](https://github.com/fbrouille)
- [@felinira](https://github.com/felinira)
- [@FineFindus](https://github.com/FineFindus)
- [@gdesmott](https://github.com/gdesmott)
- [@gianzellweger](https://github.com/gianzellweger)
- [@GuillaumeGomez](https://github.com/GuillaumeGomez)
- [@happylinks](https://github.com/happylinks)
- [@heftig](https://github.com/heftig)
- [@Hofer-Julian](https://github.com/Hofer-Julian)
- [@jf2048](https://github.com/jf2048)
- [@johan-bjareholt](https://github.com/johan-bjareholt)
- [@jplatte](https://github.com/jplatte)
- [@kawadakk](https://github.com/kawadakk)
- [@Kijewski](https://github.com/Kijewski)
- [@lupinx2](https://github.com/lupinx2)
- [@mashomee](https://github.com/mashomee)
- [@MathieuDuponchelle](https://github.com/MathieuDuponchelle)
- [@mbiggio](https://github.com/mbiggio)
- [@melix99](https://github.com/melix99)
- [@nicopap](https://github.com/nicopap)
- [@pbor](https://github.com/pbor)
- [@pentamassiv](https://github.com/pentamassiv)
- [@ranfdev](https://github.com/ranfdev)
- [@RealKC](https://github.com/RealKC)
- [@rmnscnce](https://github.com/rmnscnce)
- [@saethlin](https://github.com/saethlin)
- [@Schmiddiii](https://github.com/Schmiddiii)
- [@sdroege](https://github.com/sdroege)
- [@SeaDve](https://github.com/SeaDve)
- [@tintou](https://github.com/tintou)
- [@valpackett](https://github.com/valpackett)
- [@wroyca](https://github.com/wroyca)
- [@xanathar](https://github.com/xanathar)
- [@yuraiz](https://github.com/yuraiz)
- [@zekefast](https://github.com/zekefast)

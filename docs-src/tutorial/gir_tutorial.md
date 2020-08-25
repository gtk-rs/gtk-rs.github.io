---
layout: default
---

# Generating a GNOME library using gir crate

In this tutorial, we'll see how to generate a GNOME library using the [gir] crate. A few things to note first:

 * It only works on GObject-based libraries.
 * You need `.gir` files.

A little explanation about those requirements: the [gir] crate needs `.gir` files to generate the library API. You can generally find them alongside the library header files (as you can see [here](https://packages.debian.org/stretch/amd64/libgtk-3-dev/filelist) for example, look for ".gir").

The `.gir` files "describes" the library API (objects, arguments, even ownership!). This is where the [gir] crate comes in: it reads those `.gir` files and generates the Rust crates from them. You can learn more about the GIR format [here](https://gi.readthedocs.io/en/latest/).

A little note about the `.gir` files: it often happens that they are invalid (missing or invalid annotations for example). We have a small script to fix the `.gir` files we're using (and only them!) available in the [gir-files repository](https://github.com/gtk-rs/gir-files/blob/master/fix.sh). You can run it like this (at the same level of the `.gir` files you want to patch):

```bash
> sh fix.sh
```

All `gtk-rs` generated crates come in two parts: the `sys` part which contains all the C functions and types definitions (direct mapping, everything is unsafe) and the "high-level" part which contains the nice, completely safe and idiomatic Rust API on top of the `sys` part.

As an example, we'll generate the `sourceview` library bindings. So first, let's generate the `sys` part!

## Generating the sys-library

First, you'll need to download [gir]:

```bash
> git clone https://github.com/gtk-rs/gir
> cd gir
> cargo install --path . # so we can use gir binary directly
```

Then the `.gir` files (luckily for you, we have a repository which contains all the ones you need for sourceview!):

```bash
> git clone https://github.com/gtk-rs/gir-files
```

If you look into `gir-files`, you'll see a file named `GtkSource-3.0.gir`. That's the one for sourceview.

Now let's create a new project for our `sourceview` crate:

```bash
> cargo new sourceview --lib
```

Then let's create a folder inside the newly created `sourceview` folder for the `sys` part:

```bash
> cd sourceview
> cargo new sourceview-sys --lib
```

To indicate to [gir] what to generate, we'll need a `Gir.toml` file (inside the `sourceview-sys` folder) containing:

```toml
[options]
library = "GtkSource"
version = "3.0"
target_path = "."
min_cfg_version = "3.0"
```

 * `library` stands for the library we want to generate.
 * `version` stands for the version of the library to be used.
 * `target_path` stands for the location where the files will be generated.
 * `min_cfg_version` will be the minimum version supported by the generated bindings.

You should now have a folder looking like this:

```text
sourceview/
  |
  |---- Cargo.toml
  |---- sourceview-sys/
  |       |
  |       |---- Cargo.toml
  |       |---- Gir.toml
  |       |---- src/
  |               |
  |               |---- lib.rs
  |---- src/
          |
          |---- lib.rs
```

Let's generate the `sys` crate now:

```bash
> cd sourceview-sys
# Run gir in "sys" mode (the "-m" option) and we give the gir files path (the "-d" option)
> gir -m sys -d ../../gir-files/
```

(In case a failure happens at this point, and you can't figure out what's going on, don't hesitate to reach us so we can give you a hand!)

You should now see new files (and a new folder):

 * `build.rs`
 * `Cargo.toml`
 * `src/lib.rs`
 * `tests/`

Now let's try to build it:

```bash
> cargo build
```

Surprise! It doesn't build at all and you should see a loooooot of errors. Well, that was expected. We need to add some dependencies (you can find which ones in the `.gir` files) in order to make it work. Let's update our `Gir.toml` file to make it look like this:

```toml
[options]
library = "GtkSource"
version = "3.0"
target_path = "."
min_cfg_version = "3.0"

external_libraries = [
    "Cairo",
    "Gdk",
    "GdkPixbuf",
    "Gio",
    "GLib",
    "GObject",
    "Gtk",
]
```

Now we regenerate it then rebuild it:

```bash
> rm Cargo.* # we remove Cargo files
> gir -m sys -d ../../gir-files/
> cargo build
```

Should work just fine!

We can cleanup the command line a bit now. You can actually give the work mode ("-m" option) and the gir files repository through the `Gir.toml` file using "work_mode" and "girs_dir" options:

```toml
[options]
library = "GtkSource"
version = "3.0"
target_path = "."
min_cfg_version = "3.0"
work_mode = "sys"
girs_dir = "../../gir-files/"

external_libraries = [
    "Cairo",
    "Gdk",
    "GdkPixbuf",
    "Gio",
    "GLib",
    "GObject",
    "Gtk",
]
```

Now, if you want to regenerate, just run:

```bash
> gir
```

Now we have a working `sys` containing all functions and objects definition. Just to be sure everything was correctly generated, we can run some tests (graciously generated by [gir] as well):

```bash
> cargo test
```

Normally, all tests passed. If you get an error when running those tests, it's very likely that the `sys` generation is invalid and/or incomplete.

Time to generate the high-level Rust API!

## Generating the high-level Rust API

Time to go back to the "global" sourceview folder:

```bash
> cd ..
```

As you certainly guessed, we'll need a new `Gir.toml` file. Let's write it:

```toml
[options]
girs_dir = "../gir-files"
library = "GtkSource"
version = "3.0"
min_cfg_version = "3.0"
target_path = "."
work_mode = "normal"
generate_safety_asserts = true
deprecate_by_min_version = true
single_version_file = true

generate = []
```

A few new things in here. Let's take a look at them:

 * "work_mode" value is now set to "normal", it means it'll generate the high-level Rust api instead of the sys-level.
 * "generate_safety_asserts" is used to generates checks to ensure that, or any other kind of initialization needed before being able to use the library.
 * "deprecate_by_min_version" is used to generate a [Rust "#[deprecated]"](https://doc.rust-lang.org/edition-guide/rust-2018/the-compiler/an-attribute-for-deprecation.html) attribute based on the deprecation information provided by the `.gir` file.
 * "single_version_file" is a very useful option when you have a lot of generated files (like we'll have). Instead of generating the gir hash commit used for the generation in the header of all generated files, it'll just write it inside one file, removing `git diff` noise **a lot**.
 * "generate = []": this line currently does nothing. We say to [gir] to generate nothing. We'll fulfill it later on.

Let's make a first generation of our high-level Rust API!

```bash
> gir
```

Now if you take a look around, you'll see a new "auto" folder inside "src". Doesn't contain much though. Which makes sense since we're generating nothing. Time to introduce you to a whole new [gir] mode: not_bound. Let's give it a try:

```bash
> gir -m not_bound
[NOT GENERATED] GtkSource.Buffer
[NOT GENERATED PARENT] Gtk.TextBuffer
[NOT GENERATED] GtkSource.Language
[NOT GENERATED] GtkSource.Mark
[NOT GENERATED PARENT] Gtk.TextMark
[NOT GENERATED] GtkSource.StyleScheme
[NOT GENERATED] GtkSource.UndoManager
[NOT GENERATED] GtkSource.SortFlags
[NOT GENERATED] GtkSource.Completion
[NOT GENERATED PARENT] Gtk.Buildable
[NOT GENERATED] GtkSource.CompletionProvider
[NOT GENERATED] GtkSource.CompletionContext
[NOT GENERATED PARENT] GObject.InitiallyUnowned
[NOT GENERATED] GtkSource.CompletionInfo
[NOT GENERATED PARENT] Gtk.Window
[NOT GENERATED PARENT] Gtk.Bin
[NOT GENERATED PARENT] Gtk.Container
[NOT GENERATED PARENT] Gtk.Widget
[NOT GENERATED PARENT] Atk.ImplementorIface
[NOT GENERATED] GtkSource.View
[NOT GENERATED PARENT] Gtk.TextView
[NOT GENERATED PARENT] Gtk.Scrollable
[NOT GENERATED] GtkSource.CompletionActivation
[NOT GENERATED] GtkSource.CompletionProposal
[NOT GENERATED] GtkSource.CompletionError
[NOT GENERATED] GtkSource.CompletionItem
[NOT GENERATED PARENT] GtkSource.CompletionProposal
[NOT GENERATED] GtkSource.CompletionWords
[NOT GENERATED PARENT] GtkSource.CompletionProvider
[NOT GENERATED] GtkSource.DrawSpacesFlags (deprecated in 3.24)
[NOT GENERATED] GtkSource.Encoding
[NOT GENERATED] GtkSource.File
[NOT GENERATED] GtkSource.MountOperationFactory
[NOT GENERATED] GtkSource.FileLoader
[NOT GENERATED] GtkSource.FileLoaderError
[NOT GENERATED] GtkSource.FileSaver
[NOT GENERATED] GtkSource.FileSaverFlags
[NOT GENERATED] GtkSource.FileSaverError
[NOT GENERATED] GtkSource.Gutter
[NOT GENERATED] GtkSource.GutterRenderer
[NOT GENERATED] GtkSource.GutterRendererState
[NOT GENERATED] GtkSource.GutterRendererAlignmentMode
[NOT GENERATED] GtkSource.GutterRendererPixbuf
[NOT GENERATED PARENT] GtkSource.GutterRenderer
[NOT GENERATED] GtkSource.GutterRendererText
[NOT GENERATED] GtkSource.LanguageManager
[NOT GENERATED] GtkSource.Map
[NOT GENERATED PARENT] GtkSource.View
[NOT GENERATED] GtkSource.MarkAttributes
[NOT GENERATED] GtkSource.PrintCompositor
[NOT GENERATED] GtkSource.Region
[NOT GENERATED] GtkSource.RegionIter
[NOT GENERATED] GtkSource.SearchContext
[NOT GENERATED] GtkSource.SearchSettings
[NOT GENERATED] GtkSource.Style
[NOT GENERATED] GtkSource.SpaceDrawer
[NOT GENERATED] GtkSource.SpaceTypeFlags
[NOT GENERATED] GtkSource.SpaceLocationFlags
[NOT GENERATED] GtkSource.StyleSchemeChooser
[NOT GENERATED] GtkSource.StyleSchemeChooserButton
[NOT GENERATED PARENT] Gtk.Button
[NOT GENERATED PARENT] Gtk.Actionable
[NOT GENERATED PARENT] Gtk.Activatable
[NOT GENERATED PARENT] GtkSource.StyleSchemeChooser
[NOT GENERATED] GtkSource.StyleSchemeChooserInterface
[NOT GENERATED] GtkSource.StyleSchemeChooserWidget
[NOT GENERATED] GtkSource.StyleSchemeManager
[NOT GENERATED] GtkSource.Tag
[NOT GENERATED PARENT] Gtk.TextTag
[NOT GENERATED] GtkSource.ViewGutterPosition
```

We now have the list of all the non-yet generated items. Quite convenient! You can also see that we have two kinds of not generated items:

 * `[NOT GENERATED]`
 * `[NOT GENERATED PARENT]`

`[NOT GENERATED PARENT]` means that this object lives in a dependency of the current library. We'll come back on how to add them a bit later.

Let's start by generating one type. Let's update the "generate" array as follows:

```toml
generate = [
    "GtkSource.Language",
]
```

Another `gir` run:

```bash
> gir
```

(Again, if you do it on another library and it fails and you can't figure out why, don't hesitate to reach us!)

We now have a `src/auto/language.rs` file. We need to include all `auto` files in our library. To do so, let's update the `src/lib.rs` file as follows:

```rust
pub use auto::*;

mod auto;
```

Let's compile:

```bash
> cargo build
```

It completely failed with a lot of errors. Yeay!

You guessed it, we need to add a few dependencies to make it work. A lot of those errors were about the fact that the `Language` type didn't exist. Which is weird since we generated it, right? Well, if you take a look at the `src/auto/language.rs` file, you'll see this at the top:

```rust
glib_wrapper! {
    pub struct Language(Object<gtk_source_sys::GtkSourceLanguage, gtk_source_sys::GtkSourceLanguageClass, LanguageClass>);

    match fn {
        get_type => || gtk_source_sys::gtk_source_language_get_type(),
    }
}
```

This macro comes from the `glib` crate. We didn't import it, therefore the Rust compiler can't find it. We'll also need its `sys` part (the case of `glib` is a bit special).

Another issue that will arise is that we didn't import the `sourceview-sys` crate either. Alongside those two (three if we count `glib-sys`!), we'll need both `libc` and `bitflags`. Let's fix all of those issues at once! For that, we need to update the `Cargo.toml`:

```toml
[package]
name = "sourceview"
version = "0.1.0"
authors = ["Guillaume Gomez <guillaume1.gomez@gmail.com>"]

[dependencies]
libc = "0.2"
bitflags = "1.0"

[dependencies.gtk-source-sys]
path = "./sourceview-sys"

[dependencies.glib]
git = "https://github.com/gtk-rs/glib"

[dependencies.glib-sys]
git = "https://github.com/gtk-rs/sys" # all gtk-rs sys crates are in the sys repository
```

While you are at it, you should also change the edition to 2015 or remove the field entirely from your Cargo.toml. This is advised because gir has an [issue](https://github.com/gtk-rs/gir/issues/746) with the 2018 edition of Rust. Don't worry, the created wrapper will work with the 2018 edition just fine.

And to import the `libc` and `bitflags crates into `src/lib.rs`:

```rust
#[macro_use]
extern crate glib;
extern crate glib_sys;
extern crate gtk_source_sys;

extern crate libc;
#[macro_use]
extern crate bitflags;

pub use auto::*;

mod auto;
```

Let's try to rebuild:

```bash
> cargo build
```

It worked! We have generated the `Language` item! I'll let you take a look at the `src/auto/language.rs` file, then we can continue.

Again, if you encounter any issue at this stage (if the generated code is invalid for example), don't hesitate to reach us so we can give you a hand!

We'll now generate the `GtkSource.Region` type. Why this one? Well, I don't want to spoil the surprise so just wait for a bit!

First, we need to add it into the types to generate into our `Gir.toml` file:

```toml
generate = [
    "GtkSource.Language",
    "GtkSource.Region",
]
```

We regenerate:

```bash
> gir
```

We rebuild:

```bash
> cargo build
```

Everything works, yeay! Now if we take a look at our newly generated `src/auto/region.rs`, we'll see code like this:

```rust
//#[cfg(any(feature = "v3_22", feature = "dox"))]
//fn add_subregion(&self, _start: /*Ignored*/&gtk::TextIter, _end: /*Ignored*/&gtk::TextIter);

//#[cfg(any(feature = "v3_22", feature = "dox"))]
//fn get_buffer(&self) -> /*Ignored*/Option<gtk::TextBuffer>;
```

Some functions are commented. Why so? The reason is simple: we need to tell to `gir` that those types have been generated and that he can generates code using them. We can do it by adding the type into the "manual" list. To put it simply, when [gir] sees an item into this "manual" list, it means to it "this type has been generated somewhere else, you can use it just like the others".

Let's update our `Gir.toml` file once again:

```toml
generate = [
    "GtkSource.Language",
    "GtkSource.Region",
]

manual = [
    "Gtk.TextIter",
    "Gtk.TextBuffer",
]
```

We'll also need to import the `gtk` crate. Let's add it into our `Cargo.toml` file:

```toml
[dependencies.gtk]
git = "https://github.com/gtk-rs/gtk"
```

And import it into our `src/lib.rs`:

```rust
extern crate gtk;
```

We regenerate and rebuild:

```bash
> gir
> cargo build
```

Everything is working, yeay! If you take another look at `src/auto/region.rs`, you'll see a lot less commented functions. Amongst the remaining ones, you'll see this one:

```rust
//#[cfg(any(feature = "v3_22", feature = "dox"))]
//fn get_start_region_iter(&self, iter: /*Ignored*/RegionIter);
```

If a type name isn't prepend by `[crate_name]::`, then it means it comes from the current crate. To add it, just put it into the "generate" list of `Gir.toml`.

At this point, you should have almost everything you need. There is just one last case we need to talk about.

## Generation errors

There are a few kinds of errors (not much luckily) which can happen with [gir] generation. Let's take a look at them.

### Missing memory management functions

If [gir] generation fails (for whatever reason), it means you'll have to implement the type yourself. Just like types from other `gtk-rs` crates, you'll need to put it into the "manual" list. Then you need to put the type into the `src` folder (or inside a subfolder, you know how Rust works).

/!\ Don't forget to reexport the type inside your `src/lib.rs` file! For example, let's take a look at the [requisition.rs](https://github.com/gtk-rs/gtk/blob/master/src/requisition.rs) file from the `gtk` crate.

Since it's a "simple" type (no pointer, therefore no memory management to do), [gir] doesn't know how to generate it. You'll need to implement some traits by hand like `ToGlibPtr` or `ToGlibPtrMut` (depending on your needs).

### Bad function generation

In some cases, the generated code isn't correct (array parameters are often an issue). In such cases, it's better to just make the implementation yourself. As an example, let's say you want to implement `Region::is_empty` yourself. A few changes have to be made. Let's start with `Gir.toml`:

```toml
generate = [
    "GtkSource.Language",
]

[[object]]
name = "GtkSource.Region"
status = "generate"
    [[object.function]]
    name = "is_empty"
    ignore = true
```

So to sum up what I wrote above: we removed "GtkSource.Region" from the "generate" list and we created a new entry for it. Then we say to [gir] that it should generate (through `status = "generate"`). However, we also tell it that we don't want the "is_empty" to be generated.

Now that we've done that, we need to reimplement it. Let's create a `src/region.rs` file:

```rust
use glib::object::IsA;
use glib::translate::*;
use Region;

pub trait RegionExtManual: 'static {
    pub fn is_empty(&self) -> bool;
}

impl<O: IsA<Region>> RegionExtManual for O {
    pub fn is_empty(&self) -> bool {
        // blablabla
        true
    }
}
```

You might wonder: "why not just implementing it on the `Region` type directly?". Because like this, a subclass will also be able to use this trait easily as long as it implements `IsA<Region>`. For instance, in gtk, everything that implements `IsA<Widget>` (so almost every GTK types) can use those methods.

As usual, don't forget to reexport the trait. A little tip about reexporting manual traits: in `gtk-rs`, we create a `src/prelude.rs` file which reexports all traits (both manual and generated ones), making it simpler for users to use them through `use [DEPENDENCY]::prelude::*`. It looks like this:

```rust
pub use auto::traits::*;

pub use region::RegionExtManual;
```

Then it's reexported as follows from the `src/lib.rs` file:

```rust
pub mod prelude;

pub use prelude::*;
```

### Other gir options

In case a function is badly generated, you don't **always** need to reimplement it. Sometimes, it's just an error in the gir files that you can override in your `Gir.toml` file. I recommend you to take a look at the [gir README file](https://github.com/gtk-rs/gir#the-api-mode-toml-config) to see all available options.

## Words of the end

That's it, with this we should be able to generate any GNOME crate you want. Happy coding!

[gir]: https://github.com/gtk-rs/gir

<div class="footer">
<div style="text-align:center;width:100%;"><a href="/docs-src/tutorial">Going back to summary</a>.</div>
</div>

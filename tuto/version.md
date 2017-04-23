---
layout: default
---

# Specifying version

By default, `Gtk-rs` only provides objects and functions for the Gtk 3.4 version. If you want to use newer version, you'll need to specify them through `Cargo` features.

## Explanations

If you don't know how `Cargo` features work, I suggest you to take a look at its [documentation](http://doc.crates.io/specifying-dependencies.html#choosing-features) first.

Now let's take a look at `Gtk-rs/gtk` crate features:

```toml
v3_6 = ["gtk-sys/v3_6", "gdk/v3_6"]
v3_8 = ["v3_6", "gtk-sys/v3_8", "gdk/v3_8"]
v3_10 = ["v3_8", "gtk-sys/v3_10", "gdk/v3_10"]
v3_12 = ["v3_10", "gtk-sys/v3_12", "gdk/v3_12"]
v3_14 = ["v3_12", "gtk-sys/v3_14", "gdk/v3_14"]
v3_16 = ["v3_14", "gtk-sys/v3_16", "gdk/v3_16"]
v3_18 = ["v3_16", "gtk-sys/v3_18", "gdk/v3_18"]
v3_20 = ["v3_18", "gtk-sys/v3_20", "gdk/v3_20"]
v3_22 = ["v3_20", "gtk-sys/v3_22", "gdk/v3_22"]
```

First thing to note, every version feature include all previous ones. So if you use the `v3_10` feature to get the Gtk 3.10 version, you'll also have access to the 3.8, 3.6 and 3.4 versions.

## Don't use version you don't (yet?) have!

Very important to note: if you have a Gtk 3.8 version installed on your computer, you won't be able to use newer feature than `v3_8`, otherwise it just won't compile. So before using any feature, don't forget to check if you **can**.

## Specifying the feature in your crate

In your `Cargo.toml` file, you can specify which version you want to target like this:

```toml
[dependencies.gtk]
version = "0.1"
default-features = false  # just in case
features = ["v3_18"]
```

And if you want to provide a multi-version crate, you'll need to add features on your own:

```toml
[features]
gtk_3_10 = ["gtk/v3_10"]
gtk_3_14 = ["gtk/v3_14"]
```

So when someone has a new enough version of Gtk, it'll be able to build your crate like this:

```
> cargo build --features gtk_3_14
```

<div style="width:100%">
<div style="width:33%;display:block;text-align:center;"><a href="/tuto/gnome_and_rust">Gnome libraries and Rust</a>.</div>
<div style="width:34%;display:block;text-align:center;"><a href="/docs-src/tutorial">Going back to summary</a>.</div>
<div style="width:33%;display:block;text-align:center;"><a href="/tuto/closures">Callbacks and closures</a>.</div>
</div>

---
layout: default
---

# Rust and `Gtk-rs`

Before going any further, if you don't know Rust at all, we recommend you to read the official [Rust Book](https://doc.rust-lang.org/book/).

Then we recommend you to learn a bit about [Cargo](http://doc.crates.io/index.html).

All done? Perfect!

## Adding `Gtk-rs` as dependency

Let's start with the basics. I assume you already created a project with a `Cargo.toml` file in it. To add the `Gtk-rs`' gtk crate as dependency, it's as simple as follow:

```toml
[dependencies]
gtk = "0.1.0"
```

Then from your "main" file (understand the entry point of your program/library), add:

```rust
extern crate gtk;
```

Of course, the same goes for any other `Gtk-rs` crate. Example with glib:

```toml
[dependencies]
glib = "0.1.0"
```

And:

```rust
extern crate glib;
```

## Get last version

If a new `Gtk-rs` release happens, just go to [crates.io](https://crates.io) and check for the `Gtk-rs` crates version you're using. Update the version to your `Cargo.toml` file:

```toml
gtk = "0.2.0"
```

Then just compile normally, `cargo` will update the dependency by itself.

## Examples

Now that you know how to import `Gtk-rs` crates into your code, looking at the [examples repository](https://github.com/gtk-rs/examples/) could be a great idea!

<div style="width:100%">
<div style="width:33%;display:block;text-align:center;"></div>
<div style="width:34%;display:block;text-align:center;"><a href="/docs-src/tutorial">Going back to summary</a>.</div>
<div style="width:33%;display:block;text-align:center;"><a href="/tuto/gnome_and_rust">Gnome libraries and Rust</a>.</div>
</div>

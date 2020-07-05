---
layout: default
---

# Gnome libraries and Rust

Currently, the `Gtk-rs` organization provides the bindings for the following libraries:

 * Gtk (the widget toolkit)
 * Gdk (low-level functions provided by the underlying windowing and graphics systems)
 * Gdk-pixbuf (image loading and manipulation)
 * Cairo (vector graphic API)
 * Glib (data structures and utilities for dealing with them)
 * Gio (file system abstractions)
 * Pango (layout engine, text and font handling)

The goal is to provide a safe abstraction using Rust paradigms.

## Objects

First thing to note (it's very important!) is that the `Gtk-rs` objects can be cloned and it costs **nothing** more than copying a pointer, so basically nothing. The reason is quite simple (and I suppose you already guessed it): it's simply because `Gtk-rs` structs only contains a pointer to the corresponding `Gnome` objects.

Now: why is cloning safe? One thing to note before going any further: it's not thread safe (and you shouldn't try to call a `Gnome` library function inside another thread). Otherwise, when a struct is dropped, it calls internally the [`g_object_unref`](http://gtk-rs.org/docs/gobject_sys/fn.g_object_unref.html) function and calls the [`g_object_ref`](http://gtk-rs.org/docs/gobject_sys/fn.g_object_ref.html) function when you call `clone()`.

To put it simply: `Gnome` handles the resources allocation/removal for us.

## Trait hierarchy

In Gtk, there is a widget hierarchy. In Rust, it's implemented through "traits inheritance" and enforced by the compiler at compile-time. So, what does that mean exactly? Let's take an example:

You have a [`Button`](http://gtk-rs.org/docs/gtk/struct.Button.html). As says the [gnome documentation](https://developer.gnome.org/gtk3/stable/GtkButton.html), a [`Button`](http://gtk-rs.org/docs/gtk/struct.Button.html) inheritance tree (a bit simplified) looks like this:

```
 GObject
  ╰── GtkWidget
       ╰── GtkContainer
            ╰── GtkBin
                 ╰── GtkButton
```

Which means that a [`Button`](http://gtk-rs.org/docs/gtk/struct.Button.html) can use methods from any of its parents.

So basically, you just need to import a parent's trait to be able to use its methods:

```rust
// we import Widget's methods.
use gtk::WidgetExt;

// we create a button
let button = gtk::Button::with_label("Click me!");

// we use the method from the widget
button.show_all();
```

As easy as that!

## Interfaces

The same goes for interfaces. The [gnome documentation](https://developer.gnome.org/gtk3/stable/GtkButton.html) also says that a [`Button`](http://gtk-rs.org/docs/gtk/struct.Button.html) implements the following interfaces: `GtkBuildable`, `GtkActionable` and `GtkActivatable`. Just like parents' methods, import the corresponding interface and then you'll be able to use the methods.

I think that with this, you'll be able to write anything you want without too much difficulties. Now it's time to go deeper into `Gtk-rs` usage!

<div class="footer">
<div><a href="rust_and_gtk">Rust and <code>Gtk-rs</code></a>.</div>
<div><a href="/docs-src/tutorial">Going back to summary</a>.</div>
<div><a href="version">Specifying version</a>.</div>
</div>

---
layout: default
---

# Upcast and downcast

Since there is an inheritance system in Gtk, it's only logical to have one as well in `Gtk-rs`. Normally, most people won't need this, but it's always nice to understand how things work.

## Checking if a `Widget` is another `Widget`

Let's say you want to write a generic function and want to check if a `Widget` is actually a `Box`. First, let's see a bit of code:

```rust
fn is_a_box<W: IsA<gtk::Object> + IsA<gtk::Widget>>(widget: W) -> bool {
    widget.upcast::<gtk::Widget>().downcast::<gtk::Box>().is_ok()
}
```

Ok, so what's happening in there? First, you'll note the usage of the [`IsA`](http://gtk-rs.org/docs/gtk/trait.IsA.html) trait. It is implemented on every widget for every of its parents. Secondly, all widgets implement the [`Object`](http://gtk-rs.org/docs/gtk/struct.Object.html) trait.

We need the [`Object`](http://gtk-rs.org/docs/gtk/struct.Object.html) to be able to use the [`Cast`](http://gtk-rs.org/docs/gtk/trait.Cast.html) trait which contains both [`upcast`](http://gtk-rs.org/docs/gtk/trait.Cast.html#method.upcast) and [`downcast`](http://gtk-rs.org/docs/gtk/trait.Cast.html#method.downcast) methods (take a look to it for other methods as well).

We don't really need our widget to be a [`Widget`](http://gtk-rs.org/docs/gtk/struct.Widget.html), we just put it here to make things easier (so we can upcast into a [`Widget`](http://gtk-rs.org/docs/gtk/struct.Widget.html) without troubles).

So the point of this function is to upcast the widget to the highest widget type and then try downcasting it into the wanted object. We could make even more generic like this:

```rust
fn is_a<W: IsA<gtk::Object> + IsA<gtk::Widget>,
        T: IsA<gtk::Object> + IsA<gtk::Widget>>(widget: W) -> bool {
    widget.upcast::<gtk::Widget>().downcast::<T>().is_ok()
}
```

Then let's test it:

```rust
let button = gtk::Button::new_with_label("Click me!");

is_a::<gtk::Button, gtk::Container>(button); // Returns true.
is_a::<gtk::Button, gtk::Label>(button);     // Returns false.
```

<div style="width:100%">
<div style="width:33%;display:block;text-align:center;"><a href="/tuto/closures">Callbacks and closures</a>.</div>
<div style="width:34%;display:block;text-align:center;"><a href="/docs-src/tutorial">Going back to summary</a>.</div>
<div style="width:33%;display:block;text-align:center;"><a href="/tuto/glade">Glade</a>.</div>
</div>

---
layout: default
---

# Object-oriented Rust

Since there is an inheritance system in Gtk, it's only logical to have one as well in `Gtk-rs`. Normally, most people won't need this, but understanding how things work can help navigating the documentation a lot.

Each GTK class is split into a struct named after that class, and a trait with the same name and the suffix `Ext`, see for example [WidgetExt](https://gtk-rs.org/docs/gtk/prelude/trait.WidgetExt.html). All methods except the constructor(s) are not in the struct, but in that trait. In addition, some other methods can be found in a `…ExtManual` trait, as seen in [WidgetExtManual](https://gtk-rs.org/docs/gtk/prelude/trait.WidgetExtManual.html). This happens for implementation reasons currently. The same principle applies to GTK interfaces as well (have a look at the [Orientable](https://gtk-rs.org/docs/gtk/struct.Orientable.html) interface for an example). There are a few exceptional classes that don't follow this general pattern: one reason for this is that final classes don't need an extension trait because there can't be any subclasses of them, and thus can have their methods defined on the struct itself.

## Basic inheritance

Any struct not only implements its `Ext` trait, but also all traits of its super classes. That way you can call methods of super classes directly on a struct.

The [`IsA`](https://gtk-rs.org/docs/glib/object/trait.IsA.html) trait is used to model the subtype relation of classes between structs. Every struct implements `IsA<SuperClass>` for each of its parent classes (and its implemented interfaces). For example [FlowBox](https://gtk-rs.org/docs/gtk/struct.FlowBox.html) implements `IsA<Buildable>`, `IsA<Container>`, `IsA<Orientable>`, `IsA<Widget>`.

Passing classes as arguments is pretty straightforward. The only rule is that when accepting a class as function argument, take a generic `IsA<ClassThatIWant>` instead: [`fn add<P: IsA<Widget>>(&self, widget: &P)`](https://gtk-rs.org/docs/gtk/trait.ContainerExt.html#tymethod.add). Now the method can be not only called with structs of that type, but also with structs of any subtype (in this case, any Widget).

## Upcasting

Upcasting should rarely be necessary due to the subtyping, but sometimes you need a "proper" `Widget` struct (instead of a `WidgetExt` implementor or an `IsA<Widget>`). This is actually quite simple to achieve:

```rust
let button = gtk::Button::with_label("Click me!");
let widget = button.upcast::<gtk::Widget>();
```

Since the [`Button`](https://gtk-rs.org/docs/gtk/struct.Button.html) struct implements `IsA<Widget>`, we can upcast into a [`Widget`](https://gtk-rs.org/docs/gtk/struct.Widget.html). It's important to note that the [`IsA`](https://gtk-rs.org/docs/gtk/trait.IsA.html) trait is implemented on every widget for every of its parents, which, in here, allows to [`upcast`](https://gtk-rs.org/docs/gtk/trait.Cast.html#method.upcast) the [`Button`](https://gtk-rs.org/docs/gtk/struct.Button.html) into a [`Widget`](https://gtk-rs.org/docs/gtk/struct.Widget.html).

Let's see now a more global usage.

## Checking if a widget is another widget

Let's say you want to write a generic function and want to check if a `Widget` is actually a `Box`. First, let's see a bit of code:

```rust
fn is_a_box<W: IsA<gtk::Object> + IsA<gtk::Widget> + Clone>(widget: &W) -> bool {
    widget.clone().upcast::<gtk::Widget>().is::<gtk::Box>()
}
```

Ok, so what's happening in there? First, you'll note the usage of the [`IsA`](https://gtk-rs.org/docs/gtk/trait.IsA.html) trait. The received `widget` needs to implement both `IsA<Widget>` and `IsA<Object>`.

We need the [`Object`](https://gtk-rs.org/docs/gtk/struct.Object.html) to be able to use the [`Cast`](https://gtk-rs.org/docs/gtk/trait.Cast.html) trait which contains both [`upcast`](https://gtk-rs.org/docs/gtk/trait.Cast.html#method.upcast) and [`downcast`](https://gtk-rs.org/docs/gtk/trait.Cast.html#method.downcast) methods (take a look to it for other methods as well).

We don't really need our widget to be a [`Widget`](https://gtk-rs.org/docs/gtk/struct.Widget.html), we just put it here to make things easier (so we can upcast into a [`Widget`](https://gtk-rs.org/docs/gtk/struct.Widget.html) without troubles).

So the point of this function is to upcast the widget to the highest widget type and then try downcasting it into the wanted object. We could make even more generic like this:

```rust
fn is_a<W: IsA<gtk::Object> + IsA<gtk::Widget> + Clone,
        T: IsA<gtk::Object> + IsA<gtk::Widget>>(widget: &W) -> bool {
    widget.clone().upcast::<gtk::Widget>().downcast::<T>().is_ok()
}
```

Then let's test it:

```rust
let button = gtk::Button::with_label("Click me!");

assert_eq!(is_a::<_, gtk::Container>(&button), true);
assert_eq!(is_a::<_, gtk::Label>(&button), false);
```

<div class="footer">
<div><a href="closures">Callbacks and closures</a>.</div>
<div><a href="/docs/tutorial">Going back to summary</a>.</div>
<div><a href="glade">Glade</a>.</div>
</div>

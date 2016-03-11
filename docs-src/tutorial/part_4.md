---
layout: post
author: GuillaumeGomez
title: Tutorial - Part 4
date: 2016-03-11 18:00:00 +0100
categories: [front, tutorial]
---

In this part, we'll talk about some mechanisms proper to *gtk-rs*. Let's start with `clone`.

###Clone

The `Clone` trait from Rust has been implemented on every *gtk-rs*'s widgets. So simply:

```Rust
let label = gtk::Label::new("label");
let label_ref = label.clone();
```

Obviously, `label` won't be duplicated. Internally, *gtk-rs* calls the [g_object_ref](https://developer.gnome.org/gobject/stable/gobject-The-Base-Object-Type.html#g-object-ref) function. To make it simple, it allows to avoid an object to get destroyed if it's still used somewhere in your rust code. Once an object is destroyed, the `Drop` trait will call the [g_object_unref](https://developer.gnome.org/gobject/stable/gobject-The-Base-Object-Type.html#g-object-unref) function which will decrement the number of references of the object, and remove it if there is no more references.

Now let's talk about the last particularity of *gtk-rs*: the glib's `Value` type!

###glib and Value

The `Value` type is used to wrap constant data from any type to be displayed into some views (like a tree view for example). The big plus of this type is the safety it brings: you cannot get/set a value if it doesn't correspond to the type that you entered when you passed it done to the model/view.

Let's take an example:

```Rust
// we create a ListStore with two columns
let list_store = gtk::ListStore::new(&[Type::I64, Type::String]);

// we try to insert invalid type in the second column
list_store.insert_with_values(None, &[0, 1], &[&"test", &"test"]);
```

There are high changes that when you'll try to run it, it'll just panic. And you won't be able to get the value of the first column as well because the type received isn't the one expect, the `Value::get()` will fail.

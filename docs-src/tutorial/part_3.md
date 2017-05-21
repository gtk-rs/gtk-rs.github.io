---
layout: post
author: GuillaumeGomez
title: Tutorial - Part 3
date: 2016-03-11 18:00:00 +0100
categories: [front, tutorial]
---

By now, you should have the basics with the events. But before going any further, we need to talk about the *gtk-rs* object hierarchy.

### Object hierarchy

This chapter will be almost theory only but it's important for you to understand what *gtk-rs*
does to better interact with it. Let's start with a little example: you're building a tree
view and you want to sort columns. So you create a `ListStore` and then you cast it in a
`TreeSortable` to implement the sort functions. In C it gives:

```C
// first we create a list with two columns
GtkTreeModel *liststore = gtk_list_store_new(2, G_TYPE_STRING, G_TYPE_UINT);

// then we cast it into a GtkTreeSortable object 
GtkTreeSortable *sortable = GTK_TREE_SORTABLE(liststore);

// implementation of sort functions...
```

You can't use such cast in Rust and shouldn't need to. If you need it in such circumstances,
it's a bug. In the following example, we could just use `TreeSortable` method because
`ListStore` implements the `TreeSortableExt` trait. So don't do it if you want to do a "real"
*gtk-rs* application:

```Rust
// first we create a list with two columns
let list_store = gtk::ListStore::new(&[Type::String, Type::U32]);

// then we get the TreeSortable object
let sortable = list_store.upcast::<TreeSortable>().unwrap();

// implementation of sort functions...
```

This `downcast` functionality is all based on the `Downcast` trait. Any type cannot be cast in every other types. The same hierarchy that *GTK* created is implemented here as well. In our previous example, `ListStore` can be downcasted into `TreeSortable`, but `TreeSortable` cannot be downcasted to `ListStore`. However, `TreeSortable` can be upcasted into `ListStore` and not the contrary. I guess you understood how it works by now.

Normally, it's very rare to use directly downcast or upcast functions. So don't be afraid of them and enjoy how useful they are!

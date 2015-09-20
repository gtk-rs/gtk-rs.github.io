---
layout: post
author: imperio
title: Contributor's story
categories: [front, crates]
date: 2015-09-20 01:00:00 +0100
---

The previous posts were about `Gtk-rs` libraries and issues we encountered. We decided to changed a bit the theme by talking about `Gtk-rs` most valuable resource: its __contributors__.

#Story of imperio (GuillaumeGomez on github)

At first, `Gtk-rs` organization didn't exist. It was a project to provide `gtk` binding for `Rust`, started by jeremyletang. I joined him to fasten up the development.

At this time, `Rust` wasn't even at its first version and there were breaking changes quite often. So besides working on the binding itself, we had to make sure it still built on the current `Rust` version. As the project continued to grow, it became more and more difficult to add new features and update the project's code at the same time (the biggest issue was to update all the old signal system).

At the beginnings, I mostly worked on adding new objects and structures to provide always more content. It helped me to understand the structure of this project quietly. Then, I created new macros to make easier the creation of new structures which inherit from `GtkWidget`.

#Rust 1.0 release

The 1.0 release of `Rust` finally came out. Now I guess all of you must be thinking: "nice! Now you don't have to update your code anymore, so no more problem!". Well, this brought a new issue: some functionalities we used in our project weren't available on the `stable` version. So we had to keep an "actual" version with missing functionalities to allow people with stable versions of `Rust` to use `gtk`.

Around that time, we created new repositories to split out other libraries bindings (`cairo`, `glib`, `gdk` and `pango`) and then, I created their crates on [crates.io](https://crates.io/). The little `gtk` project (which wasn't little anymore at all) just made a very big step by getting available for every users by simply adding a dependency in Cargo!

#Big changes

The `Gtk-rs` organization was created just after this (it was called `rust-gnome`).

This is also around this time that jeremyletang left the project and I became the current "leader" (I don't find better word so this one will be fine I guess?). I finished my work on `pango` and `gdk` bindings and started to add the biggest missing part of this project: documentation!

As the time passed, gkoz became my second on `Gtk-rs` (congrats to him \o/). He started a big refactoring of all the code structure. We also decided to create a website to allow users of `Gtk-rs` to follow changes (and breaking changes) more easily. For some reasons detailed in a previous post, the organization's name change from `rust-gnome` to `Gtk-rs`.

To resume all this post, I must say that I never thought I would take the leadership of this project and that I would get the help of such amazing people (contributors and users!). It was for me a way to learn a new part of `Rust` and I hope I'll be able to contribute to it a lot in the future!

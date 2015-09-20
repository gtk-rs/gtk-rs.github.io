---
layout: post
author: imperio
title: Contributor's story
categories: [front, org]
date: 2015-09-21 01:00:00 +0100
---

The previous posts were about the `Gtk-rs` libraries and issues we encountered. We decided to change the theme a bit by talking about `Gtk-rs`' most valuable resource: its __contributors__.

### Story of imperio

At first, the `Gtk-rs` organization didn't exist. This was a project to provide `GTK+` bindings for `Rust`, started by jeremyletang. I joined him to speed up the development.

At the time, `Rust` wasn't even at its first stable version and breaking changes happened quite often. So beside working on the library itself, we had to make sure it still built with the current `Rust` version. As the project continued to grow, it became more and more difficult to add new features and update the project's code at the same time (the biggest issue was updating all of the old signals system).

At the beginnings, I mostly worked on adding new objects and structures to provide as much content as I could. It helped me understand the structure of this project quietly. Then, I created new macros to make the creation of new structures which inherit from `GtkWidget` easier.

### Rust 1.0 release

The 1.0 release of `Rust` finally came out. Now I guess all of you must be thinking: "nice! Now you don't have to update your code anymore, so no more problems!". Well, this brought a new issue: some features we used in our project weren't available on the `stable` channel. So we had to keep an "actual" version with missing functionalities to allow people with stable versions of `Rust` to use `gtk`. It was (at least for me!) a big fight between adding new stuff and finding a workaround to keep stable `rustc` happy.

Around that time, we created new repositories to split out other library bindings (`cairo`, `glib`, `gdk` and `pango`) and then, I published their crates on [crates.io](https://crates.io/keywords/gtk-rs). The little `gtk` project (which wasn't little anymore at all) just made a very big step by becoming available via Rust's native packaging system, a single dependency line in `Cargo.toml` away! It was for me a way to "officialize" our project.

#Big changes

The `Gtk-rs` organization was created shortly after this (it was called `rust-gnome`).

Around this time jeremyletang left the project and I became the only one in charge of the project. I finished my work on `pango` and `gdk` bindings and started to add the biggest missing part of this project: documentation!

As the time passed, gkoz joined me and we created (unnofficialy) the core team for `Gtk-rs` (congrats to him \o/). He started a big refactoring of all the code structure. We decided then to create a website to let the users of `Gtk-rs` follow changes (and breaking changes) more easily. For some reasons detailed in a previous post, the organization's name was changed from `rust-gnome` to `Gtk-rs`.

To conclude this post, I must say that I never thought I would take the leadership of this project and that I would get the help of such amazing people (contributors and users!). For me it was a way to learn a new part of `Rust` and I hope I'll be able to continue contributing to it a lot in the future!

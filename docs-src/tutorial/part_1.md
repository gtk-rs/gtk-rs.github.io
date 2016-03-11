---
layout: post
author: GuillaumeGomez
title: Tutorial - Part 1
date: 2016-03-11 18:00:00 +0100
categories: [front, tutorial]
---

Through these chapters, this tutorial intends to allow you to understand how to use gtk-rs' libraries.
Let's start with the baics: building a basic application.

### Basics

Before going any further, let's start by setting up the project. Launch the following command:

```Shell
> cargo new --bin tuto
```

Now go to the created folder (tuto in this example) and take a look at the `Cargo.toml` file:

```Toml
[package]
name = "tuto"
version = "0.1.0"
authors = ["Your Name <your@email.com>"]

[dependencies]
```

To be able to use gtk, we'll need to import it. After the `[dependencies]` line, add `gtk = "0.0.7"`.
Your `Cargo.toml` file should now look like:

```Toml
[package]
name = "tuto"
version = "0.1.0"
authors = ["Your Name <your@email.com>"]

[dependencies]
gtk = "0.0.7"
```

So we created a project named "tuto" which has `gtk` as dependency. Now let's fill the *src/main.rs* file:

```Rust
extern crate gtk;

use gtk::prelude::*;
use gtk::{Window, WindowType};

fn main() {
    if gtk::init().is_err() {
        println!("Failed to initialize GTK.");
        return;
    }

    let window = Window::new(WindowType::Toplevel);

    window.set_title("gtk-rs tutorial");
    window.set_default_size(350, 70);

    window.connect_delete_event(|_, _| {
        gtk::main_quit();
        Inhibit(false)
    });

    // By default, all widgets are invisible. Don't forget to "show" them!
    window.show_all();
    gtk::main();
}
```

I think that the code is easy enough to understand for anyone.
The only problem you might have is the `connect_delete_event` and the closure we pass to it.
The `connect_delete_event` method is a callback when the "close window" event is spanned
(when you click on the top-right cross for example).

Now let's take a look at the closure:

```Rust
|_, _| {
    gtk::main_quit();
    Inhibit(false)
}
```

This closure takes two arguments but we ignore them since we don't use them.
The `gtk::main_quit()` function indicates to *gtk* we want to end our application.
And finally, the `Inhibit(false)` returned value indicates to *gtk* that this event must be
spanned to other elements as well. If we didn't want this event to close the window, we would
have returned `Inhibit(true)` (and not called `gtk::main_quit()` of course).

Now let's run this code:

```Shell
> cargo run
```

You should see:

// add screenshot here

Congrats, you built your first *gtk* application with *Rust*!

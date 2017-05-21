---
layout: post
author: GuillaumeGomez
title: Tutorial - Part 2
date: 2016-03-11 18:00:00 +0100
categories: [front, tutorial]
---

I briefly talked about events in the previous part. What about digging into it a bit more?

### Events

To illustrate them a bit better, let's add button to our window and make it write something
on the terminal:

```Rust
extern crate gtk;

use gtk::{Button, Window, WindowType};
use gtk::prelude::*;

fn main() {
    if gtk::init().is_err() {
        println!("Failed to initialize GTK.");
        return;
    }

    let window = Window::new(WindowType::Toplevel);

    window.set_title("First GTK+ Program");
    window.set_default_size(350, 70);

    window.connect_delete_event(|_, _| {
        gtk::main_quit();
        Inhibit(false)
    });

    let button = Button::new_with_label("Click me!"); // so we create the button

    button.connect_clicked(|_| { // we connect the clicked signal
        println!("clicked!");
    });

    window.add(&button); // we add it to our window

    window.show_all();
    gtk::main();
}
```

Once again:

```Shell
> cargo run
```

And we now have a wonderful:

// add screenshot here

Easy, right?

---
layout: post
author: GuillaumeGomez
title: Who talked about testing?
categories: [front, crates]
date: 2018-05-02 00:00:45 +0000
---

Hi everyone!

Today is not about a new [`gtk-rs`] release but about a new crate being released. Let me introduce to you: [`gtk-test`]!

So what's the purpose of this new crate? Simply to test UIs. Currently, testing UIs is difficult, but with [`gtk-test`] you can test basically everything UI-related way more simply.

Now you might wonder: how does it work? We send UI events to the window. So if your window isn't on top of all other windows, events won't work (not on your window at least).

Since examples are often better than long explanations, here we go:

```rust
extern crate gtk;
#[macro_use]
extern crate gtk_test;

use gtk::{Button, ButtonExt, ContainerExt, GtkWindowExt, Window, WindowType};

fn main() {
    gtk::init().expect("GTK init failed");

    let window = Window::new(WindowType::Toplevel);
    let but = Button::new();
    but.set_label("button");
    but.connect_clicked(|b| {
        b.set_label("clicked!");
    });
    window.add(&but);
    window.show_all();
    window.activate_focus(); // Very important on OSX!

    gtk_test::click(&but);
    gtk_test::wait(1000); // To be sure that GTK has updated the button's label.
    assert_label!(but, "clicked!");
}
```

Easy, right? So what happened in this code? We created a button, have set a label to it, added it to a window and clicked on it. The interesting part being that the label of the button got updated when the button is clicked (which is done through `gtk_test::click(&but)`).

`assert_label!(but, "clicked!")` is there to check that the event has been called and by checking if the button's label has been updated.

The only downside of this example is that you have to wait for an arbitrary amount of time that the button's label has been updated through `gtk_test::wait(1000)`. Well, there's a better way of doing this actually. Let's update the above example:

```rust
extern crate gtk;
#[macro_use]
extern crate gtk_test;

use gtk::{Button, ButtonExt, ContainerExt, GtkWindowExt, Window, WindowType};

fn main() {
    gtk::init().expect("GTK init failed");

    let window = Window::new(WindowType::Toplevel);
    let but = Button::new();
    but.set_label("button");
    let observer = observer_new!(button, connect_clicked, |b| {
        b.set_label("clicked!");
    });
    window.add(&but);
    window.show_all();
    window.activate_focus(); // Very important on OSX!

    gtk_test::click(&but);
    observer.wait();
    assert_label!(but, "clicked!");
}
```

Tadam! The newly created `observer` will look and ensure that the given signal has indeed been called (if not, it'll obviously get stuck at `observer.wait()`).

A few other tools are available for you in order to check more UI stuff. Here's the current list of the functions (the bold ones are the ones you'll more likely use):

 * **click**
 * **double_click**
 * **enter_key**
 * **enter_keys**
 * find_child_by_name
 * find_widget_by_name
 * **focus**
 * **key_press**
 * **key_release**
 * **mouse_move**
 * **mouse_press**
 * **mouse_release**
 * run_loop
 * wait
 * wait_until_done
 * **wait_for_draw**

And a few useful macros as well:

 * assert_label
 * assert_text
 * assert_title
 * observer_new

And with this, I think you're ready to start adding your own UI tests. Time to thank people now, isn't it? :)

First, thanks a lot to [@antoyo] for starting this project! He wrote all functions and most of the macros. Without him, this project might have never been started so thanks (again)!

Also, thanks to [@sdroege] for taking a look at the code and suggesting to add a signal observer. It made the testing much smoother!

We hope it'll be of great to use for you and wish you a happy coding!

[`gtk-rs`]: https://gtk-rs.org
[`gtk-test`]: https://github.com/gtk-rs/gtk-test
[@GuillaumeGomez]: https://github.com/GuillaumeGomez
[@sdroege]: https://github.com/sdroege
[@antoyo]: https://github.com/antoyo


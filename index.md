---
layout: wide
---

<div class="intro-col-wrapper">
  <div class="intro-col intro-col-1" markdown="1">

### [Rust] bindings for [GTK+ 3][GTK], [Cairo] and other [GLib]-compatible libraries

[![GTK screenshot](gtk.png)](gtk.png)

[Rust]: https://www.rust-lang.org/
[GLib]: https://developer.gnome.org/glib/stable/
[GTK]: https://developer.gnome.org/gtk3/stable/
[Cairo]: http://cairographics.org/documentation/

  </div>
  <div class="intro-col intro-col-2">
    <div class="crates">
      <p class="page-heading"> Crates </p>
      {% include badges.html %}
    </div>
    <div class="blog">
      <p class="page-heading"> Announcements </p>
      {% for post in site.categories.front limit:3 %}
        <span class="post-meta">{{ post.date | date: "%-d %b %Y" }}</span>
        <p>
          <a href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a>
        </p>
      {% endfor %}
    </div>
  </div>
</div>

## Using

Include `gtk` in your `Cargo.toml`:

{% highlight toml %}
[dependencies]
gtk = "0.0.3"
{% endhighlight %}

__The APIs aren't stable yet. Watch the Announcements box above for breaking changes to the crates!__

Import the `gtk` crate and its traits:

{% highlight rust %}
extern crate gtk;

use gtk::traits::*;
{% endhighlight %}

A create a window, etc.

{% highlight rust %}
use gtk::signal::Inhibit;

fn main() {
    gtk::init().ok().expect("Failed to initialize GTK.");
    let window = gtk::Window::new(gtk::WindowType::TopLevel).unwrap();
    window.set_title("First GTK+ Program");
    window.set_default_size(350, 70);

    window.connect_delete_event(|_, _| {
        gtk::main_quit();
        Inhibit(false)
    });

    let button = gtk::Button::new_with_label("Click me!").unwrap();

    window.add(&button);

    window.show_all();
    gtk::main();
}
{% endhighlight %}

## Projects using gtk
* [SolidOak](https://github.com/oakes/SolidOak)
* [rrun](https://github.com/buster/rrun)
* [process-viewer](https://github.com/GuillaumeGomez/process-viewer)

If you want yours to be added to this list, please create a Pull Request for it!


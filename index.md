---
layout: wide
---

<div class="intro-col-wrapper">
  <div class="intro-col intro-col-1" markdown="1">

### [Rust] bindings for [GTK+ 3][GTK], [Cairo], [GtkSourceView] and other [GLib]-compatible libraries

[![GTK screenshot](gtk.png)](gtk.png)

[Rust]: https://www.rust-lang.org/
[GLib]: https://developer.gnome.org/glib/stable/
[GTK]: https://developer.gnome.org/gtk3/stable/
[Cairo]: http://cairographics.org/documentation/
[GtkSourceView]: https://wiki.gnome.org/Projects/GtkSourceView

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

Include `gtk` in your `Cargo.toml` and set the minimal GTK version required by your project:
{% assign gtk = site.data.crates | where: "name", "gtk" %}

~~~toml
[dependencies.gtk]
version = "{{ gtk[0].max_version }}"
features = ["v3_10"]
~~~

__The APIs aren't stable yet. Watch the Announcements box above for breaking changes to the crates!__

Import the `gtk` crate and its traits:

~~~rust
extern crate gtk;

use gtk::prelude::*;
~~~

Create a window, etc.

~~~rust
use gtk::{Button, Window, WindowType};

fn main() {
    if gtk::init().is_err() {
        println!("Failed to initialize GTK.");
        return;
    }

    let window = Window::new(WindowType::Toplevel);
    window.set_title("First GTK+ Program");
    window.set_default_size(350, 70);
    let button = Button::new_with_label("Click me!");
    window.add(&button);
    window.show_all();

    window.connect_delete_event(|_, _| {
        gtk::main_quit();
        Inhibit(false)
    });

    button.connect_clicked(|_| {
        println!("Clicked!");
    });

    gtk::main();
}
~~~

## Using latest, not published version

Include `gtk` in your `Cargo.toml` not as crate but from git:

~~~toml
[dependencies.gtk]
git = "https://github.com/gtk-rs/gtk"
features = ["v3_10"]
~~~

## Projects using gtk-rs
* [Garta](https://github.com/zaari/garta)
* [Gattii](https://gitlab.com/susurrus/gattii)
* [gpsami](https://github.com/hfiguiere/gpsami)
* [Marmoset](https://github.com/sprang/marmoset)
* [process-viewer](https://github.com/GuillaumeGomez/process-viewer)
* [rrun](https://github.com/buster/rrun)
* [SolidOak](https://github.com/oakes/SolidOak)
* [systemd-manager](https://github.com/mmstick/systemd-manager)
* [tv-renamer](https://github.com/mmstick/tv-renamer)
* [PNMixer-rs](https://github.com/hasufell/pnmixer-rust)
* [BrewStillery](https://github.com/MonkeyLog/BrewStillery)
* [Way Cooler](https://github.com/way-cooler)
* [Hammond](https://gitlab.gnome.org/alatiera/Hammond)
* [Font Finder](https://github.com/mmstick/fontfinder)
* [Fractal](https://gitlab.gnome.org/danigm/fractal)
* [Epicwar Downloader](https://github.com/ab0v3g4me/epicwar-downloader)
* [Whatschanging](https://github.com/mothsART/whatschanging)
* [Popsicle](https://github.com/pop-os/popsicle/)
* [media-toc](https://github.com/fengalin/media-toc)

If you want yours to be added to this list, please create a [Pull Request](https://github.com/gtk-rs/gtk-rs.github.io/compare?expand=1) for it!

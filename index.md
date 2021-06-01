---
layout: wide
---

<div class="intro-col-wrapper">
  <div class="intro-col intro-col-1" markdown="1">

## [Rust] bindings for [GTK 3][GTK], [Cairo], [GtkSourceView] and other [GLib]-compatible libraries

[![GTK screenshot](gtk.png)](gtk.png)

[Rust]: https://www.rust-lang.org/
[GLib]: https://developer.gnome.org/glib/stable/
[GTK]: https://developer.gnome.org/gtk3/stable/
[Cairo]: https://cairographics.org/documentation/
[GtkSourceView]: https://wiki.gnome.org/Projects/GtkSourceView

  </div>
  <div class="intro-col intro-col-2">
    <div class="crates">
      <p class="page-heading"> Crates </p>
      {% include badges.html %}
    </div>
    <div class="sponsors">
      <div>
        <svg version="1.1" viewBox="0 0 50 50">
          <path d="M38.594,13.356l0.468-4.477L34.95,7.05l-1.829-4.112l-4.477,0.467L25,0.765l-3.644,2.641l-4.477-0.468L15.05,7.05 l-4.112,1.829l0.467,4.477L8.765,17l2.641,3.644l-0.468,4.477l4.113,1.829L16,29.085v19.72l9-5.625l9,5.625V29.085l0.95-2.135 l4.112-1.829l-0.467-4.477L41.235,17L38.594,13.356z M25,40.821l-7,4.375V30.945l3.356-0.35L25,33.235l3.644-2.641L32,30.945v14.25 L25,40.821z M36.922,23.883l-3.487,1.552l-1.552,3.487l-3.793-0.396L25,30.765l-3.09-2.239l-3.793,0.396l-1.552-3.487l-3.487-1.552 l0.396-3.793L11.235,17l2.239-3.09l-0.396-3.793l3.487-1.552l1.552-3.487l3.793,0.396L25,3.235l3.09,2.239l3.793-0.396l1.552,3.487 l3.487,1.552l-0.396,3.793L38.765,17l-2.239,3.09L36.922,23.883z"></path>
          <path d="M25,7c-5.514,0-10,4.486-10,10s4.486,10,10,10s10-4.486,10-10S30.514,7,25,7z M25,25c-4.411,0-8-3.589-8-8s3.589-8,8-8   s8,3.589,8,8S29.411,25,25,25z"></path>
        </svg>
        <a href="{{site.baseurl}}/docs-src/sponsors">Our sponsors</a>
      </div>
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

| Crate | Minimum supported version |
|-------|---------------------------|
| [atk](https://crates.io/crates/atk) | 2.30 |
| [cairo](https://crates.io/crates/cairo-rs) | 1.14 |
| [gdk](https://crates.io/crates/gdk) | 3.16 |
| [gdk-pixbuf](https://crates.io/crates/gdk-pixbuf) | 2.32 |
| [gdk-x11](https://crates.io/crates/gdkx11) | 3.14 |
| [gio](https://crates.io/crates/gio) | 2.44 |
| [glib](https://crates.io/crates/glib) | 2.44 |
| [gtk](https://crates.io/crates/gtk) | 3.16 |
| [pango](https://crates.io/crates/pango) | 1.38 |
| [pangocairo](https://crates.io/crates/pangocairo) | 1.0 |
| [sourceview](https://crates.io/crates/sourceview) | 3.0 |

<div style="display:block;margin-top:16px"></div>

## Using

First, prepare your system by taking a look at the [GTK installation page](https://www.gtk.org/docs/installations/).

Then include `gtk` and `gio` in your `Cargo.toml` and set the minimal GTK version required by your project:
{% assign gtk = site.data.crates | where: "name", "gtk" %}

~~~toml
[dependencies.gtk]
version = "{{ gtk[0].max_version }}"
features = ["v3_16"]

[dependencies.gio]
version = "{{ gio[0].max_version }}"
features = ["v2_44"]
~~~

__The code is stable and feature complete, but the APIs might change in the future.__

Import the `gtk` and `gio` crates and their traits:

~~~rust
extern crate gtk;
extern crate gio;

use gtk::prelude::*;
use gio::prelude::*;
~~~

Create an application, etc.

~~~rust
use gtk::{Application, ApplicationWindow, Button};

fn main() {
    let application = Application::new(
        Some("com.github.gtk-rs.examples.basic"),
        Default::default(),
    ).expect("failed to initialize GTK application");

    application.connect_activate(|app| {
        let window = ApplicationWindow::new(app);
        window.set_title("First GTK Program");
        window.set_default_size(350, 70);

        let button = Button::with_label("Click me!");
        button.connect_clicked(|_| {
            println!("Clicked!");
        });
        window.add(&button);

        window.show_all();
    });

    application.run(&[]);
}
~~~

## Using latest, not published version

Include `gtk` in your `Cargo.toml` not as crate but from git:

~~~toml
[dependencies.gtk]
git = "https://github.com/gtk-rs/gtk"
features = ["v3_16"]
~~~

## Projects using gtk-rs
* [Banner Viewer](https://gitlab.gnome.org/World/design/banner-viewer)
* [BrewStillery](https://gitlab.com/MonkeyLog/BrewStillery)
* [Cigale](https://github.com/emmanueltouzery/cigale)
* [color_blinder_gtk](https://gitlab.com/dns2utf8/color_blinder_gtk)
* [Contrast](https://gitlab.gnome.org/World/design/contrast)
* [Cookbook](https://github.com/MacKarp/Cookbook)
* [Czkawka](https://github.com/qarmin/czkawka)
* [Epicwar Downloader](https://github.com/ab0v3g4me/epicwar-downloader)
* [Font Finder](https://github.com/mmstick/fontfinder)
* [Fractal](https://gitlab.gnome.org/GNOME/fractal)
* [Garta](https://github.com/zaari/garta)
* [Gattii](https://gitlab.com/susurrus/gattii)
* [GNvim](https://github.com/vhakulinen/gnvim)
* [gled](https://gitlab.com/pentagonum/gled)
* [glide](https://github.com/philn/glide)
* [gpsami](https://gitlab.gnome.org/hub/gpsami)
* [gtktranslate](https://github.com/skylinecc/gtktranslate)
* [Icon Library](https://gitlab.gnome.org/World/design/icon-library)
* [Iridium](https://github.com/matze/iridium)
* [lognplot](https://github.com/windelbouwman/lognplot)
* [Marmoset](https://github.com/sprang/marmoset)
* [mcmmtk](https://github.com/pwil3058/mcmmtk)
* [media-toc](https://github.com/fengalin/media-toc)
* [Myxer](https://github.com/Aurailus/Myxer)
* [neovim-gtk](https://github.com/daa84/neovim-gtk)
* [noaa-apt](https://github.com/martinber/noaa-apt)
* [pcatk](https://github.com/pwil3058/pcatk)
* [Pika Backup](https://gitlab.gnome.org/World/pika-backup)
* [PNMixer-rs](https://github.com/hasufell/pnmixer-rust)
* [Podcasts](https://gitlab.gnome.org/World/podcasts)
* [Popsicle](https://github.com/pop-os/popsicle/)
* [process-viewer](https://github.com/GuillaumeGomez/process-viewer)
* [Projectpad](https://github.com/emmanueltouzery/projectpad2)
* [relm](https://github.com/antoyo/relm)
* [rrun](https://github.com/buster/rrun)
* [Shortwave](https://gitlab.gnome.org/World/Shortwave)
* [Social](https://gitlab.gnome.org/World/Social)
* [SolidOak](https://github.com/oakes/SolidOak)
* [systemd-manager](https://gitlab.com/mmstick/systemd-manager)
* [Tau](https://gitlab.gnome.org/World/Tau)
* [tv-renamer](https://github.com/mmstick/tv-renamer)
* [Whatschanging](https://github.com/mothsART/whatschanging)

If you want yours to be added to this list, please create a [Pull Request](https://github.com/gtk-rs/gtk-rs.github.io/edit/master/index.md) for it!

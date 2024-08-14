---
centered: true
layout: default
---

# Unlocking the GNOME stack for Rust

The **gtk-rs** project provides safe bindings to the [Rust] language for fundamental libraries from the [GNOME] stack like [GLib], [Cairo], [GTK&nbsp;3][GTK] and [GTK&nbsp;4][GTK].
{: class="center"}

[GNOME]: https://www.gnome.org/technologies/
[Rust]: https://www.rust-lang.org
[GLib]: https://developer.gnome.org/glib
[GTK]: https://gtk.org
[Cairo]: https://cairographics.org/documentation/

{% include post_overview.html %}

[![Open Collective backers and sponsors](https://img.shields.io/opencollective/all/gtk-rs?color=%2399c9ff&label=Support%20us%20on%20open%20collective&logo=open-collective&logoColor=white&style=for-the-badge&labelColor=%233385ff)](https://opencollective.com/gtk-rs)
{: class="badgets"}


## Available crates

The following table contains the most popular crates of **gtk-rs**. More information on all existing crates is available under the corresponding links in the **Project** column in the table below.

{% include crates.html %}


<div class="special" markdown="1">

## The introductory book

<div class="with-logo" markdown="1">

[{% include book.svg %}][book]

Julian Hofer is writing a book titled [GUI development with Rust and GTK&nbsp;4][book]. We recommend both new and experienced **gtk-rs** users to have a look at it. While this book is targeted at people who want to develop GTK&nbsp;4 applications, it also covers more general aspects of the GNOME stack such as **GObject Concepts**, **The Main Event Loop** and **GSettings**.

[book]: /gtk4-rs/stable/latest/book

</div>
</div>


## The gtk-rs ecosystem

By now, a number of additional bindings for GObject based libraries exist. While not part of the gtk-rs project, many of them are developed in close collaboration. Notable other projects within the gtk-rs ecosystem are

- [**GStreamer** Open source multimedia framework](https://crates.io/crates/gstreamer)
- [**Adwaita** Building blocks for modern GNOME applications](https://crates.io/crates/libadwaita)
- [**SourceView 5** A library extending GtkTextView with features typical for a source code editor](https://crates.io/crates/sourceview5)
- [**Relm 4** An idiomatic GUI library inspired by Elm and based on gtk4-rs](https://crates.io/crates/relm4)
{: class="box-list"}

More bindings can be found as part of the [GNOME GitLab Rust Group](https://gitlab.gnome.org/World/Rust).

All these bindings are generated on the basis of GObject introspection (GIR). The book [Generate Rust bindings for GIR based libraries](/gir/book/) provides the documentation for the tools that gtk-rs provides to generate such bindings.

## Apps built with gtk-rs

{% include featured_projects.html %}

{% include projects.html %}

## Sponsors

Thanks to everyone supporting us on [open collective][opencollective]! A list of all sponsors can be seen on our [open collective page][opencollective].

<!--
<ul class="sponsors">
    <li>
        <a href="https://www.embark-studios.com/">
            <img alt="Embark Studios" src="/images/embark.png">
            <div>Embark Studios</div>
            <div class="metal gold">Gold Sponsor</div>
        </a>
    </li>
    <li>
        <a href="https://opencollective.com/alistair">
            <img alt="Alistair" src="/images/alistair.png">
            <div>Alistair</div>
            <div class="metal bronze">Bronze Sponsor</div>
        </a>
    </li>
</ul>
-->

[opencollective]: https://opencollective.com/gtk-rs

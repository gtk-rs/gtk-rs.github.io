---
centered: true
layout: default
---

# Unlock the GNOME stack for Rust

The **gtk-rs** project provides safe bindings to the [Rust] language for fundamental libraries from the GNOME stack like [GLib], [Cairo], [GTK&nbsp;3][GTK] and [GTK&nbsp;4][GTK].
{: class="center"}

[Rust]: https://www.rust-lang.org
[GLib]: https://developer.gnome.org/glib
[GTK]: https://gtk.org
[Cairo]: https://cairographics.org/documentation/

{% include post_overview.html %}

[![Open Collective backers and sponsors](https://img.shields.io/opencollective/all/gtk-rs?color=%2399c9ff&label=Support%20us%20on%20open%20collective&logo=open-collective&logoColor=white&style=for-the-badge&labelColor=%233385ff)](https://opencollective.com/gtk-rs)
{: class="badgets"}

## Available crates

The following table contains the most popular crates of **gtk-rs**. More information on all existing crates is available under the corresponding links in the **Project** column in the table below.

{% include crates_legacy.html %}

<div class="special" markdown="1">

## The introductory book

<div class="with-logo" markdown="1">

{% include book.svg %}

Julian Hofer is writing a book titled [GUI development with Rust and GTK&nbsp;4][book]. We recommend both new and experienced **gtk-rs** users to have a look at it. While this book is targeted at people who want to develop GTK&nbsp;4 applications, it also covers more general aspects of the GNOME stack such as **GObject Concepts**, **The Main Event Loop** and **GSettings**.

[book]: /gtk4-rs/stable/book

</div>
</div>

## Sponsors

Thanks to everyone supporting us on [open collective][opencollective]! A list of all sponsors can be seen on our [open collective page][opencollective].

<ul class="sponsors">
    <li>
        <a href="https://opencollective.com/alistair">
            <img alt="Alistair" src="/images/alistair.png">
            <div>Alistair</div>
            <div class="metal bronze">Bronze Sponsor</div>
        </a>
    </li>
    <li>
        <a href="https://www.embark-studios.com/">
            <img alt="Embark Studios" src="/images/embark.png">
            <div>Embark Studios</div>
            <div class="metal gold">Gold Sponsor</div>
        </a>
    </li>
</ul>

[opencollective]: https://opencollective.com/gtk-rs

## Projects using gtk-rs

{% include projects.html %}

If you want your app to be added to this list, please create a [Pull Request](https://github.com/gtk-rs/gtk-rs.github.io/edit/master/_data/projects.json) for it.

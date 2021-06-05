---
layout: default
---

# Frequently Asked Questions

Here are some questions we answered a few times. If one is missing, don't hesitate to open an issue/pull request on the [repository](https://github.com/gtk-rs/gtk-rs.github.io) so it can be added later on.

## Why are releases so long?

The **Gtk-rs** organization is not just some **GNOME** libraries bindings in Rust but also an ecosystem. A change in a crate can force all other crates to be regenerated!

Also, please keep in mind that **Gtk-rs** members and contributors are doing it **freely** on their **free time**. That slows things down but at least, they're done. :)

## How are **Gtk-rs** maintained crates selected?

Currenlty we only add crates to the GTK-rs project that are required for the existing stack. A growing collection of other projects that are based on GTK-rs and gir can be found on the [GNOME GitLab](https://gitlab.gnome.org/World/Rust).

## I want more **Gtk-rs** examples!

You can find more examples in the corresponding respositories

- [gtk-rs-core/examples](https://github.com/gtk-rs/gtk-rs-core/tree/master/examples)
- [gtk3-rs/examples](https://github.com/gtk-rs/gtk3-rs/tree/master/examples)
- [gtk4-rs/examples](https://github.com/gtk-rs/gtk4-rs/tree/master/examples)

or have a look at the source code of the projects listed on our [start page](/#projects-using-gtk-rs).

## Why is documentation just a copy of the C one?

Considering the massive amount of documentation that would need to be written if we intended to do it ourselves (which is just impossible), we decided to reuse the C one directly. A few improvements are being performed (like generating links between types for instance) and a few more will come later on.

## Why isn't documentation directly into the source files and how can I have it locally?

Simple answer: because of license issues. **GNOME** is under **LGPL** whereas **Gtk-rs** is under **MIT**. If we included **GNOME** docs directly into the source code, we'd have to switch the license to match the **GNOME** one.

Currently, documentation is generated as follows:

 * When generating the crate, we also generate its documentation thanks to the GIR files.
 * Then we remove all that documentation (using the [rustdoc-stripper](https://github.com/GuillaumeGomez/rustdoc-stripper) tool) from the source files and move it into the [lgpl-docs](https://github.com/gtk-rs/lgpl-docs) repository.

If you want to have it locally, you'll have to run this command:

```sh
cargo install rustdoc-stripper
./generator.py --embed-docs
```

You will need rust nightly to build the docs.

```
cargo +nightly doc --features dox --no-deps --open
```

---
layout: default
---

# Frequently Asked Questions

Here are some questions we answered a few times. If one is missing, don't hesitate to open an issue/pull request on the [repository](https://github.com/gtk-rs/gtk-rs.github.io) so it can be added later on.

## Why are releases so long?

The **Gtk-rs** organization is not just some **GNOME** libraries bindings in Rust but also an ecosystem. A change in a crate can force all other crates to be regenerated!

Also, please keep in mind that **Gtk-rs** members and contributors are doing it **freely** on their **free time**. That slows things down but at least, they're done. :)

## How are **Gtk-rs** maintained crates selected?

This entirely depends on a few criterias:

 * Are they a lot of users asking for it?
 * Can it be generated using [gir](https://github.com/gtk-rs/gir)?
 * Is anyone interested into maintaining it?

As long as two of these criterias are fulfilled, we can move to the next step.

The crate is then proposed to the **Gtk-rs** members. If no one has objections or there are no particular technical issues on writing the binding for this crate, the work can start.

## I want more **Gtk-rs** examples!

Please open an issue on the [examples repository](https://github.com/gtk-rs/examples/).

## I didn't understand something and the tutorials don't talk about.

Open an issue on the [website](https://github.com/gtk-rs/gtk-rs.github.io) repository and please explain what you didn't understand, in which context and what you're trying to do. The more information we have, the better we'll be able to write the tutorial (if any required).

Also, it's always possible to come ask us directly. Take a look at the [Contact us](/docs-src/contact) page.

## Why is documentation just a copy of the C one?

Considering the massive amount of documentation that would need to be written if we intended to do it ourselves (which is just impossible), we decided to reuse the C one directly. A few improvements are being performed (like generating links between types for instance) and a few more will come later on.

## Why isn't documentation directly into the source files and how can I have it locally?

Simple answer: because of license issues.

Currently, documentation is generated as follows:

 * When generating the crate, we also generate its documentation thanks to the GIR files.
 * Then we remove all that documentation (using the [rustdoc-stripper](https://github.com/GuillaumeGomez/rustdoc-stripper) tool) from the source files and move it into the [lgpl-docs](https://github.com/gtk-rs/lgpl-docs) repository.

If you want to have it locally, you'll have to run this command:

```
cargo doc --features embed-lgpl-docs
```

Don't forget to add the version you're using currently (depending on the crate of course). For example:

```
cargo doc --features embed-lgpl-docs v3_22_20
```

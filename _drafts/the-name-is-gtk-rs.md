---
layout: post
author: gkoz
title: The name is Gtk-rs. Update your git urls!
categories: [front, org]
---

Our project formerly known as "rgtk" and "rust-gnome"[^name] has adopted
the name __Gtk-rs__ and we welcome you at our brand new website!

[^name]:
    Since we're not a part of GNOME, it was deemed inappropriate for us to use
    that name.

### The site

This site is going to be the place to get news about breaking changes
and development progress. We will post building instructions, examples, best
practices and crates documentation.

We're starting small though, with just an introduction and a blog. Everyone
is welcome to help us improve both the content and the design of this site by
opening PRs against the [gtk-rs.github.io] repo.

Whenever you `cargo update` the crates, check the [Announcements]
to learn about possible breakage. If you're interested in the internals
and development of these bindings, subscribe to the [blog].

### The GitHub organization

If you have cloned any of our repositories, you'll need to update
the organization name, which is a part of the url, to `gtk-rs`.
The following should be sufficient in most cases.

{% highlight bash %}
git remote -v | awk '/rust-gnome/ { \
    url = $2; \
    sub("/rust-gnome/", "/gtk-rs/", url); \
    print "git remote set-url origin " url " " $2 \
}' | sort -u | sh
{% endhighlight %}

[announcements]: {{ site.baseurl | prepend: site.url }}
[blog]: {{ "/blog" | prepend:site.baseurl | prepend: site.url }}
[gtk-rs.github.io]: https://github.com/gtk-rs/gtk-rs.github.io

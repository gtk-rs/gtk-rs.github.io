---
layout: default
---

# Requirements

The __gtk__ crate expects __GTK+__, __GLib__ and __Cairo__ development files to be installed on your system.

## Debian and Ubuntu

{% highlight bash %}
> sudo apt-get install libgtk-3-dev
{% endhighlight %}

## Fedora

{% highlight bash %}
> sudo dnf install gtk3-devel glib2-devel

### Fedora 21 and earlier
> sudo yum install gtk3-devel glib2-devel
{% endhighlight %}

## OS X

{% highlight bash %}
> brew install gtk+3
{% endhighlight %}

## Windows

Make sure you have the [GNU
ABI](https://www.rust-lang.org/downloads.html#win-foot) version of the rust
compiler installed. Since we need our own toolchain make sure to uncheck
"Linker and platform libraries" in the Rust setup.
![Screenshot](rust_setup.png)

If you already have installed Rust, check if your Rust installation has
`gcc.exe` and `ld.exe` in its `bin` directory. In that case remove those
executables, they will be provided by mingw instead. If you won't you'll
probably get a linking error `ld: cannot find -limm32`.

For the toolchain one has two possibilities:

 - Install msys2 with a mingw toolchain and the gtk3 package

 - Install the mingw-w64 toolchain separately and then install a GTK+ SDK

### msys2 toolchain

This method is recommended according to the [GTK+ project]
(http://www.gtk.org/download/windows.php). You can follow [this guide]
(https://blogs.gnome.org/nacho/2014/08/01/how-to-build-your-gtk-application-on-windows/)
or follow these steps:

 - Install and update [msys2](https://msys2.github.io/)
 - Install the mingw toolchain:

{% highlight bash %}
$ pacman -S mingw-w64-x86_64-toolchain
{% endhighlight %}

 - Install the gtk3 package:

{% highlight bash %}
$ pacman -S mingw-w64-x86_64-gtk3
{% endhighlight %}
 
Make sure that either `<your msys installation folder>\mingw32\bin` or `<your msys installation folder>\mingw64\bin` is in your `PATH` e.g. (if you have msys32 installed at `c:\msys32`, add `c:\msys32\mingw32\bin` or `c:\msys32\mingw64\bin` to your `PATH`).

### Separate mingw toolchain

Install [mingw-w64](http://mingw-w64.yaxm.org/) (select the win32 threading model) and download a __GTK+__ SDK:
 * The GNOME project hosts [distributions](http://win32builder.gnome.org/) of GTK+ 3.4 upto 3.10
 * [GTK+ for Windows Runtime Environment Installer: 64-bit](https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer) supports GTK+ 3.14, its SDK download links can currently be found [here](http://lvserver.ugent.be/gtk-win64/sdk/).

Make sure both mingw's and the sdk's `bin` directories are in your `PATH` e.g. (assuming mingw is installed in `C:\mingw-w64` and the SDK unpacked into `C:\gtk`)

{% highlight bat %}
C:\> set PATH="C:\mingw-w64\bin;C:\gtk\bin;%PATH%"
{% endhighlight %}

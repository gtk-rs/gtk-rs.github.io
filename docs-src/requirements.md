---
layout: default
---

# Requirements

The __gtk__ crate expects __GTK+__, __GLib__ and __Cairo__ development files to be installed on your system.

## Debian and Ubuntu

~~~bash
> sudo apt-get install libgtk-3-dev
~~~

## Fedora

~~~bash
> sudo dnf install gtk3-devel glib2-devel

### Fedora 21 and earlier
> sudo yum install gtk3-devel glib2-devel
~~~

## OS X

~~~bash
> brew install gtk+3 atk cairo gdk-pixbuf pango
~~~

## Windows

Make sure you have the [GNU ABI] version of the rust compiler installed.
Contrary to earlier instructions, **you don't need to uncheck "Linker and
platform libraries" in the Rust setup or delete `gcc.exe` and `ld.exe` in Rust's
`bin` directory.**

[GNU ABI]: https://www.rust-lang.org/downloads.html#win-foot

### Getting the GTK+ SDK

The GTK+ Project [recommends][gtk-download] using the GTK+ SDK provided by [MSYS2]:

[gtk-download]: http://www.gtk.org/download/windows.php
[MSYS2]: https://msys2.github.io/

 *  [Install MSYS2](https://sourceforge.net/p/msys2/wiki/MSYS2%20installation/).
    We're going to assume it's installed in `C:\msys2`. Adjust the path in the
    following steps if necessary.

 *  In the "MSYS2 Shell" install `libgtk3`.

     -    32-bit targets:

          ~~~bash
          > pacman -S mingw-w64-i686-gtk3
          ~~~

     -    64-bit targets:

          ~~~bash
          > pacman -S mingw-w64-x86_64-gtk3
          ~~~

If you prefer getting the SDK from [gtk-win64] or building it from source, set
the variables in the next section accordingly.

[gtk-win64]: https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer

### Using the native Windows shell

Back in the `cmd.exe` shell set the `GTK_LIB_DIR` and `PATH` environment
variables.

 *    32-bit targets:

      ~~~cmd
      C:\> SET GTK_LIB_DIR=C:\msys2\mingw32\lib
      C:\> SET PATH=%PATH%;C:\msys2\mingw32\bin
      ~~~

 *    64-bit targets:

      ~~~bat
      C:\> SET GTK_LIB_DIR=C:\msys2\mingw64\lib
      C:\> SET PATH=%PATH%;C:\msys2\mingw64\bin
      ~~~

If you're happy with these changes, make them permanent with
[`SETX`](https://technet.microsoft.com/en-us/library/cc755104.aspx):

~~~cmd
C:\> SETX GTK_LIB_DIR %GTK_LIB_DIR%
C:\> SETX PATH %PATH%
~~~

### Using the MSYS2 MinGW shell

Instead of setting the environment variables manually, you can let `pkg-config`
sort the paths out for you.

 *  In the "MSYS2 Shell" install the `mingw-w64` toolchain.

     -    32-bit targets:

          ~~~bash
          > pacman -S mingw-w64-i686-toolchain
          ~~~

     -    64-bit targets:

          ~~~bash
          > pacman -S mingw-w64-x86_64-toolchain
          ~~~

 *  Start the "MSYS2 MinGW Shell" (not to be confused with "MSYS2 Shell").

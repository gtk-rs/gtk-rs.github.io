---
layout: default
---

# Preparing rust

First install Rust normally with rustup. The next step will install the Windows toolchain.

    rustup target add x86_64-pc-windows-gnu

Then set up the target in `~/.cargo/config`.

    [target.x86_64-pc-windows-gnu]
    linker = "x86_64-w64-mingw32-gcc"
    ar = "x86_64-w64-mingw32-gcc-ar"

## Mingw and GTK installation

### Arch Linux

The mingw packages are in the AUR, you can either install manually or use a helper. These instructions use the pacaur helper. The packages take a while to compile.

    pacaur -S mingw-w64-gcc mingw-w64-freetype2-bootstrap mingw-w64-cairo-bootstrap
    pacaur -S mingw-w64-harfbuzz
    pacaur -S mingw-w64-pango
    pacaur -S mingw-w64-poppler
    pacaur -S mingw-w64-gtk3

### Fedora

Fedora provides pre-compiled Mingw and GTK packages through its repositories. Both 64 and 32 bits are available (`mingw64-*` vs `mingw32-*`), of which you probably want the 64 bits packages.

    dnf install mingw64-gcc mingw64-pango mingw64-poppler mingw64-gtk3 mingw64-winpthreads-static

### openSUSE

### Be advised that the windows:mingw:win64 project only provides mingw64-gtk3 at version 3.22-15, you will only be able to compile programs requiring GTK features v3_22-15 and lower.

openSUSE is similar to fedora with differences on the packages to install 

## Tumbleweed
    zypper addrepo https://download.opensuse.org/repositories/windows:mingw:win64/openSUSE_Tumbleweed/windows:mingw:win64.repo

## Leap 15.2
    zypper addrepo https://download.opensuse.org/repositories/windows:mingw:win64/openSUSE_Leap_15.2/windows:mingw:win64.repo

## Leap 15.1
    zypper addrepo https://download.opensuse.org/repositories/windows:mingw:win64/openSUSE_Leap_15.1/windows:mingw:win64.repo
    
    zypper refresh
    zypper in mingw64-gtk3-devel mingw64-cross-gcc

### Other distributions

GTK doesn't offer Windows binaries for download anymore, so for distributions that don't package their own Mingw-GTK packages, cross-compiling is much harder. In general the steps are:

1. Download 64 bit Mingw GTK libraries.
2. Unzip it in a folder. For example, to install it in `/opt/gtkwin`: `mkdir -p /opt/gtkwin && unzip <file.zip> -d /opt/gtkwin`.
3. You have to set-up the library to match the installation folder:

        cd /opt/gtkwin
        find -name '*.pc' | while read pc; do sed -e "s@^prefix=.*@prefix=$PWD@" -i "$pc"; done

Finding some place to download the libraries is the challenge however, and there is no ideal solution. Three options are: (1) Getting the most versions from the Fedora RPMs, which can be downloaded [here](https://pkgs.org/search/?q=mingw64); (2) Using the ancient GTK 3.6 available [here](http://www.tarnyko.net/dl/gtk.htm); (3) Delving into GTK's own [recommendations](https://www.gtk.org/docs/installations/windows) for Windows. Be sure to check your own distribution's repository first however.

## Compiling

Now create your project using gtk-rs (and relm, it's great). if you don't want a terminal window to pop up when running add the following to the top of your `main.rs`.

    #![windows_subsystem = "windows"]

Once you get it working on Linux you can compile for Windows following these steps. `PKG_CONFIG_PATH` should point to your Mingw's pkgconfig directory, while `MINGW_PREFIX` should point to Mingw's root installation. For Arch for example:

    export PKG_CONFIG_ALLOW_CROSS=1
    export MINGW_PREFIX=/usr/x86_64-w64-mingw32
    export PKG_CONFIG_PATH=$MINGW_PREFIX/lib/pkgconfig
    cargo build --target=x86_64-pc-windows-gnu --release

For Fedora Mingw's prefix is `/usr/x86_64-w64-mingw32/sys-root/mingw/`. For other distributions it is `/opt/gtkwin` or wherever you installed the precompiled binaries.

If you have some problems while compiling, you might want to consider rebooting since this has solved some problem on my side.
Also, you should be careful when using Glade with gtk-rs. Make sure that the version requested by Glade is at most equal to the version installed on your system. Otherwise it will fail to execute.

## Packaging

We will reuse the `MINGW_PREFIX` path here to copy over relevant files to package it up:

    mkdir /wherever/release
    cp target/x86_64-pc-windows-gnu/release/*.exe /wherever/release
    cp $MINGW_PREFIX/bin/*.dll /wherever/release
    mkdir -p /wherever/release/share/glib-2.0/schemas
    cp $MINGW_PREFIX/share/glib-2.0/schemas/gschemas.compiled /wherever/release/share/glib-2.0/schemas/gschemas.compiled
    cp -r $MINGW_PREFIX/share/icons /wherever/release/share/icons

After that you can zip up the contents of the `/wherever/release` folder and distribute it.

## Optional Extras

### Icon and version info

These steps are for adding an icon to your program. First make a rc file showing where the icon is and the version info. Change "path/to/my.ico" to your icon". The BLOCK "040904E4" and VALUE "Translation", 0x409, 1252 are for US english, if you would like something different refer to https://msdn.microsoft.com/library/aa381058

src/program.rc:

    id ICON "path/to/my.ico"
    1 VERSIONINFO
    FILEVERSION     1,0,0,0
    PRODUCTVERSION  1,0,0,0
    BEGIN
    BLOCK "StringFileInfo"
    BEGIN
        BLOCK "040904E4"
        BEGIN
            VALUE "CompanyName", "My Company Name"
            VALUE "FileDescription", "My excellent application"
            VALUE "FileVersion", "1.0"
            VALUE "InternalName", "my_app"
            VALUE "LegalCopyright", "My Name"
            VALUE "OriginalFilename", "my_app.exe"
            VALUE "ProductName", "My App"
            VALUE "ProductVersion", "1.0"
        END
    END
    BLOCK "VarFileInfo"
    BEGIN
        VALUE "Translation", 0x409, 1252
    END
    END

now to have the linker include it you'll need to make a build script, first add the following to your Cargo.toml:

    [package]
    build = "build.rs"

then in your build.rs

    use std::process::Command;
    use std::env;
    use std::path::Path;

    fn main() {
        let out_dir = env::var("OUT_DIR").unwrap();
        Command::new("x86_64-w64-mingw32-windres")
            .args(&["src/program.rc"])
            .arg(&format!("{}/program.o", out_dir))
            .status().unwrap();
        
        Command::new("x86_64-w64-mingw32-gcc-ar")
            .args(&["crus", "libprogram.a", "program.o"])
            .current_dir(&Path::new(&out_dir))
            .status().unwrap();

        println!("cargo:rustc-link-search=native={}", out_dir);
        println!("cargo:rustc-link-lib=static=program");
    }

You'll need to comment out both prints when building for linux.

### Windows 10 theme

If you'd like the program to have a more native look you can set the theme to windows 10.

    mkdir /wherever/release/share/themes
    mkdir /wherever/release/share/gtk-3.0

edit /wherever/release/share/gtk-3.0/settings.ini

    [Settings]
    gtk-theme-name = Windows10
    gtk-font-name = Segoe UI 10
    gtk-xft-rgba = rgb

then download the windows 10 them from [https://b00merang.weebly.com/windows-10.html](https://b00merang.weebly.com/windows-10.html).

    unzip Windows-10-master.zip
    mv Windows-10-master /wherever/release/share/themes/Windows10

<div class="footer">
<div><a href="glade">Glade</a>.</div>
<div><a href="/docs-src/tutorial">Going back to summary</a>.</div>
<div></div>
</div>

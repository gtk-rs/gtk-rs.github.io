---
layout: default
---

# Preparing rust

First install rust normally with rustup. The next step will install the windows toolchain.

    rustup target add x86_64-pc-windows-gnu

Then set up the target in ~/.cargo/config

    [target.x86_64-pc-windows-gnu]
    linker = "x86_64-w64-mingw32-gcc"
    ar = "x86_64-w64-mingw32-gcc-ar"

## Mingw and gtk Installation

### Arch Linux

The mingw packages are in the AUR, you can either install manually or use a helper. These instructions use the pacaur helper. The packages take a while to compile.

    pacaur -S mingw-w64-gcc mingw-w64-freetype2-bootstrap mingw-w64-cairo-bootstrap
    pacaur -S mingw-w64-harfbuzz
    pacaur -S mingw-w64-pango
    pacaur -S mingw-w64-poppler
    pacaur -S mingw-w64-gtk3

## Compiling

Now create your project using gtk-rs (and relm, it's great). if you don't want a terminal window to pop up when running add the following to the top of your main.rs.

    #![windows_subsystem = "windows"]

Once you get it working on linux you can compile for windows following these steps.

    export PKG_CONFIG_ALLOW_CROSS=1
    export PKG_CONFIG_PATH=/usr/i686-w64-mingw32/lib/pkgconfig
    cargo build --target=x86_64-pc-windows-gnu --release

## Packaging

Lastly to package it up.

    mkdir /wherever/release
    cp target/x86_64-pc-windows-gnu/release/*.exe /wherever/release
    cp /usr/x86_64-w64-mingw32/bin/*.dll /wherever/release
    mkdir -p /wherever/release/share/glib-2.0/schemas
    mkdir /wherever/release/share/icons
    cp /usr/x86_64-w64-mingw32/share/glib-2.0/schemas/* /wherever/release/share/glib-2.0/schemas
    cp -r /usr/x86_64-w64-mingw32/share/icons/* /wherever/release/share/icons

After that you can zip up the contents of the /wherever/release folder and distribute it.

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
            .args(&["whatever.rc"])
            .arg(&format!("{}/whatever.o", out_dir))
            .status().unwrap();
        
        Command::new("x86_64-w64-mingw32-gcc-ar")
            .args(&["crus", "libwhatever.a", "whatever.o"])
            .current_dir(&Path::new(&out_dir))
            .status().unwrap();

        println!("cargo:rustc-link-search=native={}", out_dir);
        println!("cargo:rustc-link-lib=static=whatever");
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

then download the windows 10 them from http://b00merang.weebly.com/windows-10.html.

    unzip Windows-10-master.zip
    mv Windows-10-master /wherever/release/share/themes/Windows10

<div class="footer">
<div><a href="/tuto/glade">Glade</a>.</div>
<div><a href="/docs-src/tutorial">Going back to summary</a>.</div>
<div></div>
</div>
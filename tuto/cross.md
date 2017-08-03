The package installation steps are for arch, but should be similar for other distros.

First install rust normally with rustup. The next step will install the windows toolchain.

    rustup target add x86_64-pc-windows-gnu

Then set up the target in ~/.cargo/config

    [target.x86_64-pc-windows-gnu]
    linker = "x86_64-w64-mingw32-gcc"
    ar = "x86_64-w64-mingw32-gcc-ar"

Now install mingw and gtk libraries, this will take a while

    pacaur -S mingw-w64-gcc mingw-w64-freetype2-bootstrap mingw-w64-cairo-bootstrap
    pacaur -S mingw-w64-harfbuzz
    pacaur -S mingw-w64-pango
    pacaur -S mingw-w64-poppler
    pacaur -S mingw-w64-gtk3

Now create your project using gtk-rs (and relm, it's great). if you don't want a terminal window to pop up when running add the following to the top of your main.rs.

    #![windows_subsystem = "windows"]

Once you get it working on linux you can compile for windows following these steps.

    export PKG_CONFIG_ALLOW_CROSS=1
    export PKG_CONFIG_PATH=/usr/i686-w64-mingw32/lib/pkgconfig
    cargo build --target=x86_64-pc-windows-gnu --release

Lastly to package it up.

    mkdir /wherever/release
    cp target/x86_64-pc-windows-gnu/release/*.exe /wherever/release
    cp /usr/x86_64-w64-mingw32/bin/*.dll /wherever/release
    mkdir -p /wherever/release/share/glib-2.0/schemas
    mkdir /wherever/release/share/icons
    cp /usr/x86_64-w64-mingw32/share/glib-2.0/schemas/* /wherever/release/share/glib-2.0/schemas
    cp -r /usr/x86_64-w64-mingw32/share/icons/* /wherever/release/share/icons

After that you can zip up the contents of the /wherever/release folder and distribute it.
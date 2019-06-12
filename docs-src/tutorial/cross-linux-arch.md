---
layout: default
---

# Crosscompiling on Linux

It's a good idea to test your application on arches other than what you have (usually x86_64), e.g. to ensure what your application also works on ARMv7/AArch64, which is used in some portable devices (e.g. the Librem phone).
This guide assumes that you use Debian/Ubuntu for your CI work, as it's somewhat simple to get crosscompiling working on these.

First we have to add the architecture we want to crosscompile to. Refer to [Debian's supported architectures page](https://wiki.debian.org/SupportedArchitectures) to see supported architectures.

~~~bash
> sudo dpkg --add-architecture armhf
~~~

This will install some base packages for `armhf`. Replace `armhf` with whatever arch you want to test (and be mindful to also replace it in the following commands!).

Next we have to install `gcc` for that arch to act as linker for Rust and `libgtk-3-dev` which we need to link our application against. We also need to install pkg-config in order for our build process to be able to discover gtk3.

~~~bash
> sudo apt-get install -y gcc-arm-linux-gnueabihf
> sudo apt-get install -y libgtk-3-dev:armhf
> sudo apt-get install pkg-config
~~~

Next up we have to add support for our target to Rust. Assuming you're using rustup it's as easy as:

~~~bash
> rustup target add armv7-unknown-linux-gnueabihf
~~~

Following that we have to set some environment variables:

~~~bash
> export PKG_CONFIG_ALLOW_CROSS=1 PKG_CONFIG_PATH=/usr/lib/arm-linux-gnueabihf/pkgconfig/ CARGO_BUILD_TARGET=armv7-unkown-linux-gnueabihf CARGO_TARGET_ARMV7_UNKOWN_LINUX_GNUEABIHF_LINKER=arm-linux-gnueabihf-gcc
~~~

the first two environment variables set the location of our `pkg-config` binary and allow crosscompiling with it. The third one sets what Rust target we're building for. The triplet has to match the one you've added previously with `rustup target add ...`. Finally, we have to set the linker for our crosstarget. Note that you can also set this in cargo's config file, but at least for CI work it's more convinient to work with environment variables. Refer to [cargo's documentation](https://doc.rust-lang.org/cargo/reference/config.html) for more info on that.

We're now all setup! Now it should be as easy as running `cargo build` to build your application.

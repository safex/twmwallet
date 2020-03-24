# twmwallet
wallet for interacting with safex cash and token and an interface to the world marketplace



## Releases

You can download the latest release from (https://github.com/safex/twmwallet/releases)
.


#### Linux

You should have NodeJS 13.8+ installed
```
installing nodejs 13 on Ubuntu
$ curl -sL https://deb.nodesource.com/setup_13.x | sudo bash -
$ sudo apt-get install -y nodejs
$ $ node -v
$ v13.1.0
```

```
$ sudo apt update && sudo apt install build-essential cmake pkg-config \
    libboost-all-dev libssl-dev libzmq3-dev libunbound-dev libminiupnpc-dev \
    libunwind8-dev liblzma-dev libreadline6-dev libldns-dev libexpat1-dev \
    libgtest-dev doxygen graphviz libpcsclite-dev
$ npm install
$ ./node_modules/.bin/electron-rebuild
$ npm run dev
```

#### MacOS

```
$ brew tap jmuncaster/homebrew-header-only
$ brew install cmake boost zmq czmq zeromq jmuncaster/header-only/cppzmq openssl pkg-config
$ npm install -g node-gyp
$ export LDFLAGS="-L/usr/local/opt/openssl/lib"
$ export CPPFLAGS="-I/usr/local/opt/openssl/include"
$ npm install
$ ./node_modules/.bin/electron-rebuild
$ npm run dev
```

#### Windows

Run Command Prompt as Administrator

```
$ npm install --global --production windows-build-tools
$ npm install
$ npm run dev
```
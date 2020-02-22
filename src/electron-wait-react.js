const net = require("net");
const port = process.env.PORT ? process.env.PORT - 100 : 8000;

process.env.ELECTRON_START_URL = `http://localhost:${port}`;

const client = new net.Socket();

let startedElectron = false;
const tryConnection = () =>
    client.connect({port: port}, () => {
        client.end();
        if (!startedElectron) {
            console.log("starting electron");
            startedElectron = true;
            const spawn = require("child_process").spawn;
            spawn("npm", ["run", "electron"], {stdio: "inherit"});
        }
    });

tryConnection();

client.on("error", error => {
    setTimeout(tryConnection, 1000);
});
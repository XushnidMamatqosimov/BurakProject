const path = require("node:path");
const fs = require("fs-extra");

async function copyAssets() {
    await Promise.all(
        ["views", "public"].map(directory => fs.copy(
            path.join(__dirname, "src", directory),
            path.join(__dirname, "dist", directory),
        )),
    );
    console.log("Production views and static assets copied to dist.");
}

copyAssets().catch(error => {
    console.error("Failed to copy production assets:", error);
    process.exitCode = 1;
});

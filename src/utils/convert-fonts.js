const fs = require("fs");
const path = require("path");

const fontsDir = path.join(__dirname, "");
const outputDir = fontsDir;

const fontFiles = fs.readdirSync(fontsDir).filter(file =>
    file.endsWith(".ttf") || file.endsWith(".otf")
);

if (fontFiles.length === 0) {
    console.log("❌ هیچ فونتی پیدا نشد.");
    process.exit(0);
}

fontFiles.forEach(file => {
    const fontPath = path.join(fontsDir, file);
    const fontData = fs.readFileSync(fontPath);
    const base64Font = fontData.toString("base64");

    const fontName = path.basename(file, path.extname(file)); // اسم بدون پسوند
    const outputPath = path.join(outputDir, `${fontName.toLowerCase()}-normal.js`);

    const jsContent = `
    const ${fontName}Normal = "${base64Font}";
    export default ${fontName}Normal;
  `;

    fs.writeFileSync(outputPath, jsContent.trim(), "utf8");
    console.log(`✅ تبدیل شد: ${file} → ${outputPath}`);
});

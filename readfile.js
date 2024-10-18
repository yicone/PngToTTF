const SVGIcons2SVGFontStream = require('svgicons2svgfont');
const fs = require('graceful-fs');
const path = require('path');
const ProgressBar = require('progress');

const fontName = 'MyFont';
const outputSVGFontPath = 'final_font/fontpico.svg'; // 輸出SVG字體的路徑
const inputFolder = 'pico'; // 包含SVG檔案的資料夾路徑

const fontStream = new SVGIcons2SVGFontStream({
  fontName: fontName,
});

const files = fs.readdirSync(inputFolder);

const progressBar = new ProgressBar('[:bar] :percent :etas', {
  total: files.length,
  width: 40,
});

console.time('Font Generation Time');

fontStream
  .pipe(fs.createWriteStream(outputSVGFontPath))
  .on('finish', function () {
    console.log('\nFont successfully created!');
    console.timeEnd('Font Generation Time');
  })
  .on('error', function (err) {
    console.error(err);
  });

/*
  逐一讀取資料夾中的SVG檔案，並將其加入字體流中
  這裡假設SVG檔案的檔名為单个汉字
  例如：龠.svg(U+9FA0)
  glyph.metadata = { unicode: ['龠'], name: 'icon_9FA0' }
*/
files.forEach((filename) => {
  if (path.extname(filename) === '.svg') {
    const baseFilename = path.basename(filename, ".svg");
    // 將文件名中的中文部分轉換為Unicode的十六進位表示
    const hexEncodedBaseFilename = baseFilename.replace(/[\u4E00-\u9FA5]/, function (c) {
      return c.charCodeAt().toString(16);
    });

    const name = 'icon_' + hexEncodedBaseFilename;
    const inputFilePath = path.join(inputFolder, filename);
    const glyph = fs.createReadStream(inputFilePath);
    glyph.metadata = { unicode: [baseFilename], name };
      fontStream.write(glyph);
  }
  progressBar.tick();
});

// 結束流
fontStream.end();

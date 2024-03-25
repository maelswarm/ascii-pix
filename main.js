const sharp = require('sharp');
let width = 32;
let height = 32;
let scale = 16;
let scaleX = 32;
let scaleY = 32;
let r, g, b;
const arr = [];
//const chars = ['.', ':', 'L', 'P', "O", '░', '▒', '@', '▓', "█"];
//const chars = ['.', ':', '░', '░', "▒", '▒', '▓', '▓', '█', "█"];
const chars = [':', '░', '▒', '▓', "█", '▓', '▒', '░', ':'];
const colors = {
    BgBlack: "\x1b[30m",
    BgRed: "\x1b[31m",
    BgGreen: "\x1b[32m",
    BgYellow: "\x1b[33m",
    BgBlue: "\x1b[34m",
    BgMagenta: "\x1b[35m",
    BgCyan: "\x1b[36m",
    BgWhite: "\x1b[37m",
    BgGray: "\x1b[90m"
}

const getColor = (r, g, b) => {
    if (r <= 85 && g <= 85 && b <= 85) {
        return colors.BgBlack;
    } else if (r > b && r > g) {
        return colors.BgRed;
    } else if (g > r && g > b) {
        return colors.BgGreen;
    } else if (r > b && g > b) {
        return colors.BgYellow;
    } else if (r < b && g < b) {
        return colors.BgBlue;
    } else if (r > g && b > g) {
        return colors.BgMagenta;
    } else if (g > r && b > r) {
        return colors.BgCyan;
    } else if (r > 170 && g > 170 && b > 170) {
        return colors.BgWhite;
    } else {
        return colors.BgGray;
    }
}

const loadImage = async (str) => {
    const a = sharp(str);
    return await a.raw().toBuffer({ resolveWithObject: true })
}

const print = async (data, info, rand) => {
    console.clear();
    for (let i = 0; i < Math.floor(data.length / (info.width * info.channels * scaleX)); ++i) {
        let str = '';
        for (let j = 0; j < Math.floor(info.width * info.channels / scaleY); ++j) {
            const val = chars[Math.floor((arr[i][j].val / (256 * 3)) * Math.abs(Math.sin(Math.PI * rand / 16) * 5 + 10)) % 9];
            str += `\x1B[38;2;${arr[i][j].r};${arr[i][j].g};${arr[i][j].b}m` + val;
        }
        process.stdout.write(str + '\n');
    }
    if(rand % 1 === 0) {
        chars.unshift(chars.pop());
    }
    setTimeout(() => {
        print(data, info, rand + 1);
    }, 0)
}

const compute = (data, info) => {
    scaleX = Math.floor(scale);
    scaleY = info.height > info.width ? Math.floor(scale * (info.height / info.width)) : Math.floor(scale * (info.width / info.height));
    let val = 0;
    for (let i = 0; i < Math.floor(data.length / (info.width * info.channels * scaleX)); ++i) {
        for (let j = 0; j < Math.floor(info.width * info.channels / scaleY); ++j) {
            r = 0;
            g = 0;
            b = 0;
            val = 0;
            for (let k = 0; k < scaleY; k += info.channels) {
                r += data[(i * info.width * info.channels * scaleX) + (j * scaleY) + k + 0];
                g += data[(i * info.width * info.channels * scaleX) + (j * scaleY) + k + 1];
                b += data[(i * info.width * info.channels * scaleX) + (j * scaleY) + k + 2];
                val += (data[(i * info.width * info.channels * scaleX) + (j * scaleY) + k + 0] + data[(i * info.width * info.channels * scaleX) + (j * scaleY) + k + 1] + data[(i * info.width * info.channels * scaleX) + (j * scaleY) + k + 2]);
            }
            if (!arr[i]) {
                arr[i] = [];
            }
            r = Math.floor(r / Math.max(scaleY / info.channels, 0));
            g = Math.floor(g / Math.max(scaleY / info.channels, 0));
            b = Math.floor(b / Math.max(scaleY / info.channels, 0));
            val = Math.floor(val / Math.ceil(scaleY / info.channels));
            arr[i][j] = { r, g, b, val };
        }
    }
}

const init = async () => {
    if (process.argv.length !== 4) {
        console.log("args: <filepath> <scale>")
    }
    const filepath = process.argv[2];
    scale = process.argv[3];
    const { data, info } = await loadImage(filepath);
    compute(data, info);
    print(data, info, 0);
}

init();
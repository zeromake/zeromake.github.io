const fse = require("fs-extra");

const transform = /transform="([a-z-]+\((\d+(\.\d+)? *,?)+\) *)+"/ig;
const translate = /translate\((\d+) *(\d+)\)/i;
const points = /points="((:?-?\d+(:?.\d+)?) *, *(:?-?\d+(:?.\d+)?) *)+"/g;
const text = /x="(-?\d+(.\d+)?)" *y="(-?\d+(.\d+)?)"/ig

const filename = process.argv[2];
console.log(filename);
const data = fse.readFileSync(filename, {encoding: "utf-8"})
const offst = {
    x: 0,
    y: 0,
}

const m = data.replace(transform, (sub) => {
    const m = sub.match(translate);
    if (m) {
        offst.x = +m[1];
        offst.y = +m[2];
    }
    return "";
});

const s = m.replace(points, (sub) => {
    const arr = sub.split("\"")[1].split(" ").map(i => {
        if (i.trim() === "") {
            return null;
        }
        return i.split(",").map(s => {
            return +s.trim()
        })
    }).filter(i => !!i);
    let str = "points=\"";
    str += arr.map(i => {
        i[0] += offst.x;
        i[1] += offst.y;
        return `${i[0]},${i[1]}`
    }).join(" ");
    return str + "\"";
})
const l = s.replace(text, (sub) => {
    const arr = sub.split("\"").map(i => i.trim()).filter(i => !!i);
    const x = +arr[1];
    const y = +arr[3];
    return `x="${offst.x + x}" y="${offst.y + y}"`
});

fse.writeFileSync(filename, l)

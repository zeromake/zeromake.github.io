let running = false;
/**
 *
 * @param {number} top
 * @param {number = 200} [time]
 * @param {number = 10} [delay]
 */
export default function scroll(top, time = 200, delay = 10) {
    if (running) {
        return;
    }
    running = true;

    let scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
    let offset = top - scrollTop;
    const down = offset > 0;
    if (!down) {
        offset = -offset;
    }

    if (~~offset <= 10) {
        document.documentElement.scrollTop = top;
        document.body.scrollTop = top;
        running = false;
        return;
    }

    let step = Math.ceil((offset * delay) / time);
    const target = down ? top - step : step;

    let timer = setInterval(() => {
        scrollTop =
            document.documentElement.scrollTop || document.body.scrollTop;
        const offset = down ? step + scrollTop : scrollTop - step;
        const flag =
            (!down && scrollTop <= target) || (down && scrollTop >= target);
        if (flag) {
            document.documentElement.scrollTop = top;
            document.body.scrollTop = top;
            running = false;
            clearInterval(timer);
        } else {
            document.documentElement.scrollTop = offset;
            document.body.scrollTop = offset;
        }
    }, delay);
}

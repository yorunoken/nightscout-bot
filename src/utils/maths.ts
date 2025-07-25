export function generateTimeIncrements(hours: number): number[] {
    let start: number;
    let step: number;

    if (hours <= 3) {
        step = 0.2;
        start = -Math.floor(hours * 5) * step;
    } else if (hours <= 6) {
        step = 0.5;
        start = -Math.floor(hours * 2) * step;
    } else if (hours <= 12) {
        step = 1;
        start = -hours;
    } else if (hours <= 24) {
        step = 2;
        start = -Math.floor(hours / 2) * step;
    } else {
        step = 4;
        start = -Math.floor(hours / 4) * step;
    }

    const increments = [];
    for (let t = start; t <= 0; t += step) {
        increments.push(t);
    }
    return increments;
}

export function shuffleArray<T>(array: Array<T>): Array<T> {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // @ts-ignore annoying piece of shit
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

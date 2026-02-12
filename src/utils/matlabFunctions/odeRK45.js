// RK45 ODE Solver (Runge-Kutta-Fehlberg method)
export const odeRK45 = (f, tspan, y0, options = {}) => {
    const { dt = 0.001, tol = 1e-6 } = options;
    const [t0, tf] = tspan;

    let t = t0;
    let y = [...y0];
    const T = [t];
    const Y = [y];

    while (t < tf) {
        let h = Math.min(dt, tf - t);
        let accepted = false;

        while (!accepted) {
            const k1 = f(t, y).map(v => h * v);
            const k2 = f(t + h / 4, y.map((yi, i) => yi + k1[i] / 4)).map(v => h * v);
            const k3 = f(t + 3 * h / 8, y.map((yi, i) => yi + 3 * k1[i] / 32 + 9 * k2[i] / 32)).map(v => h * v);
            const k4 = f(t + 12 * h / 13, y.map((yi, i) => yi + 1932 * k1[i] / 2197 - 7200 * k2[i] / 2197 + 7296 * k3[i] / 2197)).map(v => h * v);
            const k5 = f(t + h, y.map((yi, i) => yi + 439 * k1[i] / 216 - 8 * k2[i] + 3680 * k3[i] / 513 - 845 * k4[i] / 4104)).map(v => h * v);
            const k6 = f(t + h / 2, y.map((yi, i) => yi - 8 * k1[i] / 27 + 2 * k2[i] - 3544 * k3[i] / 2565 + 1859 * k4[i] / 4104 - 11 * k5[i] / 40)).map(v => h * v);

            const y4 = y.map((yi, i) => yi + 25 * k1[i] / 216 + 1408 * k3[i] / 2565 + 2197 * k4[i] / 4104 - k5[i] / 5);
            const y5 = y.map((yi, i) => yi + 16 * k1[i] / 135 + 6656 * k3[i] / 12825 + 28561 * k4[i] / 56430 - 9 * k5[i] / 50 + 2 * k6[i] / 55);

            const error = Math.max(...y5.map((v, i) => Math.abs(v - y4[i])));

            if (error < tol || h < 1e-10) {
                t += h;
                y = y5;
                T.push(t);
                Y.push([...y]);
                accepted = true;
            } else {
                h *= 0.5;
            }
        }
    }

    return { t: T, y: Y };
}

export default odeRK45;
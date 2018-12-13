const codes = {
  color: {
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    gray: [90, 39],
  },
};

const color = style => msg => `\u001B[${style[0]}m${msg}\u001B[${style[1]}m`;

export const black = color(codes.color.black);
export const red = color(codes.color.red);
export const green = color(codes.color.green);
export const yellow = color(codes.color.yellow);
export const blue = color(codes.color.blue);
export const magenta = color(codes.color.magenta);
export const cyan = color(codes.color.cyan);
export const white = color(codes.color.white);
export const gray = color(codes.color.gray);

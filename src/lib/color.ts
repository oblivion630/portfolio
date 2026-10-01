// Mix a hex colour toward white (amount > 0) or black (amount < 0).
export function shade(hex: string, amount: number) {
    const n = parseInt(hex.slice(1), 16);
    const target = amount > 0 ? 255 : 0;
    const mix = (c: number) => Math.round(c + (target - c) * Math.abs(amount));
    return `rgb(${mix(n >> 16)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`;
}

// Function to format the balance, remove trailing zeros
export const formatBalance = (value: number, decimals: number) => {
    const valueInDecimals = Number(value) / 10 ** decimals;
    const formatted = valueInDecimals.toFixed(decimals);
    return formatted.replace(/\.?0+$/, "");
};

export const isValidXorname = (input: string): boolean => {
    const regex = /^[a-z0-9]{64}$/;
    return regex.test(input);
};

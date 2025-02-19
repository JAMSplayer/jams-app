export const isValidXorname = (input: string): boolean => {
    const regex = /^[a-z0-9]{64}$/;
    return regex.test(input);
};

export const isValidPrivateKey = (input: string): boolean => {
    const regex = /^[0-9a-fA-F]{64}$/;
    return regex.test(input);
};

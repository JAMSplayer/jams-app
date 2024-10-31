const formatAddress = (address: string) => {
    if (address.length <= 20) return address;

    const start = address.slice(0, 10);
    const end = address.slice(-10);
    return `${start}...${end}`;
};

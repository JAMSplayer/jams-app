export const isValidPeerAddress = (address: string): boolean => {
    const pattern =
        /^\/?ip4\/(\d{1,3}\.){3}\d{1,3}\/udp\/\d{1,5}\/quic-v1\/p2p\/[A-Za-z0-9]{52}\/?$/;
    return pattern.test(address);
};

import { useEffect, useRef } from "react";
import blockies from "ethereum-blockies";

const Avatar = ({ address }: { address: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (address && canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
                const blockie = blockies.create({
                    seed: address,
                    size: 8,
                });
                canvasRef.current.width = blockie.width;
                canvasRef.current.height = blockie.height;
                ctx.drawImage(blockie, 0, 0);
            }
        }
    }, [address]);

    return <canvas ref={canvasRef} className="rounded-full" />;
};

export default Avatar;

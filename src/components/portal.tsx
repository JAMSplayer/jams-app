import ReactDOM from "react-dom";
import { ReactNode } from "react";

// a portal renders the UI outside the stacking context

interface PortalProps {
    children: ReactNode;
}

const Portal: React.FC<PortalProps> = ({ children }) => {
    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 mt-12">{children}</div>,
        document.body
    );
};

export default Portal;

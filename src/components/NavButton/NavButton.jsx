import {useNavigate} from "react-router-dom";
import {Button} from "antd";

export const NavButton = ({ to, children, type = "primary", className = "CardItem" ,ghost='true' }) => {
    const navigate = useNavigate();
    return (
        <Button
            ghost={ghost}
            type={type}
            className={className}
            onClick={() => navigate(to)}
        >
            {children}
        </Button>
    );
};


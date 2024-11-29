import { FC } from "react";
import { iconLibrary, IconLibrary } from "./iconLibrary";

type IconProps = {
    type: IconLibrary;
    size?: string | number;
    color?: string;
    weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
};

const Icon: FC<IconProps> = ({
    type,
    size = "1rem",
    color = "currentColor",
    weight = "regular",
}) => {
    const Icon = iconLibrary[type];
    return <Icon size={size} color={color} weight={weight} />;
};

export default Icon;

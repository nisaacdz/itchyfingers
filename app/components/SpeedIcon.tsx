import { CSSProperties } from "react";

type SpeedIconProps = {
    speed: number,
    styles?: CSSProperties
}

const SpeedIcon = ({ speed, styles }: SpeedIconProps) => {
    // draw a icon with speed value
    return (
        <Icon speed={speed} styles={styles}/>
    );
}

const Icon = ({ styles }: SpeedIconProps) => {
    return (
        <img src="/tortoise.svg" className="size-12" style={styles}/>
    )
}

export default SpeedIcon;
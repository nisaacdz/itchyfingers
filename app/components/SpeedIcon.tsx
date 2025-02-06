const SpeedIcon = ({ speed }: { speed: number}) => {
    // draw a icon with speed value
    return (
        <Icon speed={speed}/>
    );
}

const Icon = ({ speed }: { speed: number}) => {
    return (
        <img src="/tortoise.svg"/>
    )
}

export default SpeedIcon;
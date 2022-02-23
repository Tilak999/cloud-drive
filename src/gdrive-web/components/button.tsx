export default function Button(props) {
    return !props.hidden ? <button {...props}>{props.children}</button> : <></>;
}

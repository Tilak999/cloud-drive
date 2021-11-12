export default function Header(props) {
    return (
        <div className="bg-white w-full h-12 shadow py-3 px-4 z-10">
            {props.title}
        </div>
    );
}

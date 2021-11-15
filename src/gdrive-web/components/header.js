export default function Header(props) {
    return (
        <div className="bg-white w-full h-12 shadow py-3 px-4 z-10">
            <div className="font-semibold text-lg">
                <i className="bi bi-hdd-network mx-2"></i> {props.title}
            </div>
        </div>
    );
}

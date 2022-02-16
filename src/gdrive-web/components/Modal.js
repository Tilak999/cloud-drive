export default function Modal({ visible, children, title, onDismiss }) {
    return (
        visible && (
            <div
                className="bg-black/80 fixed top-0 left-0 h-full w-full z-50"
                style={{ margin: "0px" }}
            >
                <div className="rounded bg-white m-auto mt-20 max-h-[400px] w-full max-w-2xl overflow-y-auto">
                    <div className="text-lg py-4 border-b-2 pl-4 text-gray-700">
                        {title}
                        <div
                            className="float-right mx-4 hover:cursor-pointer"
                            onClick={() => onDismiss(false)}
                        >
                            <i className="bi bi-x" />
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        )
    );
}

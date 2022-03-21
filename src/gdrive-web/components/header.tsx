import ActiveTransfers from "./ActiveTransfers";
import StorageInfoBtn from "./StorageInfoBtn";

export default function Header({ title }) {
    return (
        <div className="bg-white w-full h-12 shadow z-10 flex flex-row justify-between">
            <div className="font-semibold sm:text-lg my-3 mx-2 sm:mx-4">
                <i className="bi bi-hdd-network hidden sm:inline-block sm:mx-2"></i>{" "}
                {title}
            </div>
            <div className="my-1 flex flex-row space-x-3 mr-2">
                <ActiveTransfers />
                <StorageInfoBtn className="hover:bg-green-100 py-2 px-3 rounded-lg bg-gray-100 text-sm" />
                <a
                    href="/api/logout"
                    className="hover:bg-green-100 py-2 px-2 rounded-lg bg-gray-100 text-sm"
                >
                    Logout
                </a>
            </div>
        </div>
    );
}

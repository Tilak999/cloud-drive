import axios from "axios";
import { useRouter } from "next/dist/client/router";
import { useRef, useState } from "react";
import { validateEmail } from "@lib/utils";
import notify from "@lib/notify";

export default function signup() {
    const fileInput = useRef(null);
    const [key, setKey] = useState({ name: null, text: null });
    const [message, setMessage] = useState<string>();
    const router = useRouter();

    const createKey = (e) => {
        e.preventDefault();
        setMessage(null);
        const email = e.target[0].value;
        const password = e.target[1].value;
        if (!email || !validateEmail(email))
            return setMessage("Invalid e-mail");
        if (!password) return setMessage("Password field can't be empty");
        if (!key.text) return setMessage("KeyFile is not selected");

        const notif = notify().withLoading("Logging in");
        axios
            .post("/api/createMasterKey", { email, password, key })
            .then((res) => {
                notif.success("Welcome..");
                router.push("/dashboard");
            })
            .catch((e) => {
                setMessage(e.response.data);
                notif.close();
            });
    };

    const onFileSelected = async () => {
        if (fileInput.current && fileInput.current.files) {
            const file = fileInput.current.files.item(0);
            setKey({
                name: file.name,
                text: await file.text(),
            });
        }
    };

    return (
        <div className="bg-gray-100 flex w-full h-screen">
            <div className="w-96 m-auto bg-white shadow-lg rounded-lg mt-28 py-6">
                <h1 className="text-xl text-center p-2 my-3">
                    Create credentials
                </h1>
                {message && (
                    <div className="bg-red-500 px-6 py-2 text-sm text-white">
                        <i className="bi bi-exclamation-triangle-fill mr-2"></i>
                        {message}
                    </div>
                )}
                <form className="w-full px-6 py-4" onSubmit={createKey}>
                    <div className="block text-gray-500 font-bold my-4">
                        Email
                    </div>
                    <input
                        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded block w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
                        id="inline-full-name"
                        type="text"
                        placeholder="john@gmail.com"
                    />

                    <div className="block text-gray-500 font-bold my-4">
                        Password
                    </div>
                    <input
                        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded block w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
                        id="inline-full-name"
                        type="password"
                        placeholder="*******"
                    />

                    <button
                        className="bg-gray-100 text-gray-600 text-center p-6 my-6 rounded inline-block w-full outline-dashed outline-slate-400"
                        onClick={() => fileInput.current.click()}
                    >
                        {key.name || "Upload Key File"}
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInput}
                            onChange={onFileSelected}
                        />
                    </button>

                    <div className="text-center">
                        <button
                            className="shadow bg-green-500 hover:bg-green-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
                            type="submit"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

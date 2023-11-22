import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    FormControl,
    FormLabel,
    Input,
    useBoolean,
    useDisclosure,
    useToast,
    VStack,
} from "@chakra-ui/react";
import axios, { AxiosError } from "axios";
import React, { useEffect, useRef, useState } from "react";
import { VscCloudUpload, VscFileCode, VscGear } from "react-icons/vsc";

export default function SettingsBtn({}) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useBoolean(false);
    const [form, setForm] = useState<any>({
        newpassword: null,
        confirm: null,
    });
    const cancelRef = useRef<HTMLButtonElement>(null);
    const fileInput = useRef<HTMLInputElement>(null);
    const toast = useToast();

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const save = async () => {
        if (form.newpassword != form.confirm) {
            return toast({
                title: "New password fields doesn't match",
                status: "error",
                position: "top",
            });
        }

        const files = fileInput.current?.files;
        let file = null;
        if (files && files.length > 0) {
            file = {
                name: files[0].name,
                text: await files[0].text(),
            };
        }

        try {
            setLoading.on();
            const { data } = await axios.post("/api/updateAccount", { ...form, key: file });
            toast({ title: data.message, status: "success", position: "top" });
            onClose();
        } catch (e: AxiosError | any) {
            toast({ title: e.response.data, status: "error", position: "top" });
        } finally {
            setLoading.off();
        }
    };

    const downloadKey = () => {
        window.location.href = "/api/downloadKey";
    };

    useEffect(() => {
        axios.get("/api/getLoggedInUser").then(({ data }) => {
            const input = document.getElementById("email") as HTMLInputElement;
            if (input) {
                input.value = data.email;
            }
        });
    }, [isOpen]);

    return (
        <>
            <Button leftIcon={<VscGear />} variant="ghost" onClick={onOpen}>
                Account
            </Button>
            <AlertDialog
                motionPreset="slideInBottom"
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isOpen={isOpen}
                isCentered
            >
                <AlertDialogOverlay />
                <AlertDialogContent m="3">
                    <AlertDialogHeader>Account</AlertDialogHeader>
                    <AlertDialogCloseButton />
                    <AlertDialogBody maxH={"450px"} overflowY="auto">
                        <FormControl>
                            <FormLabel mb="3">Change Email</FormLabel>
                            <Input
                                name="email"
                                type="email"
                                id="email"
                                placeholder="Email"
                                onChange={handleInput}
                            />
                        </FormControl>
                        <FormControl my="4">
                            <FormLabel mb="3">Change Password</FormLabel>
                            <VStack>
                                <Input
                                    name="current"
                                    id="current"
                                    type="password"
                                    placeholder="Current Password"
                                    onChange={handleInput}
                                />
                                <Input
                                    name="newpassword"
                                    id="newpassword"
                                    type="password"
                                    placeholder="New Password"
                                    onChange={handleInput}
                                />
                                <Input
                                    name="confirm"
                                    id="confirm"
                                    type="password"
                                    placeholder="Confirm Password"
                                    onChange={handleInput}
                                />
                            </VStack>
                        </FormControl>
                        <FormControl my="4">
                            <FormLabel mb="3">Manage MasterKey</FormLabel>
                            <div className="flex flex-row">
                                <Button
                                    leftIcon={<VscFileCode />}
                                    variant={"outline"}
                                    mr="1"
                                    onClick={downloadKey}
                                    className="flex-grow"
                                >
                                    Download Key File
                                </Button>
                                <Button
                                    leftIcon={<VscCloudUpload />}
                                    variant={"outline"}
                                    onClick={() => fileInput.current?.click()}
                                    className="flex-grow"
                                >
                                    Update Key File
                                </Button>
                                <input
                                    type="file"
                                    name="keyfile"
                                    className="hidden"
                                    ref={fileInput}
                                />
                            </div>
                        </FormControl>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button ml={3} onClick={save} colorScheme={"cyan"} isLoading={loading}>
                            Save
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

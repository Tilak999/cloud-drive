import Cookies from "cookies";
import crypto from "crypto";
import { NextApiRequest, NextApiResponse } from "next";

export function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return (
        (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) +
        " " +
        date.toLocaleString("default", { month: "short" }) +
        ", " +
        date.getFullYear()
    );
}

export function humanFileSize(size: number) {
    if (size == 0) return "0 B";
    let i = Math.floor(Math.log(size) / Math.log(1024));
    const sizeFmt = (size / Math.pow(1024, i)) * 1;
    return (`${sizeFmt.toFixed(2)} ` + ["B", "KB", "MB", "GB", "TB"][i]) as string;
}

export function validateEmail(email: string) {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
}

export function calcHash(somestring: string) {
    return crypto.createHash("md5").update(somestring).digest("hex").toString();
}

export function getToken(req: NextApiRequest, res: NextApiResponse) {
    const cookie = new Cookies(req, res);
    if (cookie.get("token") === "" || cookie.get("token") === null) {
        throw "UID token is missing..";
    } else {
        return cookie.get("token") || "";
    }
}

export function assertNotNull(param: any, message: string) {
    if (!param || param == null || typeof param === "undefined") {
        if (message) throw message;
        else return false;
    }
    return true;
}

export function assertNotEmpty(param: any, message?: string | null) {
    if (!param || param == null || typeof param === "undefined" || param.trim() === "") {
        if (message) throw message;
        else return false;
    }
    return true;
}

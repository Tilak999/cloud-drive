import { Children } from "react";

export default function If({ children, condition }) {
    return condition && children;
}

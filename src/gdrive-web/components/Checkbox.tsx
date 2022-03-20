import { useState } from "react";

export default function Checkbox({ onChange }) {
    const [checked, setChecked] = useState(false);
    return (
        <i
            className={"bi " + (checked ? "bi-check-square-fill" : "bi-square")}
            onClick={() => {
                onChange(!checked);
                setChecked(!checked);
            }}
        ></i>
    );
}

import React from "react";
import ActionBtn from "./ActionBtn";

export default function ReloadAction({onCompletion}) {
    return (
        <React.Fragment>
            <ActionBtn type="reload" onClick={onCompletion} />
        </React.Fragment>
    );
}
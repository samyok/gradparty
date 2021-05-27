// completed code for Alert and Confirm
import {
    Button,
    createMuiTheme,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    ThemeProvider
} from "@material-ui/core";
import {useEffect, FC, useRef} from 'react';
import ReactDOM from "react-dom";

const theme = createMuiTheme({
    palette: {
        type: "dark"
    }
});

// type of alert to trigger
enum AlertType {
    ALERT,
    CONFIRM
}

// extended with the type prop
export interface IAlertProps {
    message: string;
    title: string;
    type: AlertType;
}

const rootID = "alert-dialog";

// our promise to be stored for resolve on input
let returnResponse: (value: boolean) => void;

const AlertRoot: FC<IAlertProps> = (props) => {
    // include type
    const {message, title, type} = props;
    const root = useRef<HTMLDivElement | null>();

    useEffect(() => {
        let div = document.getElementById(rootID) as HTMLDivElement;
        root.current = div;
    }, [])

    function Close() {
        root.current?.remove();
    }

    // called on OK
    function Confirm() {
        // only resolve if confirm type
        if (type === AlertType.CONFIRM) {
            // returns true
            returnResponse(true);
        }
        Close();
    }

    // called on cancel/dismiss
    function Cancel() {
        // only resolve if confirm type
        if (type === AlertType.CONFIRM) {
            // returns false
            returnResponse(false);
        }
        Close();
    }

    return (
        <ThemeProvider theme={theme}>
            <Dialog
                // Cancel on dismiss
                onClose={() => Cancel()}
                open={true}
                disablePortal={true}
            >
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{message}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color={"secondary"}
                        // confirm on ok
                        onClick={() => Confirm()}
                    >
                        {"OK"}
                    </Button>
                    {/* only display cancel if confirm type */}
                    {
                        type === AlertType.CONFIRM &&
                        <Button
                            // cancel on cancel
                            onClick={() => Cancel()}
                        >
                            {"Cancel"}
                        </Button>
                    }
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}

// pass in alert type
function Create(message: string, title: string, type: AlertType = AlertType.ALERT) {
    let div = document.getElementById(rootID);
    if (!div) {
        div = document.createElement("div");
        div.id = rootID;
        document.body.appendChild(div);
    }

    ReactDOM.render(
        <AlertRoot
            message={message}
            title={title}
            type={type}
        />, div
    );
}

// new confirm method
export function Confirm(message: string, title: string = "Confirm") {
    // pass in type
    Create(message, title, AlertType.CONFIRM);
    // set our promise for resolve on input
    return new Promise<boolean>(resolve => {
        returnResponse = resolve;
    });
}

export function Alert(message: string, title: string = "Alert") {
    // pass in type
    Create(message, title, AlertType.ALERT);
}
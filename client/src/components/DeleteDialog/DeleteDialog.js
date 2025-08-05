import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function DeleteDialog({ id, open, handleClose, setDelDialog, delFunction }) {
    console.log({  setDelDialog, delFunction }); 
    return (
        <Dialog
            open={open}
            onClose={() => handleClose({ del: false, setDelDialog: setDelDialog })}
            aria-labelledby={`alert-delete-${id}`}
            aria-describedby={`alert-delete-${id}`}
        >
            <DialogTitle id={`alert-delete-${id}`}>
                {`Delete ${id}?`}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id={`alert-delete-${id}-description`}>
                    This will irreversibly delete the {id}.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant='contained' onClick={() => handleClose({ del: false, setDelDialog: setDelDialog })}
                >Cancel
                </Button>
                <Button color={'error'} variant='contained' autoFocus
                    onClick={() => handleClose({
                        del: true,
                        setDelDialog: setDelDialog,
                        delFunction: delFunction
                    })} >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
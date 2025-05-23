import * as React from 'react';

import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { FormHelperText } from '@mui/material';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function FileUpload({handleUpload, error, helperText}) {
  return (
    <><Button
      component="label"
      color={error ? "error" : "primary"}
      role={undefined}
      variant="contained"
      tabIndex={-1}
      startIcon={<CloudUploadIcon />}
    >
      Upload image
      <VisuallyHiddenInput
        type="file"
        name="uploadFile"
        accept='.jpg, .jpeg, .png'
        onChange={handleUpload}
        single />
    </Button>
    {error ? <FormHelperText sx={{ color: 'error.main' }}>{helperText}</FormHelperText> : null}
    </>
  );
}
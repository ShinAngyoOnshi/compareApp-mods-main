'use client'
import React, { useState } from 'react';

import * as XLSX from 'xlsx';
import { Parser } from '@json2csv/plainjs';

import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Grid from '@mui/system/Unstable_Grid';
import SendIcon from '@mui/icons-material/Send';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';
import { findRemovedRows, findAddedRows } from '../mmv/filters';

const DemoPaper = styled(Paper)(({ theme }) => ({
  width: 180,
  padding: theme.spacing(2),
  ...theme.typography.body2,
  textAlign: 'center',
}));

const Item = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  border: '1px solid',
  borderColor: theme.palette.mode === 'dark' ? '#444d58' : '#ced7e0',
  padding: theme.spacing(1),
  borderRadius: '4px',
  display:'flex',
}));

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



export default function Home() {
  const [tableDataOld, setTableDataOld] = useState([]);
  const [tableDataNew, setTableDataNew] = useState([]);
  const [oldFileName, setOldFileName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [csvCheck, setCsvCheck] = useState(true);
  const [xlsxCheck, setXlsxCheck] = useState(false);
  const [addedRowCheck, setAddedRowCheck] = useState(true);
  const [removedRowCheck, setRemovedRowCheck] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setErrorMessage] = useState(null);

  const importExcel = (e) => {
    setIsLoading(true);
    const inputId = e.target.id;
    const file = e.target.files[0];
    const fileName = e.target.files[0].name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    const allowedExtensions = ['xlsx', 'xls', 'csv'];

    if (!allowedExtensions.includes(fileExtension)) {
      console.log('Invalid file type');
      return;
    }

    if (inputId === 'old-uploader') {
      setOldFileName(fileName);
    } else {
      setNewFileName(fileName);
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const rows = content.split('\n').map((line) => line.split('\t'));

        extractData(rows, inputId);
      } catch (error) {
        setErrorMessage(`Si è verificato un errore nell'importazione del file. Assicurati che il formato sia corretto.`);
        console.error(`Si è verificato un errore nell'importazione del file:`, error);
      } finally {
        setIsLoading(false);
      }
    }
    reader.readAsText(file);
  };

  const processRowsInBackground = async () => {
    setIsLoading(true);

    try {
      setIsLoading(true);
      console.log('Inizio ricerca righe rimosse...');
      const removedRows = await findRemovedRows(tableDataOld, tableDataNew);
      console.log('Fine ricerca righe rimosse.');

      console.log('Inizio ricerca righe aggiunte...');
      const addedRows = await findAddedRows(tableDataOld, tableDataNew);
      console.log('Fine ricerca righe aggiunte.');

      return [removedRows, addedRows]
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(
        `Si è verificato un errore durante l'elaborazione. Assicurati che tutto sia correttamente configurato.`
      );
      console.error(`Si è verificato un errore durante l'elaborazione:`, error);
    }
  };
  const runProcess = async () => {
    setIsLoading(true);
    setTimeout(async () => {
      const [removedRows, addedRows] = await processRowsInBackground()

      try {
        if (xlsxCheck) {
          if (removedRowCheck) {
            const wsRemoved = XLSX.utils.json_to_sheet(removedRows);
            const wbRemoved = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wbRemoved, wsRemoved, 'removedRows');
            await XLSX.writeFile(wbRemoved, 'removedRowsMMV.xlsx');
          }

          if (addedRowCheck) {
            const wsAdded = XLSX.utils.json_to_sheet(addedRows);
            const wbAdded = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wbAdded, wsAdded, 'addedRows');
            await XLSX.writeFile(wbAdded, 'addedRowsMMV.xlsx');
          }
        }

        if (csvCheck) {
          const parser = new Parser();
          if (removedRowCheck) {
            const csvRemoved = parser.parse(removedRows);
            const blobRemoved = new Blob([csvRemoved], {
              type: 'text/csv'
            });
            const urlRemoved = window.URL.createObjectURL(blobRemoved);
            const aRemoved = document.createElement('a');
            aRemoved.href = urlRemoved;
            aRemoved.download = 'removedRowsMMV.csv';
            aRemoved.click();
            window.URL.revokeObjectURL(urlRemoved);
          }

          if (addedRowCheck) {
            const csvAdded = parser.parse(addedRows);
            const blobAdded = new Blob([csvAdded], {
              type: 'text/csv'
            });
            const urlAdded = window.URL.createObjectURL(blobAdded);
            const aAdded = document.createElement('a');
            aAdded.href = urlAdded;
            aAdded.download = 'addedRowsMMV.csv';
            aAdded.click();
            window.URL.revokeObjectURL(urlAdded);
          }
        }
      } catch (error) {
        setErrorMessage(
          `Si è verificato un errore durante l'elaborazione. Assicurati che tutto sia correttamente configurato.`
        );
        console.error(`Si è verificato un errore durante l'elaborazione:`, error);
      } finally {
        setIsLoading(false);
      }
    }, 2000);
  };

  function extractData(rows, inputId) {
    if (inputId === 'old-uploader') {
      setTableDataOld(rows);
    } else {
      setTableDataNew(rows);
    }
  }

  return (
    <>
     {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent:'center',
            '& > :not(style)': {
              m: 1,
            },
          }}
        >
          <DemoPaper variant="elevation">
            MMV
          </DemoPaper>
        </Box>
        <Box mb={3} >
        <Stack direction="row" spacing={2}>
          <Box>
            <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
              Upload Old file
              <VisuallyHiddenInput type="file" onChange={importExcel} id="old-uploader"  />
            </Button>
            <Typography variant="caption" display="block" gutterBottom>
              {oldFileName}
            </Typography>
          </Box>
          <Box>
            <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
              Upload New file
              <VisuallyHiddenInput type="file"  onChange={importExcel} id="new-uploader"  />
            </Button>
            <Typography variant="caption" display="block" gutterBottom>
              {newFileName}
            </Typography>
          </Box>
        </Stack>
        </Box>
        <Box>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid xs={6}>
            <Item>
            <input
                    type="checkbox"
                    id="added"
                    name="added"
                    checked={addedRowCheck}
                    onChange={() => {
                      setAddedRowCheck(!addedRowCheck);
                    }}
                    style={{ marginRight: 20 }}
                  />
                  <label htmlFor="added">Added Rows</label>
            </Item>
          </Grid>
          <Grid xs={6}>
            <Item>
            <input
                    type="checkbox"
                    id="removed"
                    name="removed"
                    checked={removedRowCheck}
                    onChange={() => {
                      setRemovedRowCheck(!removedRowCheck);
                    }}
                    style={{ marginRight: 20 }}
                  />
                  <label htmlFor="removed">Removed Rows</label>
            </Item>
          </Grid>
        </Grid>
        </Box>
        <Box>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid xs={6}>  
            <Item>
              <input
              type="checkbox"
              id="xlsx"
              name="xlsx"
              checked={xlsxCheck}
              onChange={() => {
                setXlsxCheck(!xlsxCheck);
              }}
              style={{ marginRight: 20 }}
            />
              <label htmlFor="xlsx">XLSX</label>
            </Item>
          </Grid>
          <Grid xs={6}>  
            <Item>
              <input
                type="checkbox"
                id="csv"
                name="csv"
                checked={csvCheck}
                onChange={() => {
                  setCsvCheck(!csvCheck);
                }}
                style={{ marginRight: 20 }}
              />
              <label htmlFor="csv">CSV</label>
            </Item>
          </Grid>
        </Grid>
        </Box>
        <Stack mt={2} direction="row" spacing={2}>
          <Button onClick={runProcess} variant="contained" endIcon={<SendIcon />}>
            Run Process
          </Button>
        </Stack>
      </Box>
    </>
  );
}
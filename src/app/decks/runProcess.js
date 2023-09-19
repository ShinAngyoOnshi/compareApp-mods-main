export const runProcess = async () => {
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
    }, 1000);
  };

  export const convertToJson = async (headers, data) => {
    const rows = [];
    data.forEach(async (row) => {
      let rowData = {};
      row.forEach(async (element, index) => {
        rowData[headers[index]] = element;
      });
      rows.push(rowData);
    });
    return rows;
  };

  export const importExcel = (e) => {
    const inputId = e.target.id;
    const file = e.target.files[0];
    const fileName = e.target.files[0].name;
    if (inputId === 'old-uploader') {
      setOldFileName(fileName);
    } else {
      setNewFileName(fileName);
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target.result;
      const workBook = XLSX.read(bstr, { type: 'binary' });
      extractData(workBook, inputId);
      const workSheetName = workBook.SheetNames[0];
      const workSheet = workBook.Sheets[workSheetName];
      const fileData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
      const headers = fileData[0];
      fileData.splice(0, 1);
      convertToJson(headers, fileData);
    };
    reader.readAsBinaryString(file);
  };

  export const findRemovedRows = (tableDataOld, tableDataNew) => {
    return tableDataOld.filter((oldRow) =>
      !tableDataNew.some((newRow) => newRow.Field5_links === oldRow.Field5_links)
    );
  }

  export const findAddedRows = (tableDataOld, tableDataNew) => {
    return tableDataNew.filter((newRow) =>
      !tableDataOld.some((oldRow) => oldRow.Field5_links === newRow.Field5_links)
    );
  }
export function findRemovedRows(tableDataOld, tableDataNew) {
    return tableDataOld.filter((oldRow) =>
      !tableDataNew.some((newRow) =>  newRow[6] === oldRow[6])
    );
  }

export function findAddedRows(tableDataOld, tableDataNew) {
    return tableDataNew.filter((newRow) =>
      !tableDataOld.some((oldRow) => oldRow[6] === newRow[6])
    );
  }
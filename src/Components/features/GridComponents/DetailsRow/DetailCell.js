import React from 'react';

import {
    TableRowDetail
} from '@devexpress/dx-react-grid-bootstrap4';

const DetailCell = ({
    children, changeRow, editingRowIds, addedRows, processValueChange,
    applyChanges, cancelChanges,
    ...restProps
}) => {
    const { row } = restProps;
  
    return (
      <TableRowDetail.Cell {...restProps}>
        {React.cloneElement(children, {
          row, changeRow, processValueChange, applyChanges, cancelChanges,
        })}
      </TableRowDetail.Cell>
    );
};

export default DetailCell;
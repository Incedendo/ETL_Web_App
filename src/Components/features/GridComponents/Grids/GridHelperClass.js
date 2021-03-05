import React, { useState } from 'react';

import {
  Table, TableEditColumn, TableEditRow
} from '@devexpress/dx-react-grid-bootstrap4';

export const getRowId = row => row.id;

export const getCellValue = (row, columnName) => {
  return row[columnName]
}

//Dropdown Cell Component (Select)
export const LookupEditCell = ({
  column, availableColumnValues, value, onValueChange,
}) => (
    <td
      style={{
        verticalAlign: 'middle',
        padding: 1,
      }}
    >
      <select
        className="form-control"
        style={{ width: '100%', textAlign: column.align }}
        value={value}
        onChange={e => onValueChange(e.target.value)}
      >
        {availableColumnValues.map(val => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </select>
    </td>
  );

const HighlightedCell = ({ value, row, style, ...restProps }) => (
  <Table.Cell
    {...restProps}
    style={{
      backgroundColor: row.PRIVILEGE === 'READ ONLY' ? '#F8F8F8	' : '#99FFFF',
      ...style,
    }}
  >
    <span
      style={{
        // color: row.PRIVILEGE === 'READ ONLY' ? 'white' : 'black',
        color: 'black',
      }}
    >
      {value}
    </span>
  </Table.Cell>
);

export const Cell = (props) => {
  // console.log('==================')
  // console.log(props);
  const { column } = props;
  if (column.name === 'PRIVILEGE') {
    return <HighlightedCell {...props} />;
  }
  return <Table.Cell {...props} />;
};

const CommandButton = ({ privilege, onExecute, icon, text, hint, color }) =>{
  // console.log('Command button: ', text, ' ---> ', privilege);
  return (
    <button
      type="button"
      className="btn btn-link"
      style={{ padding: 11 }}
      onClick={(e) => {
        onExecute();
        e.stopPropagation();
      }}
      title={hint}
      disabled={privilege.PRIVILEGE === 'READ ONLY'}
    >
      <span className={color || 'undefined'}>
        {icon ? <i className={`oi oi-${icon}`} style={{ marginRight: text ? 5 : 0 }} /> : null}
        {text}
      </span>
    </button>
  );
}

const AddButton = ({ onExecute, privilege }) => {
  // console.log('add button: ', privilege);
  return(
    <CommandButton icon="plus" hint="Create new row" onExecute={onExecute} privilege={privilege} />
  );
}

const EditButton = ({ onExecute, privilege }) => {
  // console.log('Edit button: ', row);
  return(
    <CommandButton icon="pencil" hint="Edit row" color="text-warning" onExecute={onExecute} privilege={privilege} />
  );
}

const DeleteButton = ({ onExecute, privilege }) => (
  <CommandButton
    icon="trash"
    hint="Delete row"
    color="text-danger"
    onExecute={() => {
      // eslint-disable-next-line
      if (window.confirm('Are you sure you want to delete this row?')) {
        onExecute();
      }
    }}
    privilege={privilege}
  />
);

const CommitButton = ({ onExecute, privilege  }) => (
  <CommandButton icon="check" hint="Save changes" color="text-success" onExecute={onExecute} privilege={privilege}/>
);

const CancelButton = ({ onExecute, privilege  }) => (
  <CommandButton icon="x" hint="Cancel changes" color="text-danger" onExecute={onExecute} privilege={privilege}/>
);

const commandComponents = {
  add: AddButton,
  edit: EditButton,
  delete: DeleteButton,
  commit: CommitButton,
  cancel: CancelButton,
};
 
export const CommandColumnCell = ({ children, row, ...restProps }) => {
  return (
    <TableEditColumn.Cell {...restProps}>
      {React.Children.map(children, child =>
        child !== null ? React.cloneElement(child, { row }) : null
      )}
    </TableEditColumn.Cell>
  );
}

export const Command = ({ id, onExecute, row, ...restProps }) => {
  // console.log(id);
  // console.log(row);
  const ButtonComponent = commandComponents[id];

  // if (id === 'edit') {
    return (
      <ButtonComponent
        onExecute={onExecute}
        privilege={row}
        {...restProps}
      />
    );
  // }
  // else {
  //   return (
  //     <ButtonComponent
  //       onExecute={onExecute}
  //       privilege={{ privilege: "Not Edit Row" }}
  //       {...restProps}
  //     />
  //   )
  // }

  
};

export const NumberEditor = ({ value, onValueChange }) => {
  const handleChange = (event) => {
    const { value: targetValue } = event.target;
    if (targetValue.trim() === '') {
      onValueChange();
      return;
    }
    onValueChange(parseInt(targetValue, 10));
  };
  
  return (
    <input
      className="form-control text-right"
      type="number"
      placeholder="Filter..."
      value={value === undefined ? '' : value}
      min={0}
      onChange={handleChange}
    />
  );
};


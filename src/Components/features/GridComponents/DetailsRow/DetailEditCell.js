import React from 'react';
import {
  Plugin, Template, TemplateConnector, TemplatePlaceholder, Action,
} from '@devexpress/dx-react-core';

import {
  TableRowDetail,
} from '@devexpress/dx-react-grid-bootstrap4';

const DetailEditCell = () => (
  <Plugin name="detailEdit">
    <Action
      name="toggleDetailRowExpanded"
      action={({ rowId }, { expandedDetailRowIds }, { startEditRows, stopEditRows }) => {
        const rowIds = [rowId];
        const isCollapsing = expandedDetailRowIds.indexOf(rowId) > -1;
        if (isCollapsing) {
          stopEditRows({ rowIds });
        } else {
          startEditRows({ rowIds });
        }
      }}
    />
    <Template
      name="tableCell"
      predicate={({ tableRow }) => tableRow.type === TableRowDetail.ROW_TYPE}
    >
      {params => (
        <TemplateConnector>
          {({
            tableColumns,
            createRowChange,
            rowChanges,
          }, {
            changeRow,
            commitChangedRows,
            cancelChangedRows,
            toggleDetailRowExpanded,
          }) => {
            if (tableColumns.indexOf(params.tableColumn) !== 0) {
              return null;
            }
            const { tableRow: { rowId } } = params;
            const row = { ...params.tableRow.row, ...rowChanges[rowId] };

            const processValueChange = ({ target: { name, value } }) => {
              const changeArgs = {
                rowId,
                change: createRowChange(row, value, name),
              };
              changeRow(changeArgs);
            };

            const applyChanges = () => {
              toggleDetailRowExpanded({ rowId });
              commitChangedRows({ rowIds: [rowId] });
            };
            const cancelChanges = () => {
              toggleDetailRowExpanded({ rowId });
              cancelChangedRows({ rowIds: [rowId] });
            };

            return (
              <TemplatePlaceholder params={{
                ...params,
                row,
                tableRow: {
                  ...params.tableRow,
                  row,
                },
                changeRow,
                processValueChange,
                applyChanges,
                cancelChanges,
              }}
              />
            );
          }}
        </TemplateConnector>
      )}
    </Template>
  </Plugin>
);

export default DetailEditCell;
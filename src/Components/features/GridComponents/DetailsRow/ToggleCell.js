import React from 'react';
import classNames from 'clsx';

const ToggleCell = ({
  expanded, onToggle,
  tableColumn, tableRow, row, style,
  ...restProps
}) => {
  const handleClick = (e) => {
    e.preventDefault();
    onToggle();
  };
  return (
    <td
      style={{
        cursor: 'pointer',
        verticalAlign: 'middle',
        textAlign: 'center',
        ...style,
      }}
      {...restProps}
    >
      <i
        role="button"
        tabIndex={0}
        aria-label={expanded ? 'Close' : 'Edit'}
        className={classNames({
          oi: true,
          'oi-x': expanded,
          'oi-pencil': !expanded,
        })}
        onClick={handleClick}
      />
    </td>
  );
};

export default ToggleCell;